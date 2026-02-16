import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';

export async function runInstaller(projectName) {
  const projectDir = path.resolve(process.cwd(), projectName);
  const { default: ora } = await import('ora');
  const spinner = ora('Installing dependencies...').start();

  try {
    await runCommand('bun', ['install'], projectDir);
    spinner.succeed(chalk.green('Dependencies installed!'));
  } catch {
    spinner.text = 'bun not found, trying npm...';
    try {
      await runCommand('npm', ['install'], projectDir);
      spinner.succeed(chalk.green('Dependencies installed!'));
    } catch (err) {
      spinner.fail('Install failed');
      console.error(chalk.yellow('  Run "bun install" or "npm install" manually.'));
    }
  }
}

function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: 'pipe', shell: true });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}
