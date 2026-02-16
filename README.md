# create-universal-app

CLI tool to scaffold cross-platform apps with One, Tamagui, Supabase, and Stripe.

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
   - **One framework** for universal routing
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
