import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';

const isWindows = process.platform === 'win32';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Helper to find the stripe executable path
function getStripeCommand() {
  try {
    execSync('stripe --version', { stdio: 'ignore' });
    return 'stripe';
  } catch (e) {
    if (isWindows) {
      const homeStripe = path.join(os.homedir(), 'stripe.exe');
      if (fs.existsSync(homeStripe)) {
        return `"${homeStripe}"`;
      }
    }
  }
  return null;
}

function runCommand(cmd, stripeCmd) {
  try {
    const fullCmd = cmd.replace(/^stripe /, `${stripeCmd} `);
    const result = execSync(fullCmd, { stdio: 'pipe' }).toString();
    return result;
  } catch (error) {
    if (error.stderr) {
      console.error(`\n❌ Error running command: ${cmd}`);
      console.error(`Details: ${error.stderr.toString()}`);
    }
    return null;
  }
}

async function main() {
  console.log('\n💳 Setting up Stripe for your project...');

  const stripeCmd = getStripeCommand();
  if (!stripeCmd) {
    console.log('\n❌ Stripe CLI is not installed (or not found in your PATH).');
    console.log('Please install it first: https://docs.stripe.com/stripe-cli');
    process.exit(1);
  }
  console.log('✅ Stripe CLI found.');

  console.log('Checking Stripe login status...');
  const me = runCommand('stripe account', stripeCmd);
  if (!me) {
    console.log('\n⚠️ You are not logged into Stripe.');
    console.log('Running stripe login... (Browser will open)');
    try {
      execSync(`${stripeCmd} login`, { stdio: 'inherit' });
    } catch (e) {
      console.log('\n❌ Login failed or cancelled.');
      rl.close();
      process.exit(1);
    }
  } else {
    console.log('✅ Logged into Stripe.');
  }

  const products = [
    { name: 'Basic Plan', description: 'Access to essential features', unit_amount: 999, env_key: 'EXPO_PUBLIC_STRIPE_PRICE_BASIC_ID' },
    { name: 'Pro Plan', description: 'Unlock all premium features', unit_amount: 1999, env_key: 'EXPO_PUBLIC_STRIPE_PRICE_PRO_ID' },
    { name: 'Premium Plan', description: 'Everything in Pro, plus priority support', unit_amount: 4999, env_key: 'EXPO_PUBLIC_STRIPE_PRICE_PREMIUM_ID' },
  ];

  const priceIds = {};

  for (const product of products) {
    console.log(`\n📦 Creating "${product.name}" product in Stripe...`);
    const productOutput = runCommand(
      `stripe products create -d name="${product.name}" -d description="${product.description}"`, 
      stripeCmd
    );
    
    if (!productOutput) {
      console.log(`❌ Failed to create Stripe product: ${product.name}. Please check your Stripe CLI permissions.`);
      rl.close();
      process.exit(1);
    }

    const productMatch = productOutput.match(/"id":\s*"([^"]+)"/);
    const productId = productMatch ? productMatch[1] : null;

    if (!productId) {
      console.log(`❌ Could not parse Product ID for ${product.name} from Stripe output.`);
      rl.close();
      process.exit(1);
    }
    console.log(`✅ Product created: ${productId}`);

    console.log(`💰 Creating $${(product.unit_amount / 100).toFixed(2)}/month price for "${product.name}"...`);
    const priceOutput = runCommand(
      `stripe prices create -d product=${productId} -d unit_amount=${product.unit_amount} -d currency=usd -d "recurring[interval]=month"`, 
      stripeCmd
    );
    
    if (!priceOutput) {
      console.log(`❌ Failed to create Stripe price for ${product.name}.`);
      rl.close();
      process.exit(1);
    }

    const priceMatch = priceOutput.match(/"id":\s*"([^"]+)"/);
    const priceId = priceMatch ? priceMatch[1] : null;

    if (!priceId) {
      console.log(`❌ Could not parse Price ID for ${product.name} from Stripe output.`);
      rl.close();
      process.exit(1);
    }
    console.log(`✅ Price created: ${priceId}`);
    priceIds[product.env_key] = priceId;
  }

  console.log('\n🔑 Now, let\'s set up your Stripe API keys. Please go to https://dashboard.stripe.com/test/apikeys (ensure Test Mode is ON) and copy your keys.');

  const testPublishableKey = await question('Paste your Test Publishable Key (pk_test_...) : ');
  const testSecretKey = await question('Paste your Test Secret Key (sk_test_...) : ');
  
  let livePublishableKey = await question('Optional: Paste your Live Publishable Key (pk_live_...) [press enter to skip] : ');
  let liveSecretKey = await question('Optional: Paste your Live Secret Key (sk_live_...) [press enter to skip] : ');

  console.log('\n💾 Saving configuration to .env file...');
  const envPath = path.join(process.cwd(), '.env');
  
  let envContent = ''
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(path.join(process.cwd(), '.env.example'))) {
    envContent = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf8');
  }

  const updateEnv = (key, value) => {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  };

  // Update active keys to point to test keys for dev
  updateEnv('EXPO_PUBLIC_STRIPE_PUBLIC_KEY', `\${EXPO_PUBLIC_STRIPE_PUBLIC_KEY_TEST}`);
  updateEnv('STRIPE_SECRET_KEY', `\${STRIPE_SECRET_KEY_TEST}`);

  // Update test keys
  updateEnv('EXPO_PUBLIC_STRIPE_PUBLIC_KEY_TEST', testPublishableKey);
  updateEnv('STRIPE_SECRET_KEY_TEST', testSecretKey);

  // Update live keys if provided
  if (livePublishableKey) updateEnv('EXPO_PUBLIC_STRIPE_PUBLIC_KEY_LIVE', livePublishableKey);
  if (liveSecretKey) updateEnv('STRIPE_SECRET_KEY_LIVE', liveSecretKey);

  // Update price IDs
  for (const key in priceIds) {
    updateEnv(key, priceIds[key]);
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log('✅ .env file updated with Stripe API keys and Price IDs.');

  // --- Step 5: Deploy Edge Functions ---
  const deployFunctions = await question('\n❓ Do you want to deploy the Stripe Edge Functions to Supabase now? (Y/n): ');
  if (deployFunctions.toLowerCase() !== 'n') {
    console.log('\n🚀 Deploying Supabase Edge Functions...');
    console.log('   Deploying create-checkout-session...');
    try {
      execSync('npx supabase functions deploy create-checkout-session --no-verify-jwt', { stdio: 'inherit' });
      console.log('✅ create-checkout-session deployed.');
    } catch (e) {
      console.log('❌ Failed to deploy create-checkout-session. Make sure you have run `npx supabase link` first.');
    }
    console.log('   Deploying stripe-webhook...');
    try {
      execSync('npx supabase functions deploy stripe-webhook --no-verify-jwt', { stdio: 'inherit' });
      console.log('✅ stripe-webhook deployed.');
    } catch (e) {
      console.log('❌ Failed to deploy stripe-webhook. Make sure you have run `npx supabase link` first.');
    }
  }

  const updateSupabaseSecrets = await question('\n❓ Do you want to update Supabase Edge Function secrets with your Test Secret Key now? (y/N): ');
  if (updateSupabaseSecrets.toLowerCase() === 'y') {
    console.log('Updating Supabase secrets...');
    const supabaseSecretsCmd = `npx supabase secrets set STRIPE_SECRET_KEY=${testSecretKey}`;
    runCommand(supabaseSecretsCmd, 'npx'); // npx is not stripeCmd
    console.log('✅ Supabase secrets updated.');
  }

  const createWebhook = await question('\n❓ Do you want to automatically create a Stripe webhook endpoint for your Supabase Edge Function? (y/N): ');
  if (createWebhook.toLowerCase() === 'y') {
    // Try to get project ID from .env first
    let defaultProjectRef = '';
    const supabaseUrlMatch = envContent.match(/EXPO_PUBLIC_SUPABASE_URL=https:\/\/([^.]+)\.supabase\.co/);
    if (supabaseUrlMatch && supabaseUrlMatch[1]) {
      defaultProjectRef = supabaseUrlMatch[1];
    }

    let supabaseProjectRef = await question(`Please enter your Supabase Project Reference ID${defaultProjectRef ? ` (default: ${defaultProjectRef})` : ' (e.g., "abcdefghijklm")'}: `);
    if (!supabaseProjectRef && defaultProjectRef) {
      supabaseProjectRef = defaultProjectRef;
    }

    if (!supabaseProjectRef) {
      console.log('❌ No project ID provided. Skipping webhook creation.');
    } else {
      const webhookUrl = `https://${supabaseProjectRef}.supabase.co/functions/v1/stripe-webhook`;
      console.log(`Creating webhook for URL: ${webhookUrl}`);
      const webhookOutput = runCommand(
        `stripe webhook_endpoints create --url ${webhookUrl} --enabled-events checkout.session.completed`,
        stripeCmd
      );
      
      if (webhookOutput) {
        const webhookSecretMatch = webhookOutput.match(/"secret":\s*"([^"]+)"/);
        const webhookSecret = webhookSecretMatch ? webhookSecretMatch[1] : null;
        if (webhookSecret) {
          console.log(`✅ Stripe webhook created. Secret: ${webhookSecret}`);
          console.log('Updating .env with webhook secret...');
          updateEnv('STRIPE_WEBHOOK_SECRET', webhookSecret);
          fs.writeFileSync(envPath, envContent.trim() + '\n');
          console.log('✅ STRIPE_WEBHOOK_SECRET added to .env');
  
          const updateWebhookSecretSupabase = await question('\n❓ Do you want to update Supabase Edge Function secrets with your Webhook Secret now? (y/N): ');
          if (updateWebhookSecretSupabase.toLowerCase() === 'y') {
            console.log('Updating Supabase webhook secret...');
            const supabaseWebhookSecretCmd = `npx supabase secrets set STRIPE_WEBHOOK_SECRET=${webhookSecret}`;
            runCommand(supabaseWebhookSecretCmd, 'npx');
            console.log('✅ Supabase webhook secret updated.');
          }
        } else {
          console.log('❌ Could not parse Webhook Secret from Stripe output.');
        }
      } else {
        console.log('❌ Failed to create Stripe webhook endpoint.');
      }
    }
  }

  console.log('\n🎉 Stripe setup complete!');
  console.log('\nNext steps:');
  console.log('1. Restart your `npm run dev` server to load new .env variables.');
  if (createWebhook.toLowerCase() === 'y') {
    console.log('2. Your webhook is configured to hit your live Supabase project. No local listener needed!');
    console.log('   (If you want to test locally instead, run: npm run stripe:listen)');
  } else {
    console.log('2. To test webhooks locally, open a new terminal and run:');
    console.log('   npm run stripe:listen');
  }
  console.log('\nHappy building! 🚀\n');

  rl.close();
}

main();
