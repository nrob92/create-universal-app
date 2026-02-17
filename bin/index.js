#!/usr/bin/env node

import { runPrompts } from '../src/prompts.js';
import { generateProject } from '../src/generator.js';
import { runInstaller } from '../src/installer.js';
import chalk from 'chalk';

async function main() {
  console.log(chalk.bold.cyan('\n  ✦ Universal App Generator\n'));
  console.log(chalk.dim('  Scaffold cross-platform apps with Expo Router, Tamagui, Supabase & Stripe\n'));

  const answers = await runPrompts();

  console.log('');
  const { default: ora } = await import('ora');
  const spinner = ora('Scaffolding project...').start();

  try {
    await generateProject(answers);
    spinner.succeed(chalk.green('Project scaffolded successfully!'));
  } catch (err) {
    spinner.fail('Failed to scaffold project');
    console.error(chalk.red(err.message));
    process.exit(1);
  }

  let pm = 'bun';
  if (answers.runInstall) {
    const usedPm = await runInstaller(answers.projectName);
    if (usedPm) pm = usedPm;
  }

  const runCmd = pm === 'npm' ? 'npm run' : pm;

  const hasMobile = answers.platforms.includes('ios') || answers.platforms.includes('android');
  const hasWeb = answers.platforms.includes('web');

  // ── 1. Get started ──────────────────────────────────────────────────
  console.log(chalk.bold.green('\n  Done! Get started:\n'));
  console.log(chalk.white(`    cd ${answers.projectName}`));
  if (!answers.runInstall) {
    console.log(chalk.white(`    ${pm} install`));
  }
  console.log(chalk.white('    cp .env.example .env'));
  console.log(chalk.white(`    ${runCmd} dev\n`));

  // ── 2. Environment keys ─────────────────────────────────────────────
  console.log(chalk.bold.yellow('  Fill in .env with your keys:\n'));
  console.log(chalk.white('    EXPO_PUBLIC_SUPABASE_URL        ') + chalk.dim('supabase.com/dashboard → Project Settings → API'));
  console.log(chalk.white('    EXPO_PUBLIC_SUPABASE_ANON_KEY   ') + chalk.dim('same page, under "anon public"'));
  if (hasWeb) {
    console.log(chalk.white('    EXPO_PUBLIC_STRIPE_PUBLIC_KEY   ') + chalk.dim('dashboard.stripe.com/apikeys'));
    console.log(chalk.white('    STRIPE_SECRET_KEY               ') + chalk.dim('same page (secret key)'));
  }
  if (hasMobile) {
    console.log(chalk.white('    EXPO_PUBLIC_REVENUECAT_IOS_KEY  ') + chalk.dim('app.revenuecat.com → API Keys'));
    console.log(chalk.white('    EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ') + chalk.dim('same page'));
  }
  console.log('');

  // ── 3. Supabase database ────────────────────────────────────────────
  console.log(chalk.bold.yellow('  Supabase database setup:\n'));
  console.log(chalk.white('    npx supabase login'));
  console.log(chalk.white('    npx supabase link --project-ref <ref>'));
  console.log(chalk.dim('      Find your ref at supabase.com/dashboard → Project Settings → General'));
  console.log(chalk.white('    npx supabase db push'));
  console.log(chalk.dim('      Creates profiles, plans & subscriptions tables with RLS policies'));
  console.log('');
  console.log(chalk.dim('    Then seed your plans table with at least one row:'));
  console.log(chalk.dim('      INSERT INTO plans (name, slug, price_monthly, features)'));
  console.log(chalk.dim("      VALUES ('Pro', 'pro', 9.99, '[\"Unlimited projects\", \"Priority support\"]');"));
  console.log('');

  // ── 4. Mobile setup (conditional) ───────────────────────────────────
  if (hasMobile) {
    console.log(chalk.bold.yellow('  Mobile setup (dev builds):\n'));
    console.log(chalk.white('    npx eas-cli login'));
    console.log(chalk.white('    npx eas-cli build --profile development --platform ios'));
    console.log(chalk.white('    npx eas-cli build --profile development --platform android'));
    console.log(chalk.dim('    Install the build on your device, then run `npx expo start`\n'));
  }

  // ── 5. Summary ──────────────────────────────────────────────────────
  const platformList = answers.platforms.join(', ');
  console.log(chalk.dim(`  Platforms: ${platformList}`));
  console.log(chalk.dim('  Framework: Expo Router + Tamagui'));
  console.log(chalk.dim('  Auth: Supabase | Payments: Stripe (web) + RevenueCat (mobile)\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
