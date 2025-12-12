import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// If project-level keys are not present, try keamachi-api/.env
if (!process.env.SUPABASE_PROJECT_URL && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    dotenv.config({ path: './keamachi-api/.env' });
    console.log('Loaded keamachi-api/.env');
  } catch (e) {
    // ignore
  }
}

const url = process.env.SUPABASE_PROJECT_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('SUPABASE_PROJECT_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

(async () => {
  const { data, error } = await supabase.from('facilities').select('*').limit(20);
  if (error) {
    console.error('Supabase query error:', error);
    process.exit(1);
  }
  console.log('Facilities count:', data.length);
  console.log(JSON.stringify(data.slice(0,10), null, 2));
})();
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("DB 接続成功", result.rows);
  } catch (e) {
    console.error("DB 接続エラー", e.message);
  } finally {
    process.exit();
  }
})();
