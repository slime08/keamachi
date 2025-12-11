import dotenv from 'dotenv';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tryAlt = path.resolve(__dirname, 'keamachi-api', '.env');
if (!process.env.SUPABASE_URL && !process.env.POSTGRES_URL && fs.existsSync(tryAlt)) {
  dotenv.config({ path: tryAlt });
  console.log(`Loaded env from ${tryAlt}`);
}

const connectionString = process.env.SUPABASE_URL || process.env.POSTGRES_URL || null;
const clientConfig = connectionString ? { connectionString, ssl: { rejectUnauthorized: false } } : {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'care_matching',
  ssl: { rejectUnauthorized: false }
};

(async () => {
  const client = new Client(clientConfig);
  try {
    await client.connect();
    const r = await client.query('SELECT id, name, location, service_type, phone, email FROM facilities ORDER BY id LIMIT 20');
    console.log('Facilities rows:', r.rows.length);
    console.log(JSON.stringify(r.rows, null, 2));
    await client.end();
  } catch (err) {
    console.error('DB 謗･邯壼､ｱ謨・', err.message || err);
    process.exitCode = 1;
  }
})();
