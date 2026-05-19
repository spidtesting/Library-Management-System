/**
 * Apply disable-auth-trigger.sql using direct Postgres connection.
 * Get connection string: Dashboard → Connect → URI (Session mode)
 *
 *   DATABASE_URL='postgresql://postgres.[ref]:[PASSWORD]@...' npm run fix-auth-trigger
 */
import pg from "pg";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(`
Set DATABASE_URL to your Supabase Postgres connection string.

Dashboard → Connect → Connection string → URI
Example:
  DATABASE_URL='postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres' npm run fix-auth-trigger

Or run manually in SQL Editor:
  supabase/disable-auth-trigger.sql
`);
  process.exit(1);
}

const sqlPath = resolve(root, "supabase/disable-auth-trigger.sql");
if (!existsSync(sqlPath)) {
  console.error("Missing", sqlPath);
  process.exit(1);
}

const sql = readFileSync(sqlPath, "utf8");
const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log("OK — auth trigger disabled. Now run: npm run create-admin");
  console.log("Then run fix-signup-trigger.sql in SQL Editor so /register works.");
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
