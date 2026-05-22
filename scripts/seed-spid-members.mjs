/**
 * Create SPID member accounts via Admin API (alternative to seed-spid-members.sql).
 * Requires SUPABASE_SECRET_KEY in .env.local
 *
 *   npm run seed-spid-members
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const MEMBERS = [
  ["001", "Disanayake D N W", "spid001@library.local"],
  ["005", "Theekshana G.L.L.", "spid005@library.local"],
  ["13", "PRIYASHAN H.M.M", "spid013@library.local"],
  ["015", "LASITHA NILMINI M K", "spid015@library.local"],
  ["036", "sanjeewa L V D", "spid036@library.local"],
  ["038", "ACHINTHA L", "spid038@library.local"],
  ["040", "MITHILA A", "spid040@library.local"],
  ["046", "THAKSHILA A.K.G", "spid046@library.local"],
  ["047", "DEVIKA A P", "spid047@library.local"],
  ["049", "KALANI B.A", "spid049@library.local"],
  ["050", "BUDDHI K.K", "spid050@library.local"],
  ["051", "Liyanage Mahesha", "spid051@library.local"],
  ["052", "sandamali P.V.C", "spid052@library.local"],
  ["053", "BHAGYA M", "spid053@library.local"],
  ["054", "TASHMI B.C", "spid054@library.local"],
  ["055", "PUSHPA U.G.R", "spid055@library.local"],
  ["056", "NIMANTHIKA N.M.D", "spid056@library.local"],
  ["057", "RASANA I F", "spid057@library.local"],
  ["058", "SAMANTHA G.H.A.L", "spid058@library.local"],
  ["063", "ISHARA K A A", "spid063@library.local"],
  ["065", "JAYASEKARA D.P.G", "spid065@library.local"],
  ["081", "harshika P G G B", "spid081@library.local"],
  ["097", "NILUKA LAKMALI J P", "spid097@library.local"],
  ["106", "INDEEWARI L.M.D", "spid106@library.local"],
  ["410", "DAKSHIKA A G", "spid410@library.local"],
  ["495", "KOKILA D P", "spid495@library.local"],
  ["910", "SANDARUWAN S", "spid910@library.local"],
  ["915", "PUBUDI H", "spid915@library.local"],
];

const PASSWORD = "LibraryMember2026!";

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
const secretKey = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !secretKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const [staffId, fullName, email] of MEMBERS) {
    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing?.id) {
      const { data: current } = await admin
        .from("profiles")
        .select("nic_number")
        .eq("id", existing.id)
        .single();
      const { error: upErr } = await admin.from("profiles").update({
        full_name: fullName,
        role: "member",
        nic_number: current?.nic_number ?? null,
        borrow_token_limit: 3,
        borrow_tokens_used: 0,
        is_active: true,
      }).eq("id", existing.id);
      if (upErr) {
        console.error(`Update ${email}:`, upErr.message);
        failed++;
      } else {
        console.log(`↻ exists ${email}`);
        skipped++;
      }
      continue;
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName, staff_id: staffId },
    });

    if (error) {
      console.error(`✗ ${email}:`, error.message);
      failed++;
      continue;
    }

    const userId = data.user?.id;
    if (!userId) {
      console.error(`✗ ${email}: no user id`);
      failed++;
      continue;
    }

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        role: "member",
        nic_number: null,
        borrow_token_limit: 3,
        borrow_tokens_used: 0,
        is_active: true,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error(`✗ profile ${email}:`, profileError.message);
      failed++;
      continue;
    }

    console.log(`✓ ${email}`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} refreshed, ${failed} failed`);
  console.log(`Password for all: ${PASSWORD}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
