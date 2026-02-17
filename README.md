# create-universal-app

CLI tool to scaffold cross-platform apps with Expo Router, Tamagui, Supabase, and Stripe.

## Prerequisites

- **Node.js** 18+
- **bun** (recommended) or npm
- **Git**

### Windows (WSL)

If you're on Windows, use WSL for the best experience:

1. Install WSL from PowerShell (admin): `wsl --install`
2. Install Node.js in WSL:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Install unzip: `sudo apt-get install -y unzip`
4. Install bun: `curl -fsSL https://bun.sh/install | bash`
5. Work from the native WSL filesystem (`~`) instead of `/mnt/c/` for better performance

## Usage

```bash
# Run directly
node bin/index.js

# Or after publishing to npm
npx create-universal-app
```

## What it does

1. Asks for your project name
2. Lets you select platforms (Web, iOS, Android)
3. Scaffolds a complete project with:
   - **Expo Router** for universal routing
   - **Tamagui** for cross-platform UI
   - **Supabase** auth (email/password + Google OAuth)
   - **Stripe** payments (web) + in-app purchases (mobile)
   - **Zustand** for state management
   - Prebuilt screens: Onboarding, Sign In, Sign Up, Feed, Profile

## Development

```bash
npm install
node bin/index.js
```
