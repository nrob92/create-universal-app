import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n🐱 Setting up RevenueCat for your mobile app...');
  console.log('-----------------------------------------------');
  console.log('Follow these steps to get your API keys:');
  console.log('1. Go to https://app.revenuecat.com and create a Project.');
  console.log('2. In your Project settings, create an Entitlement named exactly: premium');
  console.log('3. Create an Offering (e.g., "default") and attach your products.');
  console.log('4. Go to Project Settings -> API Keys to find your Public SDK keys.\n');

  const iosKey = await question('Paste your RevenueCat iOS Public API Key (appl_...) [press enter to skip]: ');
  const androidKey = await question('Paste your RevenueCat Android Public API Key (goog_...) [press enter to skip]: ');

  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('\n⚠️ No .env file found. Creating one from .env.example...');
    if (fs.existsSync(path.join(process.cwd(), '.env.example'))) {
        fs.copyFileSync(path.join(process.cwd(), '.env.example'), envPath);
    } else {
        fs.writeFileSync(envPath, '');
    }
  }

  let envContent = fs.readFileSync(envPath, 'utf8');

  if (iosKey) {
    if (envContent.includes('EXPO_PUBLIC_REVENUECAT_IOS_KEY=')) {
      envContent = envContent.replace(/EXPO_PUBLIC_REVENUECAT_IOS_KEY=.*/, `EXPO_PUBLIC_REVENUECAT_IOS_KEY=${iosKey}`);
    } else {
      envContent += `\nEXPO_PUBLIC_REVENUECAT_IOS_KEY=${iosKey}`;
    }
    console.log('✅ Added iOS Key to .env');
  }

  if (androidKey) {
    if (envContent.includes('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=')) {
      envContent = envContent.replace(/EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=.*/, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=${androidKey}`);
    } else {
      envContent += `\nEXPO_PUBLIC_REVENUECAT_ANDROID_KEY=${androidKey}`;
    }
    console.log('✅ Added Android Key to .env');
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n');

  console.log('\n🎉 RevenueCat configuration updated!');
  console.log('Your mobile app is now ready to communicate with RevenueCat.');
  console.log('Happy building! 🚀\n');

  rl.close();
}

main();
