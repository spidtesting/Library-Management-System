/**
 * Create or promote an admin user (requires SUPABASE_SECRET_KEY).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) {
    console.error("Missing .env.local");
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([^=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey =
  env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey =
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const email = process.env.ADMIN_EMAIL ?? "admin@library.local";
const password = process.env.ADMIN_PASSWORD ?? "LibraryAdmin123!";
const fullName = process.env.ADMIN_NAME ?? "Library Admin";

if (!url || !secretKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

if (publishableKey && secretKey === publishableKey) {
  console.error("SUPABASE_SECRET_KEY must not equal the publishable key.");
  process.exit(1);
}

const admin = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function printFixHelp() {
  console.error(`
Database error creating new user = broken trigger on auth.users

FASTEST FIX (recommended):
  1. Supabase Dashboard → SQL Editor → New query
  2. Paste and RUN: supabase/disable-auth-trigger.sql
  3. npm run create-admin

Then (so /register works for members):
  4. Run: supabase/fix-signup-trigger.sql

ALTERNATIVE — create user in Dashboard:
  Authentication → Users → Add user
  ADMIN_EMAIL=you@mail.com npm run promote-admin
`);
}

async function ensureAdminProfile(userId, userEmail) {
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: userEmail,
        full_name: fullName,
        role: "admin",
        is_active: true,
      },
      { onConflict: "id" }
    )
    .select("id, email, role, full_name")
    .single();

  if (profileError) {
    console.error("Profile upsert failed:", profileError.message);
    console.error("Run supabase/library_schema.sql if the profiles table is missing.");
    process.exit(1);
  }
  return profile;
}

async function main() {
  const { error: tableError } = await admin.from("profiles").select("id").limit(1);
  if (tableError) {
    console.error("profiles table:", tableError.message);
    console.error("Run supabase/library_schema.sql in SQL Editor first.");
    process.exit(1);
  }

  const { data: listData, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    console.error("Auth admin API failed:", listError.message);
    process.exit(1);
  }

  let userId = listData.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  )?.id;

  if (!userId) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      console.error("Create user failed:", createError.message);
      printFixHelp();
      process.exit(1);
    }
    userId = created.user.id;
    console.log("Created auth user:", email);
  } else {
    console.log("Auth user already exists:", email);
    const { error: pwError } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (pwError) {
      console.warn("Could not update password:", pwError.message);
    }
  }

  const profile = await ensureAdminProfile(userId, email);

  console.log("\nAdmin ready:\n", profile);
  console.log("\nSign in at http://localhost:3000/login");
  console.log("  Email:   ", email);
  console.log("  Password:", password);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
