/**
 * Promote an existing Auth user to admin (no new user created).
 * Use when the user was added in Dashboard → Authentication → Users.
 *
 *   ADMIN_EMAIL=you@mail.com npm run promote-admin
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) process.exit(1);
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
const email = process.env.ADMIN_EMAIL;
if (!email) {
  console.error("Set ADMIN_EMAIL=you@mail.com");
  process.exit(1);
}

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
const user = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  console.error("No auth user with email:", email);
  console.error("Create them in Dashboard → Authentication → Users first.");
  process.exit(1);
}

const { data, error } = await admin
  .from("profiles")
  .upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? email.split("@")[0],
    role: "admin",
    is_active: true,
  })
  .select("id, email, role, full_name")
  .single();

if (error) {
  console.error("Failed:", error.message);
  process.exit(1);
}

console.log("Promoted to admin:\n", data);
console.log("\nSign in at http://localhost:3000/login");
