
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!secretKey) throw new Error('STRIPE_SECRET_KEY is missing');

    const stripe = new Stripe(secretKey, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const body = await req.json()
    const { priceId, successUrl, cancelUrl, userId, email } = body

    if (!priceId) throw new Error('Missing priceId')
    if (!userId) throw new Error('Missing userId')

    console.log(`Creating customer for user: ${userId}`)

    // 1. Create a Stripe Customer first (required for Accounts V2 Test Mode)
    // In a real app, you'd check if one exists in your DB first to avoid duplicates.
    const customer = await stripe.customers.create({
      email: email || undefined,
      metadata: {
        supabase_user_id: userId,
      },
    })

    console.log(`Created customer: ${customer.id}`)

    // 2. Create Session with the Customer ID
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
    })

    console.log(`Checkout session created: ${session.id}`)

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
