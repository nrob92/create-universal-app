
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
  })
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No stripe-signature header found', { status: 400 })
  }

  let event

  try {
    const body = await req.text()
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') as string
    )
  } catch (err: any) {
    console.log(`❌ Webhook Error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  console.log(`🔔 Received event: ${event.type}`)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    )

    const userId = session.client_reference_id
    if (!userId) {
      console.error('❌ No client_reference_id (userId) in session')
      return new Response('Missing client_reference_id', { status: 400 })
    }

    // Map Stripe status to our DB status
    // Stripe statuses: trialing, active, incomplete, incomplete_expired, past_due, canceled, unpaid
    // Our statuses: active, trialing, past_due, canceled, inactive
    let status = 'active'
    if (session.payment_status === 'unpaid') status = 'past_due'
    if (session.status === 'canceled') status = 'canceled'
    if (session.status === 'trialing') status = 'trialing'

    // We need to fetch the subscription details from Stripe if we only have the session
      // to get the actual period start/end and plan info.
    let subscription;
    let tier = null;

    if (session.subscription) {
      subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
        expand: ['plan.product'], // Expand to get product details
      });
      // Extract tier from product name or metadata if available
      const productName = (subscription.plan as any)?.product?.name;
      console.log('Product Name from Stripe:', productName);

      if (productName) {
        if (productName.includes('Basic')) tier = 'basic';
        else if (productName.includes('Pro')) tier = 'pro';
        else if (productName.includes('Premium')) tier = 'premium';
      }
    }

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status: status,
        provider: 'stripe',
        provider_subscription_id: session.subscription,
        current_period_start: subscription ? new Date(subscription.current_period_start * 1000).toISOString() : new Date().toISOString(),
        current_period_end: subscription ? new Date(subscription.current_period_end * 1000).toISOString() : new Date().toISOString(),
        cancel_at: subscription?.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        tier: tier, // Add the tier here
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('❌ Error updating subscription:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    console.log(`✅ Subscription updated for user: ${userId}`)
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
