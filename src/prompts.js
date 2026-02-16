import { input, checkbox, confirm } from '@inquirer/prompts';

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

  return { projectName, platforms, runInstall };
}
