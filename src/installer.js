import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';

export async function runInstaller(projectName) {
  const projectDir = path.resolve(process.cwd(), projectName);

  console.log(chalk.cyan('\n  📦 Installing dependencies...\n'));
  try {
    await runCommand('npm', ['install'], projectDir);
    console.log(chalk.green('\n  ✅ Dependencies installed!\n'));
    return 'npm';
  } catch (err) {
    console.error(chalk.red('\n  ✖ Install failed'));
    console.error(chalk.yellow('  Run "npm install" manually in the project directory.\n'));
    return null;
  }
}

function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}
