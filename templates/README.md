# {{PROJECT_NAME}}

Cross-platform app built with One, Tamagui, Supabase, and Stripe.

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase and Stripe keys in `.env`.

3. Start development:
   ```bash
   bun dev          # Web (localhost)
   bun ios          # iOS simulator
   bun android      # Android emulator
   ```

## Project Structure

```
app/              File-based routing (One framework)
src/
  features/       Feature modules (auth, payments, theme)
  interface/      Reusable UI components
  screens/        Screen components
  tamagui/        Theme configuration
  constants/      App constants and env
assets/           Images, icons, splash screens
public/           Static web assets
```

## Stack

- **Framework**: [One](https://onestack.dev) (universal React)
- **UI**: [Tamagui](https://tamagui.dev) (cross-platform components)
- **Auth**: [Supabase](https://supabase.com) (email/password + Google OAuth)
- **Payments**: [Stripe](https://stripe.com) (web) + react-native-iap (mobile)
- **State**: [Zustand](https://zustand-demo.pmnd.rs)
- **Build**: [Vite](https://vitejs.dev)

## Auth Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Enable Email/Password auth in Authentication > Providers
3. Enable Google OAuth and add your credentials
4. Copy your project URL and anon key to `.env`

## Payments Setup

### Web (Stripe)
1. Create an account at [stripe.com](https://stripe.com)
2. Copy your publishable and secret keys to `.env`
3. Create products/prices in the Stripe dashboard

### Mobile (In-App Purchases)
1. Configure products in App Store Connect / Google Play Console
2. Update SKU list in `src/features/payments/expoIAP.ts`
