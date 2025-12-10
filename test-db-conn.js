// Quick DB connection test for migrations troubleshooting
import dotenv from 'dotenv';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// try load keamachi-api/.env if top-level vars missing
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
    console.log('Attempting to connect with config:', connectionString ? '[connection string redacted]' : clientConfig);
    await client.connect();
    const r = await client.query('SELECT now()');
    console.log('Connected OK, server time:', r.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection failed:', err);
    process.exitCode = 1;
  }
})();
