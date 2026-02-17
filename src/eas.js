import { spawn } from 'child_process';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

/**
 * Check if EAS CLI is installed
 */
export async function checkEasCliInstalled() {
  try {
    await runCommand('npx', ['eas-cli', '--version'], process.cwd(), false);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if user is logged in to EAS/Expo
 */
export async function checkEasLoggedIn() {
  try {
    const result = await runCommand('npx', ['eas-cli', 'whoami'], process.cwd());
    return result.includes('@') || result.length > 0;
  } catch {
    return false;
  }
}

/**
 * Login to EAS CLI (opens browser for authentication)
 * @param {string} projectDir - Path to the project directory
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function loginEas(projectDir) {
  console.log(chalk.yellow('\n  Opening browser for EAS/Expo login...'));
  try {
    await runCommandInteractive('npx', ['eas-cli', 'login'], projectDir);
    return { success: true };
  } catch (err) {
    console.log(chalk.yellow('\n  EAS login failed. Please login manually:'));
    console.log(chalk.white('    npx eas-cli login\n'));
    return { success: false, message: 'Interactive login failed' };
  }
}

/**
 * Configure EAS project
 * @param {string} projectDir - Path to the project directory
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function configureEas(projectDir) {
  console.log(chalk.dim('  Linking EAS project (follow the prompts)...\n'));

  // Tee: stdin inherited (interactive prompts handled by EAS CLI), stdout+stderr captured.
  // stderr is captured for projectId parsing but not shown (it's just warnings we handle ourselves).
  const result = await runCommandTee('npx', ['eas-cli', 'init'], projectDir, { showStderr: false });

  // EAS CLI always prints the projectId in its output, even when it can't write app.config.ts
  const projectIdMatch = (result.stdout + result.stderr).match(/"projectId":\s*"([a-f0-9-]{36})"/);

  if (projectIdMatch) {
    const projectId = projectIdMatch[1];
    const appConfigPath = path.join(projectDir, 'app.config.ts');
    if (await fs.pathExists(appConfigPath)) {
      let content = await fs.readFile(appConfigPath, 'utf-8');
      content = content.replace(
        /extra:\s*\{\s*\}/,
        `extra: {\n    eas: {\n      projectId: '${projectId}',\n    },\n  }`
      );
      await fs.writeFile(appConfigPath, content);
    }
    console.log(chalk.green(`  ✅ EAS project configured! (${projectId})\n`));
    return { success: true, projectId };
  }

  if (result.exitCode === 0) {
    console.log(chalk.green('  ✅ EAS project configured!\n'));
    return { success: true };
  }

  console.log(chalk.yellow('\n  Could not determine EAS project ID.'));
  console.log(chalk.white('    Run: npx eas-cli init'));
  console.log(chalk.dim('    Then add the projectId to extra.eas.projectId in app.config.ts\n'));
  return { success: false, message: 'EAS init failed' };
}

/**
 * Set up EAS credentials for iOS
 * @param {string} projectDir - Path to the project directory
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function setupIosCredentials(projectDir) {
  console.log(chalk.dim('\n  Setting up iOS credentials (follow the prompts)...\n'));
  try {
    await runCommandInteractive('npx', ['eas-cli', 'credentials', '--platform', 'ios'], projectDir);
    console.log(chalk.green('  ✅ iOS credentials configured!\n'));
    return { success: true };
  } catch {
    console.log(chalk.yellow('  Run when ready: npx eas-cli credentials --platform ios\n'));
    return { success: false };
  }
}

/**
 * Set up EAS credentials for Android
 * @param {string} projectDir - Path to the project directory
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function setupAndroidCredentials(projectDir) {
  console.log(chalk.dim('\n  Setting up Android credentials (follow the prompts)...\n'));
  try {
    await runCommandInteractive('npx', ['eas-cli', 'credentials', '--platform', 'android'], projectDir);
    console.log(chalk.green('  ✅ Android credentials configured!\n'));
    return { success: true };
  } catch {
    console.log(chalk.yellow('  Run when ready: npx eas-cli credentials --platform android\n'));
    return { success: false };
  }
}

/**
 * Build development app for iOS
 * @param {string} projectDir - Path to the project directory
 * @returns {Promise<{success: boolean, buildUrl?: string, message?: string}>}
 */
export async function buildIosDevelopment(projectDir) {
  console.log(chalk.dim('  Queuing iOS development build...\n'));
  try {
    const output = await runCommand(
      'npx', ['eas-cli', 'build', '--profile', 'development', '--platform', 'ios', '--no-wait', '--json', '--non-interactive'],
      projectDir
    );
    const json = JSON.parse(output);
    const build = Array.isArray(json) ? json[0] : json;
    const account = build?.project?.ownerAccount?.name;
    const slug = build?.project?.slug;
    const id = build?.id;
    const url = build?.buildUrl ?? build?.url
      ?? (account && slug && id ? `https://expo.dev/accounts/${account}/projects/${slug}/builds/${id}` : 'https://expo.dev/builds');
    console.log(chalk.green('  ✅ iOS build queued!\n'));
    console.log(chalk.white(`    Track progress: ${url}\n`));
    return { success: true, buildUrl: url };
  } catch {
    console.log(chalk.yellow('  Run when ready: npx eas-cli build --profile development --platform ios\n'));
    return { success: false };
  }
}

/**
 * Build development app for Android
 * @param {string} projectDir - Path to the project directory
 * @returns {Promise<{success: boolean, buildUrl?: string, message?: string}>}
 */
export async function buildAndroidDevelopment(projectDir) {
  console.log(chalk.dim('  Queuing Android development build...\n'));
  try {
    const output = await runCommand(
      'npx', ['eas-cli', 'build', '--profile', 'development', '--platform', 'android', '--no-wait', '--json', '--non-interactive'],
      projectDir
    );
    const json = JSON.parse(output);
    const build = Array.isArray(json) ? json[0] : json;
    const account = build?.project?.ownerAccount?.name;
    const slug = build?.project?.slug;
    const id = build?.id;
    const url = build?.buildUrl ?? build?.url
      ?? (account && slug && id ? `https://expo.dev/accounts/${account}/projects/${slug}/builds/${id}` : 'https://expo.dev/builds');
    console.log(chalk.green('  ✅ Android build queued!\n'));
    console.log(chalk.white(`    Track progress: ${url}\n`));
    return { success: true, buildUrl: url };
  } catch {
    console.log(chalk.yellow('  Run when ready: npx eas-cli build --profile development --platform android\n'));
    return { success: false };
  }
}

/**
 * Full EAS setup - attempts to automate as much as possible
 * @param {string} projectDir - Path to the project directory
 * @param {string[]} platforms - Selected platforms (ios, android)
 */
export async function setupEas(projectDir, platforms) {
  console.log(chalk.bold.cyan('\n  ═══ EAS/Expo Setup ═══\n'));
  
  // Check if EAS CLI is installed
  const cliInstalled = await checkEasCliInstalled();
  if (!cliInstalled) {
    console.log(chalk.yellow('  EAS CLI not found. Please install:'));
    console.log(chalk.white('    npm install -g eas-cli'));
    console.log(chalk.white('    or'));
    console.log(chalk.white('    npx eas-cli@latest --version\n'));
    return { success: false, message: 'EAS CLI not installed' };
  }
  
  // Check login status; attempt interactive login if not logged in
  let isLoggedIn = await checkEasLoggedIn();
  if (!isLoggedIn) {
    const loginResult = await loginEas(projectDir);
    if (!loginResult.success) {
      return { success: false, message: 'Not logged in to EAS' };
    }
    isLoggedIn = await checkEasLoggedIn();
  }

  if (!isLoggedIn) {
    console.log(chalk.yellow('\n  ⚠️  Still not logged in to EAS/Expo'));
    console.log(chalk.white('    Run: npx eas-cli login\n'));
    return { success: false, message: 'Not logged in - user needs to run eas login' };
  }

  console.log(chalk.green('  ✅ EAS CLI ready\n'));

  // Configure project
  await configureEas(projectDir);

  const hasIos = platforms.includes('ios');
  const hasAndroid = platforms.includes('android');
  const { confirm } = await import('@inquirer/prompts');

  if (hasIos) {
    const doCredentials = await confirm({
      message: 'Set up iOS credentials now? (requires Apple Developer account)',
      default: true,
    });
    if (doCredentials) {
      await setupIosCredentials(projectDir);
      const doBuild = await confirm({
        message: 'Queue iOS development build now? (~20-40 min in cloud)',
        default: true,
      });
      if (doBuild) await buildIosDevelopment(projectDir);
    }
  }

  if (hasAndroid) {
    const doCredentials = await confirm({
      message: 'Set up Android credentials now? (requires Google Play account)',
      default: true,
    });
    if (doCredentials) {
      await setupAndroidCredentials(projectDir);
      const doBuild = await confirm({
        message: 'Queue Android development build now? (~20-40 min in cloud)',
        default: true,
      });
      if (doBuild) await buildAndroidDevelopment(projectDir);
    }
  }

  return { success: true };
}

/**
 * Run a shell command with stdin inherited and stdout/stderr captured + echoed.
 * Always resolves (never rejects) — returns { exitCode, stdout, stderr }.
 * @param {{ showStderr?: boolean }} options
 */
function runCommandTee(cmd, args, cwd, { showStderr = true } = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, shell: true, stdio: ['inherit', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const str = data.toString();
      stdout += str;
      // Spinner frames use \r to overwrite — split and show only the final segment
      const cleaned = str.split('\r').pop();
      if (cleaned.trim()) process.stdout.write(cleaned);
    });
    child.stderr.on('data', (data) => {
      const str = data.toString();
      stderr += str;
      if (showStderr) process.stderr.write(str);
    });
    child.on('close', (code) => resolve({ exitCode: code, stdout, stderr }));
    child.on('error', (err) => resolve({ exitCode: 1, stdout, stderr, error: err.message }));
  });
}

/**
 * Run a shell command with inherited stdio (for interactive prompts)
 */
function runCommandInteractive(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, shell: true, stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

/**
 * Run a shell command
 */
function runCommand(cmd, args, cwd, captureOutput = true) {
  return new Promise((resolve, reject) => {
    const options = { cwd, shell: true };
    if (captureOutput) {
      options.stdio = 'pipe';
    }
    
    const child = spawn(cmd, args, options);
    let output = '';
    let error = '';
    
    if (captureOutput) {
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });
      child.stderr?.on('data', (data) => {
        error += data.toString();
      });
    }
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(error || `Command exited with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}
