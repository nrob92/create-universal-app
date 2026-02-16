#!/usr/bin/env node

import { runPrompts } from '../src/prompts.js';
import { generateProject } from '../src/generator.js';
import { runInstaller } from '../src/installer.js';
import chalk from 'chalk';

async function main() {
  console.log(chalk.bold.cyan('\n  ✦ Universal App Generator\n'));
  console.log(chalk.dim('  Scaffold cross-platform apps with One, Tamagui, Supabase & Stripe\n'));

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

  if (answers.runInstall) {
    await runInstaller(answers.projectName);
  }

  console.log(chalk.bold.green('\n  Done! Next steps:\n'));
  console.log(chalk.white(`    cd ${answers.projectName}`));
  if (!answers.runInstall) {
    console.log(chalk.white('    bun install'));
  }
  console.log(chalk.white('    cp .env.example .env'));
  console.log(chalk.white('    # Fill in your Supabase & Stripe keys in .env'));
  console.log(chalk.white('    bun dev\n'));

  const platformList = answers.platforms.join(', ');
  console.log(chalk.dim(`  Platforms: ${platformList}`));
  console.log(chalk.dim('  Framework: One + Vite + Tamagui'));
  console.log(chalk.dim('  Auth: Supabase | Payments: Stripe + IAP\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
