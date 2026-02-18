#!/usr/bin/env node

import { runPrompts } from '../src/prompts.js';
import { generateProject } from '../src/generator.js';
import { runInstaller } from '../src/installer.js';
import { setupSupabase, createSupabaseProject } from '../src/supabase.js';
import { setupEas } from '../src/eas.js';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { spawn } from 'child_process';

function initGit(projectDir) {
  return new Promise((resolve) => {
    const run = (cmd, args) => new Promise((res) => {
      const child = spawn(cmd, args, { cwd: projectDir, shell: true, stdio: 'pipe' });
      child.on('close', res);
      child.on('error', () => res(1));
    });
    run('git', ['init'])
      .then(() => run('git', ['add', '.']))
      .then(() => run('git', ['-c', 'user.email=scaffold@create-universal-app', '-c', 'user.name=create-universal-app', 'commit', '-m', 'init']))
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

async function main() {
  console.log(chalk.bold.cyan('\n  ✦ Universal App Generator\n'));
  console.log(chalk.dim('  Scaffold cross-platform apps with Expo Router, Tamagui, Supabase & Stripe\n'));

  // ── Step 1: Get all project details ─────────────────────────────────────
  const answers = await runPrompts();

  const hasMobile = answers.platforms.includes('ios') || answers.platforms.includes('android');
  const hasWeb = answers.platforms.includes('web');

  // ── Step 2: Supabase setup FIRST ──────────────────────────────────────
  let supabaseSetupSuccess = false;
  let supabaseKeys = null;
  let supabaseProjectRef = answers.supabaseProjectRef;

  if (answers.supabaseOption === 'new' && answers.newProjectDetails) {
    console.log(chalk.bold.cyan('\n  ═══ Setting up Supabase FIRST ═══\n'));
    
    // Create Supabase project BEFORE scaffolding
    const createResult = await createSupabaseProject(
      answers.newProjectDetails.supabaseProjectName || answers.projectName,
      answers.newProjectDetails.orgId,
      answers.newProjectDetails.dbPassword,
      answers.newProjectDetails.region
    );

    if (!createResult.success) {
      console.log(chalk.red('\n  Failed to create Supabase project. Please try again or select "Link to existing".\n'));
      process.exit(1);
    }

    if (createResult.projectRef) {
      supabaseProjectRef = createResult.projectRef;
      console.log(chalk.green(`  ✅ Supabase project created: ${supabaseProjectRef}\n`));
    } else {
      console.log(chalk.yellow('\n  Could not get project ref. Please enter it manually.\n'));
      process.exit(1);
    }
  }

  // ── Step 3: Scaffold project ───────────────────────────────────────────
  console.log('');
  const { default: ora } = await import('ora');
  const spinner = ora('Scaffolding project...').start();

  try {
    // Pass Supabase details to generator for .env file
    await generateProject({
      ...answers,
      supabaseProjectRef,
      supabaseKeys
    });
    spinner.succeed(chalk.green('Project scaffolded successfully!'));
  } catch (err) {
    spinner.fail('Failed to scaffold project');
    console.error(chalk.red(err.message));
    process.exit(1);
  }

  const projectDir = path.resolve(process.cwd(), answers.projectName);

  // ── Step 4: Link Supabase and push schema ───────────────────────────────
  if (answers.supabaseOption !== 'skip' && supabaseProjectRef) {
    console.log(chalk.bold.cyan('\n  ═══ Linking Supabase ═══\n'));
    
    // Link the project
    const linkResult = await setupSupabase(
      projectDir,
      'existing', // Use existing since we have the ref
      supabaseProjectRef,
      answers.projectName
    );
    
    supabaseSetupSuccess = linkResult.success;
    supabaseKeys = linkResult.keys;

    // Auto-write .env with actual Supabase keys
    if (supabaseKeys) {
      const envExamplePath = path.join(projectDir, '.env.example');
      const envPath = path.join(projectDir, '.env');
      if (await fs.pathExists(envExamplePath)) {
        let envContent = await fs.readFile(envExamplePath, 'utf-8');
        envContent = envContent.replace('https://your-project.supabase.co', supabaseKeys.url);
        envContent = envContent.replace('your-anon-key', supabaseKeys.anonKey);
        await fs.writeFile(envPath, envContent);
      }
    }
  }

  // ── Step 5: Install dependencies ────────────────────────────────────────
  let installSuccess = false;
  if (answers.runInstall) {
    const result = await runInstaller(answers.projectName);
    installSuccess = result !== null;
  }

  // ── Step 5b: Init git repo so EAS uses npm (package-lock.json tracked) ──
  if (installSuccess) {
    await initGit(projectDir);
  }

  const runCmd = 'npm run';

  // ── Step 6: Final instructions ─────────────────────────────────────────
  console.log(chalk.bold.green('\n  ✅ All done!\n'));

  if (supabaseSetupSuccess && supabaseKeys) {
    console.log(chalk.white('    EXPO_PUBLIC_SUPABASE_URL        ') + chalk.cyan(supabaseKeys.url));
    console.log(chalk.white('    EXPO_PUBLIC_SUPABASE_ANON_KEY   ') + chalk.dim(supabaseKeys.anonKey.substring(0, 20) + '...'));
    console.log('');
  }

  console.log(chalk.bold.green('  Get started:\n'));
  console.log(chalk.white(`    cd ${answers.projectName}`));
  if (!answers.runInstall) {
    console.log(chalk.white('    npm install'));
  }
  if (supabaseSetupSuccess && supabaseKeys) {
    console.log(chalk.dim('    .env created with Supabase keys — add remaining keys below'));
  } else {
    console.log(chalk.white('    cp .env.example .env'));
  }
  console.log(chalk.white(`    ${runCmd} dev\n`));

  // Show remaining env keys if needed
  if (!supabaseSetupSuccess || !supabaseKeys) {
    console.log(chalk.bold.yellow('  Fill in .env with your keys:\n'));
    console.log(chalk.white('    EXPO_PUBLIC_SUPABASE_URL        ') + chalk.dim('supabase.com/dashboard → Project Settings → API'));
    console.log(chalk.white('    EXPO_PUBLIC_SUPABASE_ANON_KEY   ') + chalk.dim('same page, under "anon public"'));
  }
  
  if (hasWeb) {
    console.log(chalk.white('    EXPO_PUBLIC_STRIPE_PUBLIC_KEY   ') + chalk.dim('dashboard.stripe.com/apikeys'));
    console.log(chalk.white('    STRIPE_SECRET_KEY               ') + chalk.dim('same page (secret key)'));
  }
  if (hasMobile) {
    console.log(chalk.white('    EXPO_PUBLIC_REVENUECAT_IOS_KEY  ') + chalk.dim('app.revenuecat.com → API Keys'));
    console.log(chalk.white('    EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ') + chalk.dim('same page'));
  }
  console.log('');

  // Seed instructions
  if (supabaseSetupSuccess) {
    console.log(chalk.dim('    Seed your plans table:'));
    console.log(chalk.dim('      INSERT INTO plans (name, slug, price_monthly, features)'));
    console.log(chalk.dim("      VALUES ('Pro', 'pro', 9.99, '[\\\"Unlimited projects\\\", \\\"Priority support\\\"]');"));
    console.log('');
  }

  // ── Step 7: EAS setup (last) ───────────────────────────────────────────
  if (hasMobile && answers.easOption !== 'skip' && installSuccess) {
    const easResult = await setupEas(projectDir, answers.platforms);
    
    if (!easResult.success) {
      console.log(chalk.yellow('  Note: EAS setup requires additional steps.\n'));
    }
  } else if (hasMobile && answers.easOption !== 'skip' && !installSuccess) {
    console.log(chalk.yellow('  ⚠️  EAS setup skipped because dependencies failed to install.'));
    console.log(chalk.yellow('  Run "npm install" first, then:\n'));
    console.log(chalk.white('    npx eas-cli init'));
    console.log(chalk.white('    npx eas-cli credentials --platform ios'));
    console.log(chalk.white('    npx eas-cli build --profile development --platform ios\n'));
  } else if (hasMobile && answers.easOption === 'skip') {
    console.log(chalk.dim('  EAS setup skipped. Run these commands when ready:\n'));
    console.log(chalk.white('    npx eas-cli login'));
    console.log(chalk.white('    npx eas-cli project:init'));
    console.log(chalk.white('    npx eas-cli build --profile development --platform ios'));
    console.log(chalk.white('    npx eas-cli build --profile development --platform android\n'));
  }

  // Summary
  const platformList = answers.platforms.join(', ');
  console.log(chalk.dim(`  Platforms: ${platformList}`));
  console.log(chalk.dim('  Framework: Expo Router + Tamagui'));
  console.log(chalk.dim('  Auth: Supabase | Payments: Stripe (web) + RevenueCat (mobile)\n'));
}

main().catch((err) => {
  console.error(chalk.red(err.message));
  process.exit(1);
});
