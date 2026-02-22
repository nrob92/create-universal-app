#!/usr/bin/env node

import { runPrompts } from "../src/prompts.js";
import { generateProject } from "../src/generator.js";
import { runInstaller } from "../src/installer.js";
import { setupSupabase, createSupabaseProject } from "../src/supabase.js";
import { setupEas } from "../src/eas.js";
import chalk from "chalk";
import path from "path";
import fs from "fs-extra";
import { spawn } from "child_process";

function initGit(projectDir) {
  return new Promise((resolve) => {
    const run = (cmd, args) =>
      new Promise((res) => {
        const child = spawn(cmd, args, {
          cwd: projectDir,
          shell: true,
          stdio: "pipe",
        });
        child.on("close", res);
        child.on("error", () => res(1));
      });
    run("git", ["init"])
      .then(() => run("git", ["add", "."]))
      .then(() =>
        run("git", [
          "-c",
          "user.email=scaffold@create-universal-app",
          "-c",
          "user.name=create-universal-app",
          "commit",
          "-m",
          "init",
        ]),
      )
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

async function main() {
  console.log(chalk.bold.cyan("\n  ✦ Universal App Generator\n"));
  console.log(
    chalk.dim(
      "  Scaffold cross-platform apps with Expo Router, Tamagui, Supabase & Stripe\n",
    ),
  );

  // ── Step 1: Get all project details ─────────────────────────────────────
  const answers = await runPrompts();

  const hasMobile =
    answers.platforms.includes("ios") || answers.platforms.includes("android");
  const hasWeb = answers.platforms.includes("web");

  // ── Step 2: Supabase setup FIRST ──────────────────────────────────────
  let supabaseSetupSuccess = false;
  let supabaseKeys = null;
  let supabaseProjectRef = answers.supabaseProjectRef;

  if (answers.supabaseOption === "new" && answers.newProjectDetails) {
    console.log(chalk.bold.cyan("\n  ═══ Setting up Supabase FIRST ═══\n"));

    // Create Supabase project BEFORE scaffolding
    const createResult = await createSupabaseProject(
      answers.newProjectDetails.supabaseProjectName || answers.projectName,
      answers.newProjectDetails.orgId,
      answers.newProjectDetails.dbPassword,
      answers.newProjectDetails.region,
    );

    if (!createResult.success) {
      console.log(
        chalk.red(
          '\n  Failed to create Supabase project. Please try again or select "Link to existing".\n',
        ),
      );
      process.exit(1);
    }

    if (createResult.projectRef) {
      supabaseProjectRef = createResult.projectRef;
      console.log(
        chalk.green(`  ✅ Supabase project created: ${supabaseProjectRef}\n`),
      );
    } else {
      console.log(
        chalk.yellow(
          "\n  Could not get project ref. Please enter it manually.\n",
        ),
      );
      process.exit(1);
    }
  }

  // ── Step 3: Scaffold project ───────────────────────────────────────────
  console.log("");
  const { default: ora } = await import("ora");
  const spinner = ora("Scaffolding project...").start();

  try {
    // Pass all details to generator
    await generateProject({
      ...answers,
      supabaseProjectRef,
      supabaseKeys,
    });
    spinner.succeed(chalk.green("Project scaffolded successfully!"));
  } catch (err) {
    spinner.fail("Failed to scaffold project");
    console.error(chalk.red(err.message));
    process.exit(1);
  }

  const projectDir = path.resolve(process.cwd(), answers.projectName);

  // ── Step 4: Link Supabase and push schema ───────────────────────────────
  if (answers.supabaseOption !== "skip" && supabaseProjectRef) {
    console.log(chalk.bold.cyan("\n  ═══ Linking Supabase ═══\n"));

    // Link the project
    const linkResult = await setupSupabase(
      projectDir,
      "existing", // Use existing since we have the ref
      supabaseProjectRef,
      answers.projectName,
    );

    supabaseSetupSuccess = linkResult.success;
    supabaseKeys = linkResult.keys;

    // Auto-write .env with actual Supabase keys
    if (supabaseKeys) {
      const envExamplePath = path.join(projectDir, ".env.example");
      const envPath = path.join(projectDir, ".env");
      if (await fs.pathExists(envExamplePath)) {
        let envContent = await fs.readFile(envExamplePath, "utf-8");
        envContent = envContent.replace(
          "https://your-project.supabase.co",
          supabaseKeys.url,
        );
        envContent = envContent.replace("your-anon-key", supabaseKeys.anonKey);
        await fs.writeFile(envPath, envContent);
      }
    }
  }

  // ── Step 5: Install dependencies ────────────────────────────────────────
  let installSuccess = false;
  if (answers.runInstall) {
    const result = await runInstaller(answers.projectName);
    installSuccess = result !== null;
  }

  // ── Step 5b: Init git repo so EAS uses npm (package-lock.json tracked) ──
  if (installSuccess) {
    await initGit(projectDir);
  }

  const runCmd = "npm run";

  let setupGoogleAuth = false;
  let setupPayments = false;

  // ── Step 5c: Google Auth / Payments Prompts ─────────────────────────────
  const { confirm, input } = await import("@inquirer/prompts");
  const { exec } = await import("child_process");

  if (supabaseSetupSuccess && supabaseProjectRef) {
    setupGoogleAuth = await confirm({
      message: "\nSet up Google Auth now? (Requires manual step in browser)",
      default: true,
    });

    if (setupGoogleAuth) {
      console.log(chalk.bold.cyan("\n  ═══ Google Auth Setup ═══\n"));
      console.log(chalk.white("  1. We will open the Google Cloud Console."));
      console.log(
        chalk.white(`  2. Add this exactly as your Authorized Redirect URI:`),
      );
      console.log(
        chalk.green(
          `     https://${supabaseProjectRef}.supabase.co/auth/v1/callback\n`,
        ),
      );

      console.log(
        chalk.dim("  Opening browser to Google Cloud Credentials..."),
      );
      const isWindows = process.platform === "win32";
      if (isWindows) {
        exec("start https://console.cloud.google.com/apis/credentials");
      } else if (process.platform === "darwin") {
        exec("open https://console.cloud.google.com/apis/credentials");
      } else {
        exec("xdg-open https://console.cloud.google.com/apis/credentials");
      }

      const googleWebId = await input({
        message: 'Paste your Web Client ID from Google Cloud (or type "skip"):',
        validate: (v) =>
          v.trim() ? true : 'Required to continue (or type "skip").',
      });

      if (googleWebId.toLowerCase() !== "skip") {
        const googleWebSecret = await input({
          message: "Paste your Web Client Secret from Google Cloud:",
          validate: (v) => (v.trim() ? true : "Required to continue."),
        });

        // Write directly to .env
        const envPath = path.join(projectDir, ".env");
        if (await fs.pathExists(envPath)) {
          let envContent = await fs.readFile(envPath, "utf-8");
          envContent = envContent.replace(
            "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id",
            `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=${googleWebId}`,
          );
          await fs.writeFile(envPath, envContent);
        }

        console.log(chalk.dim("\n  Automating Supabase Auth configuration..."));

        const { updateAuthConfig } = await import("../src/supabase.js");

        let token = null;
        if (process.env.SUPABASE_ACCESS_TOKEN) {
          token = process.env.SUPABASE_ACCESS_TOKEN;
        } else {
          const { getSupabaseToken } = await import("../src/supabase.js");
          token = getSupabaseToken();
        }

        if (!token) {
          console.log(
            chalk.yellow(
              "\n  ⚠️ Could not automatically find your Supabase Personal Access Token (PAT).",
            ),
          );
          console.log(
            chalk.dim(
              "     You can generate one here: https://supabase.com/dashboard/account/tokens",
            ),
          );
          const manualToken = await input({
            message:
              'Please paste your Supabase Personal Access Token (or type "skip"):',
            validate: (v) =>
              v.trim() ? true : 'Required to continue (or type "skip").',
          });

          if (manualToken.toLowerCase() !== "skip") {
            token = manualToken.trim();
          }
        }

        if (token) {
          const slug = answers.projectName
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-");
          const redirectUrl = `${slug}://**`;

          const updateResult = await updateAuthConfig(
            supabaseProjectRef,
            {
              external_google_enabled: true,
              external_google_client_id: googleWebId,
              external_google_secret: googleWebSecret,
              external_google_skip_nonce_check: true,
              uri_allow_list: [redirectUrl],
            },
            token,
          );

          if (updateResult.success) {
            console.log(
              chalk.green("  ✅ Supabase Google Auth enabled & configured!"),
            );
            console.log(
              chalk.green("  ✅ Added Google Client ID to your local .env\n"),
            );
          } else {
            console.log(
              chalk.green("\n  ✅ Added Google Client ID to your local .env"),
            );
            console.log(
              chalk.yellow(
                `  ⚠️  Could not auto-configure Supabase (${updateResult.message}).`,
              ),
            );
            console.log(
              chalk.yellow(
                `  ⚠️  Please manually paste the Client ID and Secret into your Supabase Dashboard -> Authentication -> Providers -> Google\n      URL: https://supabase.com/dashboard/project/${supabaseProjectRef}/auth/providers\n`,
              ),
            );
          }
        } else {
          console.log(
            chalk.green("\n  ✅ Added Google Client ID to your local .env"),
          );
          console.log(
            chalk.yellow(
              `  ⚠️  Please manually paste the Client ID and Secret into your Supabase Dashboard -> Authentication -> Providers -> Google\n      URL: https://supabase.com/dashboard/project/${supabaseProjectRef}/auth/providers\n`,
            ),
          );
        }
      } else {
        setupGoogleAuth = false;
      }
    }
  }

  // ── Step 5d: Payments Prompts ─────────────────────────────
  console.log(chalk.bold.cyan("\n  ═══ Payments Setup ═══\n"));
  console.log(chalk.white("  We have included automated setup scripts for payments:"));
  console.log(chalk.white(`  - ${chalk.cyan("npm run setup:stripe")}      Configures Stripe products, prices, and keys`));
  console.log(chalk.white(`  - ${chalk.cyan("npm run setup:revenuecat")}  Configures RevenueCat API keys for mobile\n`));

  setupPayments = true; // Mark as true so README instructions show correctly if needed


  // ── Step 6: EAS setup (if applicable) ──────────────────────────────────
  if (hasMobile) {
    const { confirm } = await import("@inquirer/prompts");
    const setupEasBuilds = await confirm({
      message:
        "\nSet up EAS builds now? (Runs eas-cli login and configures builds)",
      default: true,
    });

    if (setupEasBuilds) {
      if (installSuccess) {
        const easResult = await setupEas(projectDir, answers.platforms);
        if (!easResult.success) {
          console.log(
            chalk.yellow("  Note: EAS setup requires additional steps.\n"),
          );
        }
      } else {
        console.log(
          chalk.yellow(
            "\n  ⚠️  EAS setup skipped because dependencies failed to install.",
          ),
        );
        console.log(chalk.yellow('  Run "npm install" first, then:\n'));
        console.log(chalk.white("    npx eas-cli init"));
        console.log(chalk.white("    npx eas-cli credentials --platform ios"));
        console.log(
          chalk.white(
            "    npx eas-cli build --profile development --platform ios\n",
          ),
        );
      }
    } else {
      console.log(
        chalk.dim("\n  EAS setup skipped. Run these commands when ready:\n"),
      );
      console.log(chalk.white("    npx eas-cli login"));
      console.log(chalk.white("    npx eas-cli project:init"));
      console.log(
        chalk.white(
          "    npx eas-cli build --profile development --platform ios",
        ),
      );
      console.log(
        chalk.white(
          "    npx eas-cli build --profile development --platform android\n",
        ),
      );
    }
  }

  // ── Step 7: Final instructions ─────────────────────────────────────────
  console.log(chalk.bold.green("\n  ✅ All done!\n"));

  if (supabaseSetupSuccess && supabaseKeys) {
    console.log(
      chalk.white("    EXPO_PUBLIC_SUPABASE_URL        ") +
        chalk.cyan(supabaseKeys.url),
    );
    console.log(
      chalk.white("    EXPO_PUBLIC_SUPABASE_ANON_KEY   ") +
        chalk.dim(supabaseKeys.anonKey.substring(0, 20) + "..."),
    );
    console.log("");
  }

  console.log(chalk.bold.green("  Get started:\n"));
  console.log(chalk.white(`    cd ${answers.projectName}`));
  if (!answers.runInstall) {
    console.log(chalk.white("    npm install"));
  }
  if (supabaseSetupSuccess && supabaseKeys) {
    console.log(
      chalk.dim(
        "    .env created with Supabase keys — add remaining keys below",
      ),
    );
  } else {
    console.log(chalk.white("    cp .env.example .env"));
  }
  console.log(chalk.white(`    ${runCmd} dev\n`));

  // Show remaining env keys if needed
  if (!supabaseSetupSuccess || !supabaseKeys) {
    console.log(chalk.bold.yellow("  Fill in .env with your keys:\n"));
    console.log(
      chalk.white("    EXPO_PUBLIC_SUPABASE_URL        ") +
        chalk.dim("supabase.com/dashboard → Project Settings → API"),
    );
    console.log(
      chalk.white("    EXPO_PUBLIC_SUPABASE_ANON_KEY   ") +
        chalk.dim('same page, under "anon public"'),
    );
  }

  if (hasWeb && !setupPayments) {
    console.log(
      chalk.white("    EXPO_PUBLIC_STRIPE_PUBLIC_KEY   ") +
        chalk.dim("dashboard.stripe.com/apikeys"),
    );
    console.log(
      chalk.white("    STRIPE_SECRET_KEY               ") +
        chalk.dim("same page (secret key)"),
    );
  }
  if (hasMobile && !setupPayments) {
    console.log(
      chalk.white("    EXPO_PUBLIC_REVENUECAT_IOS_KEY  ") +
        chalk.dim("app.revenuecat.com → API Keys"),
    );
    console.log(
      chalk.white("    EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ") +
        chalk.dim("same page"),
    );
    console.log(
      chalk.dim("\n    RevenueCat Manual Steps:"),
    );
    console.log(
      chalk.dim("      1. Create a Project in RevenueCat"),
    );
    console.log(
      chalk.dim("      2. Create an Entitlement named EXACTLY 'premium'"),
    );
    console.log(
      chalk.dim("      3. Link your products to the entitlement"),
    );
  }
  console.log("");

  // Seed instructions
  if (supabaseSetupSuccess) {
    console.log(chalk.dim("    Seed your plans table:"));
    console.log(
      chalk.dim(
        "      INSERT INTO plans (name, slug, price_monthly, features)",
      ),
    );
    console.log(
      chalk.dim(
        "      VALUES ('Pro', 'pro', 9.99, '[\\\"Unlimited projects\\\", \\\"Priority support\\\"]');",
      ),
    );
    console.log("");
  }

  // Summary
  const platformList = answers.platforms.join(", ");
  console.log(chalk.dim(`  Platforms: ${platformList}`));
  console.log(chalk.dim("  Framework: Expo Router + Tamagui"));
  console.log(
    chalk.dim(
      "  Auth: Supabase | Payments: Stripe (web) + RevenueCat (mobile)\n",
    ),
  );
}

main().catch((err) => {
  console.error(chalk.red(err.message));
  process.exit(1);
});
