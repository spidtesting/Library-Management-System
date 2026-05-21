/**
 * Verify Supabase env keys before create-admin / create member.
 * Run: node scripts/check-supabase-env.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error("Missing .env.local — copy from .env.local.example");
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([^=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

function keyRole(key) {
  if (!key) return null;
  if (key.startsWith("sb_secret_")) return "secret";
  if (key.startsWith("sb_publishable_")) return "publishable";
  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
    return payload.role ?? "unknown";
  } catch {
    return "invalid";
  }
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const publishable =
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secret = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

console.log("\nSupabase environment check\n");

let ok = true;

if (!url) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_URL is missing");
  ok = false;
} else {
  console.log("✓ NEXT_PUBLIC_SUPABASE_URL set");
}

if (!publishable) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_ANON_KEY (or PUBLISHABLE_KEY) is missing");
  ok = false;
} else {
  console.log(`✓ Publishable/anon key (${keyRole(publishable)})`);
}

if (!secret) {
  console.error("✗ SUPABASE_SECRET_KEY is missing");
  ok = false;
} else if (secret === publishable) {
  console.error("✗ SUPABASE_SECRET_KEY / SERVICE_ROLE_KEY is the SAME as anon key");
  console.error("  Member create and admin scripts need the secret/service_role key.");
  ok = false;
} else {
  const role = keyRole(secret);
  if (role === "secret" || role === "service_role") {
    console.log(`✓ Secret key (${role})`);
  } else {
    console.error(`✗ Secret key looks wrong (role: ${role}) — use sb_secret_... or service_role JWT`);
    ok = false;
  }
}

console.log("");
if (!ok) {
  console.log("Fix:");
  console.log("  1. Open https://supabase.com/dashboard/project/_/settings/api");
  console.log("  2. Copy Secret key (sb_secret_...) OR legacy service_role JWT");
  console.log("  3. Add to .env.local:");
  console.log("     SUPABASE_SECRET_KEY=sb_secret_xxxxxxxx");
  console.log("  4. Remove wrong SUPABASE_SERVICE_ROLE_KEY if it equals anon");
  console.log("  5. Restart: npm run dev\n");
  process.exit(1);
}

console.log("All keys look correct. Restart dev server if you just changed .env.local.\n");
