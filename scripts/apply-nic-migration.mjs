/**
 * Apply supabase/add-nic-number.sql using direct Postgres connection.
 *
 *   DATABASE_URL='postgresql://postgres.[ref]:[PASSWORD]@...' npm run apply-nic-migration
 *
 * Get URI: Supabase Dashboard → Connect → Connection string → URI
 */
import pg from "pg";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([^=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const env = loadEnvLocal();
const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;

if (!databaseUrl) {
  console.error(`
Set DATABASE_URL to your Supabase Postgres connection string.

Dashboard → Connect → Connection string → URI
Example:
  DATABASE_URL='postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres' npm run apply-nic-migration

Or paste supabase/add-nic-number.sql into the SQL Editor and run it there.
`);
  process.exit(1);
}

const sqlPath = resolve(root, "supabase/add-nic-number.sql");
if (!existsSync(sqlPath)) {
  console.error("Missing", sqlPath);
  process.exit(1);
}

const sql = readFileSync(sqlPath, "utf8");
const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nic_number'`
  );
  if (rows.length === 0) {
    throw new Error("Migration ran but nic_number column not found");
  }
  console.log("OK — profiles.nic_number column is ready.");
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
