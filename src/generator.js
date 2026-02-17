import fs from 'fs-extra';
import path from 'path';
import { getTemplatesDir } from './utils.js';

export async function generateProject({ projectName, platforms }) {
  const projectDir = path.resolve(process.cwd(), projectName);
  const templatesDir = getTemplatesDir();

  if (await fs.pathExists(projectDir)) {
    throw new Error(`Directory "${projectName}" already exists.`);
  }

  await fs.ensureDir(projectDir);

  const hasMobile = platforms.includes('ios') || platforms.includes('android');
  const hasWeb = platforms.includes('web');

  // Copy all shared template files
  const alwaysCopy = [
    'app/_layout.tsx',
    'app/index.tsx',
    'app/(app)/_layout.tsx',
    'app/(app)/home/feed.tsx',
    'app/(app)/home/profile.tsx',
    'app/(app)/auth/sign-in.tsx',
    'app/(app)/auth/sign-up.tsx',
    'src/features/auth/client/supabaseClient.ts',
    'src/features/auth/auth.ts',
    'src/features/auth/client/useAuth.ts',
    'src/features/auth/ui/SignInForm.tsx',
    'src/features/auth/ui/SignUpForm.tsx',
    'src/features/payments/usePayments.ts',
    'src/features/theme/ThemeToggle.tsx',
    'src/tamagui/tamagui.config.ts',
    'src/tamagui/TamaguiRootProvider.tsx',
    'src/interface/layout/PageContainer.tsx',
    'src/interface/buttons/PrimaryButton.tsx',
    'src/interface/cards/FeedCard.tsx',
    'src/screens/OnboardingScreen.tsx',
    'src/screens/FeedScreen.tsx',
    'src/screens/ProfileScreen.tsx',
    'src/constants/env.ts',
    '.env.example',
    '.gitignore',
    'README.md',
  ];

  for (const file of alwaysCopy) {
    const src = path.join(templatesDir, file);
    const dest = path.join(projectDir, file);
    if (await fs.pathExists(src)) {
      await fs.copy(src, dest);
    }
  }

  // Conditional: Stripe web payments
  if (hasWeb) {
    await fs.copy(
      path.join(templatesDir, 'src/features/payments/stripeWeb.ts'),
      path.join(projectDir, 'src/features/payments/stripeWeb.ts')
    );
  }

  // Conditional: Mobile IAP
  if (hasMobile) {
    await fs.copy(
      path.join(templatesDir, 'src/features/payments/expoIAP.ts'),
      path.join(projectDir, 'src/features/payments/expoIAP.ts')
    );
  }

  // Replace placeholders in README
  const readmePath = path.join(projectDir, 'README.md');
  if (await fs.pathExists(readmePath)) {
    let readme = await fs.readFile(readmePath, 'utf-8');
    readme = readme.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
    await fs.writeFile(readmePath, readme);
  }

  // Create placeholder dirs
  await fs.ensureDir(path.join(projectDir, 'assets'));
  await fs.ensureDir(path.join(projectDir, 'public'));
  await fs.ensureDir(path.join(projectDir, 'app/api'));

  // Generate dynamic config files
  await generatePackageJson(projectDir, projectName, platforms);
  await generateBabelConfig(projectDir);
  await generateMetroConfig(projectDir);
  await generateAppConfig(projectDir, projectName, platforms);
  await generateTsConfig(projectDir);
}

async function generatePackageJson(projectDir, projectName, platforms) {
  const hasMobile = platforms.includes('ios') || platforms.includes('android');
  const hasWeb = platforms.includes('web');

  const deps = {
    'expo': '~52.0.0',
    'expo-router': '~4.0.0',
    'react': '^18.3.0',
    'react-native': '^0.76.0',
    'react-native-web': '^0.19.0',
    'react-dom': '^18.3.0',
    'react-native-safe-area-context': '^4.12.0',
    'react-native-screens': '~4.4.0',
    'tamagui': '^1.116.0',
    '@tamagui/config': '^1.116.0',
    '@tamagui/core': '^1.116.0',
    '@tamagui/lucide-icons': '^1.116.0',
    'zustand': '^5.0.0',
    '@supabase/supabase-js': '^2.49.0',
  };

  if (hasWeb) {
    deps['@stripe/stripe-js'] = '^2.4.0';
    deps['@expo/metro-runtime'] = '~4.0.0';
  }

  if (hasMobile) {
    deps['react-native-iap'] = '^14.0.0';
    deps['expo-dev-client'] = '~5.0.0';
  }

  const devDeps = {
    'typescript': '^5.6.0',
    '@types/react': '^18.3.0',
    '@babel/core': '^7.25.0',
    '@tamagui/babel-plugin': '^1.116.0',
  };

  const scripts = {
    'dev': 'npx expo start',
    'build:web': 'npx expo export --platform web',
    'start': 'npx expo start',
  };

  if (platforms.includes('ios')) {
    scripts['ios'] = 'npx expo start --ios';
  }
  if (platforms.includes('android')) {
    scripts['android'] = 'npx expo start --android';
  }
  if (hasWeb) {
    scripts['web'] = 'npx expo start --web';
  }

  const pkg = {
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts,
    dependencies: deps,
    devDependencies: devDeps,
  };

  await fs.writeJson(path.join(projectDir, 'package.json'), pkg, { spaces: 2 });
}

async function generateBabelConfig(projectDir) {
  const content = `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './src/tamagui/tamagui.config.ts',
        },
      ],
    ],
  };
};
`;
  await fs.writeFile(path.join(projectDir, 'babel.config.js'), content);
}

async function generateMetroConfig(projectDir) {
  const content = `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
`;
  await fs.writeFile(path.join(projectDir, 'metro.config.js'), content);
}

async function generateAppConfig(projectDir, projectName, platforms) {
  const slug = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const hasiOS = platforms.includes('ios');
  const hasAndroid = platforms.includes('android');

  let platformBlocks = '';

  if (hasiOS) {
    platformBlocks += `
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.yourcompany.${slug.replace(/-/g, '')}',
    },`;
  }

  if (hasAndroid) {
    platformBlocks += `
    android: {
      adaptiveIcon: { backgroundColor: '#ffffff' },
      package: 'com.yourcompany.${slug.replace(/-/g, '')}',
    },`;
  }

  const platformsArray = `\n    platforms: [${platforms.map(p => `'${p}'`).join(', ')}],`;

  const content = `import { type ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: '${projectName}',
  slug: '${slug}',
  version: '1.0.0',
  scheme: '${slug}',
  orientation: 'portrait',${platformsArray}
  web: {
    bundler: 'metro',
    output: 'single',
  },${platformBlocks}
  plugins: ['expo-router'],
};

export default config;
`;
  await fs.writeFile(path.join(projectDir, 'app.config.ts'), content);
}

async function generateTsConfig(projectDir) {
  const config = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      paths: {
        '~/*': ['./src/*'],
      },
    },
    include: ['src', 'app'],
    exclude: ['node_modules'],
  };

  await fs.writeJson(path.join(projectDir, 'tsconfig.json'), config, { spaces: 2 });
}
