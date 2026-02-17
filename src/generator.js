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
    'app/(app)/home/paywall.tsx',
    'app/(app)/home/settings.tsx',
    'app/(app)/auth/sign-in.tsx',
    'app/(app)/auth/sign-up.tsx',
    'app/(app)/auth/callback.tsx',
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
    'src/interface/feedback/Spinner.tsx',
    'src/interface/feedback/EmptyState.tsx',
    'src/interface/feedback/ErrorBoundary.tsx',
    'src/interface/feedback/LoadingState.tsx',
    'src/screens/OnboardingScreen.tsx',
    'src/screens/FeedScreen.tsx',
    'src/screens/ProfileScreen.tsx',
    'src/screens/PaywallScreen.tsx',
    'src/screens/SettingsScreen.tsx',
    '.gitignore',
    'README.md',
    'supabase/config.toml',
    'supabase/migrations/00001_init.sql',
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

  // Conditional: Mobile payments (RevenueCat)
  if (hasMobile) {
    await fs.copy(
      path.join(templatesDir, 'src/features/payments/revenueCat.ts'),
      path.join(projectDir, 'src/features/payments/revenueCat.ts')
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
  await generateEnvFiles(projectDir, platforms);

  // Generate EAS config for mobile
  if (hasMobile) {
    await generateEasJson(projectDir);
  }
}

async function generateEnvFiles(projectDir, platforms) {
  const hasMobile = platforms.includes('ios') || platforms.includes('android');
  const hasWeb = platforms.includes('web');

  // Generate .env.example
  const envLines = [
    'EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key',
  ];

  if (hasWeb) {
    envLines.push('EXPO_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...');
    envLines.push('STRIPE_SECRET_KEY=sk_test_...');
  }

  if (hasMobile) {
    envLines.push('EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...');
    envLines.push('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...');
  }

  await fs.writeFile(
    path.join(projectDir, '.env.example'),
    envLines.join('\n') + '\n'
  );

  // Generate src/constants/env.ts
  const envEntries = [
    `  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',`,
    `  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',`,
  ];

  if (hasWeb) {
    envEntries.push(`  STRIPE_PUBLIC_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY ?? '',`);
    envEntries.push(`  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',`);
  }

  if (hasMobile) {
    envEntries.push(`  REVENUECAT_IOS_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',`);
    envEntries.push(`  REVENUECAT_ANDROID_KEY: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '',`);
  }

  const requiredKeys = [`'SUPABASE_URL'`, `'SUPABASE_ANON_KEY'`];
  if (hasWeb) {
    requiredKeys.push(`'STRIPE_PUBLIC_KEY'`);
  }

  const envContent = `export const ENV = {
${envEntries.join('\n')}
} as const;

const REQUIRED_KEYS: (keyof typeof ENV)[] = [${requiredKeys.join(', ')}];

export function validateEnv() {
  const missing = REQUIRED_KEYS.filter((key) => !ENV[key]);
  if (missing.length > 0) {
    console.warn(
      '[env] Missing required environment variables: ' + missing.join(', ') +
      '\\nCopy .env.example to .env and fill in your keys.'
    );
  }
}
`;

  await fs.ensureDir(path.join(projectDir, 'src/constants'));
  await fs.writeFile(path.join(projectDir, 'src/constants/env.ts'), envContent);
}

async function generatePackageJson(projectDir, projectName, platforms) {
  const hasMobile = platforms.includes('ios') || platforms.includes('android');
  const hasWeb = platforms.includes('web');

  const deps = {
    'expo': '~54.0.0',
    'expo-router': '^6.0.0',
    'react': '^19.2.0',
    'react-native': '0.84.0',
    'react-native-web': '^0.21.0',
    'react-dom': '^19.2.0',
    'react-native-safe-area-context': '^5.6.0',
    'react-native-screens': '~4.23.0',
    'tamagui': '^2.0.0-rc.14',
    '@tamagui/config': '^2.0.0-rc.14',
    '@tamagui/core': '^2.0.0-rc.14',
    '@tamagui/lucide-icons': '^2.0.0-rc.14',
    'zustand': '^5.0.0',
    '@supabase/supabase-js': '^2.96.0',
    'react-native-reanimated': '^4.2.0',
    'react-native-gesture-handler': '^2.30.0',
    '@react-native-async-storage/async-storage': '^2.2.0',
    '@tanstack/react-query': '^5.90.0',
  };

  if (hasWeb) {
    deps['@stripe/stripe-js'] = '^8.7.0';
    deps['@stripe/react-stripe-js'] = '^3.1.0';
    deps['@expo/metro-runtime'] = '~6.1.0';
  }

  if (hasMobile) {
    deps['react-native-purchases'] = '^9.10.0';
    deps['expo-dev-client'] = '~6.0.0';
  }

  const devDeps = {
    'typescript': '^5.6.0',
    '@types/react': '^19.0.0',
    '@babel/core': '^7.25.0',
    '@tamagui/babel-plugin': '^2.0.0-rc.14',
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
    main: 'expo-router/entry',
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

async function generateEasJson(projectDir) {
  const config = {
    cli: {
      version: '>= 13.0.0',
    },
    build: {
      development: {
        developmentClient: true,
        distribution: 'internal',
      },
      preview: {
        distribution: 'internal',
      },
      production: {},
    },
    submit: {
      production: {},
    },
  };

  await fs.writeJson(path.join(projectDir, 'eas.json'), config, { spaces: 2 });
}
