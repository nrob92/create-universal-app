import { input, checkbox, confirm, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { spawn } from 'child_process';

function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, shell: true, stdio: 'pipe' });
    let output = '';
    child.stdout?.on('data', (data) => { output += data.toString(); });
    child.stderr?.on('data', (data) => { output += data.toString(); });
    child.on('close', (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(output || `Command exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

export async function runPrompts() {
  const projectName = await input({
    message: 'Project name:',
    default: 'my-universal-app',
    validate: (value) => {
      if (!value.trim()) return 'Project name is required';
      if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        return 'Only letters, numbers, hyphens, and underscores allowed';
      }
      return true;
    },
  });

  const platforms = await checkbox({
    message: 'Select platforms (space to toggle, enter to confirm):',
    choices: [
      { name: 'Web', value: 'web', checked: true },
      { name: 'iOS', value: 'ios', checked: false },
      { name: 'Android', value: 'android', checked: false },
    ],
    required: true,
  });

  const runInstall = await confirm({
    message: 'Install dependencies after scaffolding?',
    default: true,
  });

  let supabaseOption = await select({
    message: 'Supabase setup:',
    choices: [
      { name: 'Create new Supabase project', value: 'new', description: 'Create a new Supabase project via CLI' },
      { name: 'Link to existing project', value: 'existing', description: 'Use an existing Supabase project' },
      { name: 'Skip Supabase setup', value: 'skip', description: 'Skip Supabase setup for now' },
    ],
    default: 'new',
  });

  let supabaseProjectRef = '';
  let newProjectDetails = null;

  if (supabaseOption === 'existing') {
    supabaseProjectRef = await input({
      message: 'Enter your Supabase project ref (found in dashboard URL):',
      validate: (value) => {
        if (!value.trim()) return 'Project ref is required';
        return true;
      },
    });
  } else if (supabaseOption === 'new') {
    console.log(chalk.cyan('\n  Creating a new Supabase project via CLI...\n'));

    const supabase = await import('../src/supabase.js');
    const cliAvailable = await supabase.checkSupabaseCliInstalled();

    if (!cliAvailable) {
      console.log(chalk.yellow('  npx not found. Please ensure Node.js is installed.\n'));
      supabaseOption = 'skip';
    } else {
      console.log(chalk.dim('  Using npx to run Supabase CLI (will download if needed)...\n'));

      // Download Supabase CLI first
      console.log(chalk.cyan('  Downloading Supabase CLI (first time)...'));
      try {
        await runCommand('npx', ['supabase', '--version'], process.cwd());
        console.log(chalk.green('  ✅ Supabase CLI ready!\n'));
      } catch {
        console.log(chalk.yellow('  ⚠️  Download might take a while...\n'));
      }

      // Check login - if not logged in, run login
      let isLoggedIn = await supabase.checkSupabaseLoggedIn();

      if (!isLoggedIn) {
        console.log(chalk.yellow('  Not logged in. Opening browser for login...\n'));
        const loginResult = await supabase.loginSupabase();
        
        // Trust the interactive login result — the CLI already confirmed success
        if (loginResult.success) {
          isLoggedIn = true;
        } else {
          console.log(chalk.yellow('  Login not completed. Skipping Supabase setup.\n'));
          supabaseOption = 'skip';
        }
      }

      if (supabaseOption !== 'skip') {
        const orgResult = await supabase.getOrganizations();
        let orgId;

        if (orgResult.success && orgResult.organizations?.length > 0) {
          orgId = await select({
            message: 'Select your Supabase organization:',
            choices: orgResult.organizations.map((org) => ({
              name: `${org.name} (${org.id})`,
              value: org.id,
            })),
          });
        } else {
          orgId = await input({
            message: 'Enter your Supabase organization ID:',
            validate: (value) => {
              if (!value.trim()) return 'Organization ID is required';
              return true;
            },
          });
        }

        const supabaseProjectName = await input({
          message: 'Supabase project name:',
          default: projectName,
          validate: (value) => {
            if (!value.trim()) return 'Project name is required';
            return true;
          },
        });

        const dbPassword = await input({
          message: 'Create a database password for the new project (min 8 characters):',
          validate: (value) => {
            if (!value.trim()) return 'Database password is required';
            if (value.length < 8) return 'Password must be at least 8 characters';
            return true;
          },
        });

        const region = await input({
          message: 'Enter region (e.g., us-east-1, eu-west-1, ap-southeast-1):',
          default: 'us-east-1',
          validate: (value) => {
            if (!value.trim()) return 'Region is required';
            return true;
          },
        });

        newProjectDetails = { supabaseProjectName, orgId, dbPassword, region };
        console.log(chalk.green('\n  ✅ Project details collected. Will create automatically.\n'));
      }
    }
  }

  const hasMobile = platforms.includes('ios') || platforms.includes('android');

  return { 
    projectName, 
    platforms, 
    runInstall, 
    supabaseOption, 
    supabaseProjectRef, 
    newProjectDetails 
  };
}
