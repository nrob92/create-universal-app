import { spawn, exec } from 'child_process';
import path from 'path';
import chalk from 'chalk';

// Cross-platform way to open a URL in browser
function openBrowser(url) {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const isGitBash = isWindows && process.env.MSYSTEM === 'MINGW64';
    
    let cmd;
    if (isWindows && !isGitBash) {
      cmd = 'start';
    } else if (process.platform === 'darwin') {
      cmd = 'open';
    } else {
      cmd = 'xdg-open';
    }
    
    exec(`${cmd} "${url}"`, (err) => {
      if (err) {
        console.log(chalk.dim(`  Could not auto-open browser. Please visit: ${url}`));
      }
      resolve();
    });
  });
}

/**
 * Install Supabase CLI
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function installSupabaseCli() {
  const { default: ora } = await import('ora');
  const spinner = ora('Installing Supabase CLI...').start();
  
  try {
    // Try npm first
    await runCommand('npm', ['install', '-g', 'supabase'], process.cwd());
    spinner.succeed(chalk.green('Supabase CLI installed!'));
    return { success: true };
  } catch {
    spinner.text = 'npm failed, trying brew...';
    try {
      await runCommand('brew', ['install', 'supabase/tap/supabase'], process.cwd());
      spinner.succeed(chalk.green('Supabase CLI installed via brew!'));
      return { success: true };
    } catch (err) {
      spinner.fail('Failed to install Supabase CLI');
      console.log(chalk.yellow('\n  Please install manually:'));
      console.log(chalk.white('    npm install -g supabase'));
      console.log(chalk.white('    or'));
      console.log(chalk.white('    brew install supabase/tap/supabase\n'));
      return { success: false };
    }
  }
}

/**
 * Check if Supabase CLI is available via npx
 * Note: npx will automatically download if not present
 */
export async function checkSupabaseCliInstalled() {
  try {
    // npx will prompt to download if not present, so we check if npx itself exists
    await runCommand('npx', ['--version'], process.cwd(), false);
    return true;
  } catch {
    return false;
  }
}

/**
 * Login to Supabase CLI (opens browser)
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function loginSupabase() {
  console.log(chalk.yellow('\n  Opening Supabase login...\n'));
  
  try {
    // Run supabase login interactively - this will work in Git Bash
    // It provides a link and asks for verification code
    await runCommandInteractive('npx', ['supabase', 'login'], process.cwd());
    console.log(chalk.green('\n  ✅ Login successful!\n'));
    return { success: true };
  } catch (err) {
    console.log(chalk.yellow('\n  Login may not have completed. You can run: npx supabase login\n'));
    return { success: true, message: 'Login attempted' };
  }
}

// Run command with full TTY support for interactive input
function runCommandInteractive(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { 
      cwd, 
      stdio: 'inherit', // Use parent's stdin/stdout/stderr for interactivity
      shell: true 
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

/**
 * Check if user is logged in to Supabase
 */
export async function checkSupabaseLoggedIn() {
  try {
    const result = await runCommand('npx', ['supabase', 'whoami'], process.cwd(), true);
    // If we get here without error and have some output, user is logged in
    const trimmed = result.trim();
    return trimmed.length > 0 && !trimmed.toLowerCase().includes('error');
  } catch {
    return false;
  }
}

/**
 * Get list of Supabase organizations
 * @returns {Promise<{success: boolean, organizations?: Array<{id: string, name: string}>, message?: string}>}
 */
export async function getOrganizations() {
  try {
    const result = await runCommand('npx', ['supabase', 'orgs', 'list'], process.cwd(), true);
    // Parse the output - CLI returns a table with | separators
    // Example:    ID                   | NAME
    //           ----------------------|-------------------
    //            cefxyoldfyiwfudntdve | nicks failed apps
    const lines = result.split('\n').filter(line => line.trim());
    const orgs = [];
    
    for (const line of lines) {
      // Skip header/separator lines
      if (line.includes('---') || line.trim().startsWith('ID')) continue;
      
      // Try table format with | separator
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 2 && parts[0] && parts[1]) {
          orgs.push({ id: parts[0], name: parts[1] });
        }
        continue;
      }
    }
    
    return { success: true, organizations: orgs };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Wait for Supabase project to be ready
 * @param {string} projectRef - Project reference ID
 * @param {number} maxAttempts - Maximum attempts (default 60, ~3 minutes)
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function waitForProjectReady(projectRef, maxAttempts = 60) {
  const { default: ora } = await import('ora');
  const spinner = ora('Waiting for Supabase project to be ready...').start();
  
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const result = await runCommand(
        'npx', 
        ['supabase', 'projects', 'api-keys', '--project-ref', projectRef], 
        process.cwd(), 
        true
      );
      
      // If we get actual key values (not just headers), project is ready
      if (result.includes('anon') && result.includes('eyJ')) {
        spinner.succeed(chalk.green('Supabase project is ready!'));
        return { success: true };
      }
    } catch {
      // Project might not be ready yet, continue waiting
    }
    
    // Update spinner
    spinner.text = `Waiting for Supabase project to be ready... (${i}/${maxAttempts})`;
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  spinner.warn('Project may still be provisioning. Continuing anyway...');
  return { success: true, message: 'Timeout waiting for project ready' };
}

/**
 * Create a new Supabase project via CLI
 * @param {string} projectName - Name for the Supabase project
 * @param {string} organizationId - Organization ID
 * @param {string} dbPassword - Database password
 * @param {string} region - Region (e.g., us-east-1)
 * @returns {Promise<{success: boolean, projectRef?: string, message?: string}>}
 */
export async function createSupabaseProject(projectName, organizationId, dbPassword, region) {
  const { default: ora } = await import('ora');
  const spinner = ora('Creating Supabase project...').start();
  
  try {
    // Supabase CLI expects password via stdin for security, but we'll try with --db-password flag
    const args = [
      'projects', 'create', projectName,
      '--org-id', organizationId,
      '--db-password', dbPassword,
      '--region', region
    ];
    
    await runCommand('npx', ['supabase', ...args], process.cwd(), true);
    
    spinner.text = 'Project created, waiting for it to be ready...';
    
    // The CLI returns the project ref in output, but we need to find it
    // Let's get the project list to find our new project
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Try to get project ref from list
    const projectRef = await findProjectRef(projectName);
    
    if (projectRef) {
      // Wait for project to be fully ready
      await waitForProjectReady(projectRef);
      spinner.succeed(chalk.green(`Supabase project created: ${projectRef}`));
      return { success: true, projectRef };
    }
    
    spinner.warn('Project created but could not get ref automatically');
    return { 
      success: true, 
      message: 'Project created. Please find your project ref in the dashboard.' 
    };
  } catch (err) {
    spinner.fail('Failed to create Supabase project');
    console.error(chalk.red(err.message));
    return { success: false, message: err.message };
  }
}

/**
 * Find project ref by name from `supabase projects list` output
 * Output format:
 *   LINKED | ORG ID               | REFERENCE ID         | NAME        | REGION    | CREATED AT
 *   -------|----------------------|----------------------|-------------|-----------|----------
 *          | cefxyoldfyiwfudntdve | xxaxbgmbkruuqmscfyvj | uniswap     | ...       | ...
 */
async function findProjectRef(projectName) {
  try {
    const result = await runCommand('npx', ['supabase', 'projects', 'list'], process.cwd(), true);
    const lines = result.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes(projectName.toLowerCase())) {
        // Split by | and extract REFERENCE ID (3rd column, index 2)
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 4) {
          const refId = parts[2]; // REFERENCE ID column
          if (refId && /^[a-zA-Z0-9]{20}$/.test(refId)) {
            return refId;
          }
        }
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Link local project to a Supabase project
 * @param {string} projectDir - Path to the project directory
 * @param {string} projectRef - Supabase project reference ID
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function linkSupabaseProject(projectDir, projectRef) {
  const { default: ora } = await import('ora');
  const spinner = ora(`Linking to Supabase project ${projectRef}...`).start();
  
  try {
    await runCommand('npx', ['supabase', 'link', '--project-ref', projectRef], projectDir);
    spinner.succeed(chalk.green('Linked to Supabase project!'));
    return { success: true };
  } catch (err) {
    spinner.fail('Failed to link Supabase project');
    console.error(chalk.red(err.message));
    return { success: false, message: err.message };
  }
}

/**
 * Push database schema to Supabase
 * @param {string} projectDir - Path to the project directory
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function pushDatabaseSchema(projectDir) {
  const { default: ora } = await import('ora');
  const spinner = ora('Pushing database schema...').start();
  
  try {
    await runCommand('npx', ['supabase', 'db', 'push'], projectDir);
    spinner.succeed(chalk.green('Database schema pushed!'));
    return { success: true };
  } catch (err) {
    spinner.fail('Failed to push database schema');
    console.error(chalk.red(err.message));
    return { success: false, message: err.message };
  }
}

/**
 * Get Supabase project API keys
 * @param {string} projectRef - Supabase project reference ID
 * @returns {Promise<{success: boolean, keys?: {url: string, anonKey: string, serviceKey: string}, message?: string}>}
 */
export async function getSupabaseKeys(projectRef) {
  try {
    const result = await runCommand(
      'npx', 
      ['supabase', 'projects', 'api-keys', '--project-ref', projectRef], 
      process.cwd(), 
      true
    );
    
    // Parse table output:
    //   NAME      | KEY VALUE
    //   ----------|-----------
    //   anon      | eyJ...
    //   service_role | eyJ...
    const lines = result.split('\n');
    let anonKey = '';
    let serviceKey = '';
    
    for (const line of lines) {
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 2) {
          if (parts[0].toLowerCase().includes('anon')) {
            anonKey = parts[1];
          } else if (parts[0].toLowerCase().includes('service')) {
            serviceKey = parts[1];
          }
        }
      }
    }
    
    return {
      success: true,
      keys: {
        url: `https://${projectRef}.supabase.co`,
        anonKey,
        serviceKey
      }
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Setup Supabase for the project
 * @param {string} projectDir - Path to the project directory
 * @param {string} supabaseOption - 'existing', 'new', or 'skip'
 * @param {string} projectRef - Supabase project reference (for 'existing' option)
 * @param {string} projectName - Name for new project (for 'new' option)
 * @param {object} newProjectDetails - Optional: { orgId, dbPassword, region }
 */
export async function setupSupabase(projectDir, supabaseOption, projectRef, projectName, newProjectDetails = null) {
  if (supabaseOption === 'skip') {
    return { success: true, message: 'Skipped Supabase setup' };
  }
  
  // Check and install CLI if needed
  let cliInstalled = await checkSupabaseCliInstalled();
  if (!cliInstalled) {
    console.log(chalk.yellow('\n  ⚠️  Supabase CLI not found'));
    const { default: ora } = await import('ora');
    const spinner = ora('Installing Supabase CLI...').start();
    
    const installResult = await installSupabaseCli();
    if (!installResult.success) {
      spinner.fail('Could not install Supabase CLI automatically');
      console.log(chalk.yellow('\n  Please install manually and re-run:'));
      console.log(chalk.white('    npm install -g supabase'));
      console.log(chalk.white('    or'));
      console.log(chalk.white('    brew install supabase/tap/supabase\n'));
      return { success: false, message: 'Supabase CLI not installed' };
    }
    cliInstalled = true;
  }
  
  // Note: supabase folder already exists from template (with config.toml and migrations)
  console.log(chalk.green('  ✅ Supabase CLI ready\n'));
  
  // Create new project if needed
  if (supabaseOption === 'new' && newProjectDetails) {
    const createResult = await createSupabaseProject(
      projectName,
      newProjectDetails.orgId,
      newProjectDetails.dbPassword,
      newProjectDetails.region
    );
    
    if (!createResult.success) {
      return createResult;
    }
    
    projectRef = createResult.projectRef;
    
    if (!projectRef) {
      console.log(chalk.yellow('\n  Could not auto-detect project ref.'));
      console.log(chalk.white('    Please find your project ref at:'));
      console.log(chalk.dim('      https://supabase.com/dashboard/settings/general'));
      return { success: false, message: 'Project created but ref not found' };
    }
  }
  
  // Link the project
  if (projectRef) {
    const linkResult = await linkSupabaseProject(projectDir, projectRef);
    if (!linkResult.success) {
      return linkResult;
    }
    
    // Push database schema
    const pushResult = await pushDatabaseSchema(projectDir);
    if (!pushResult.success) {
      return pushResult;
    }
    
    // Get API keys
    const keysResult = await getSupabaseKeys(projectRef);
    
    return { 
      success: true, 
      keys: keysResult.success ? keysResult.keys : null 
    };
  }
  
  return { success: false, message: 'Project ref is required' };
}

/**
 * Run a shell command and return the output
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
