import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from current working directory first
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// If top-level SUPABASE_URL / POSTGRES_URL are not present, try loading keamachi-api/.env
if (!process.env.SUPABASE_URL && !process.env.POSTGRES_URL) {
  const altEnv = path.resolve(__dirname, '..', '..', 'keamachi-api', '.env');
  if (fs.existsSync(altEnv)) {
    dotenv.config({ path: altEnv });
    console.log(`Loaded environment from ${altEnv}`);
  }
}

const getDbConfig = () => {
  if (process.env.SUPABASE_URL) {
    console.log("Using SUPABASE_URL for database connection for migrations.");
    // Allow an explicit development override to relax TLS validation when
    // connecting to a database with a self-signed certificate.
    // Set DEV_ALLOW_INSECURE_TLS=true in your local .env to enable.
    // This MUST NOT be enabled in production (NODE_ENV=production).
    if (process.env.DEV_ALLOW_INSECURE_TLS === 'true' && process.env.NODE_ENV !== 'production') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      console.warn('DEV_ALLOW_INSECURE_TLS is enabled: TLS certificate validation is disabled for this process.');
    }
    return { connectionString: process.env.SUPABASE_URL + "?sslmode=require", ssl: { rejectUnauthorized: false } };
  } else if (process.env.POSTGRES_URL) {
    console.log("Using POSTGRES_URL (Vercel Postgres) for database connection for migrations.");
    if (process.env.DEV_ALLOW_INSECURE_TLS === 'true' && process.env.NODE_ENV !== 'production') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      console.warn('DEV_ALLOW_INSECURE_TLS is enabled: TLS certificate validation is disabled for this process.');
    }
    return { connectionString: process.env.POSTGRES_URL + "?sslmode=require", ssl: { rejectUnauthorized: false } };
  } else {
    console.log("Using local .env variables for database connection for migrations.");
    return {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'care_matching'
      , ssl: { rejectUnauthorized: false }
    };
  }
};

  const pool = new Pool(getDbConfig());

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    // 1. マイグレーション履歴テーブルを作成
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY
      );
    `);

    // 2. 実行済みのマイグレーションを取得
    const executedMigrationsResult = await client.query('SELECT version FROM schema_migrations');
    const executedVersions = executedMigrationsResult.rows.map(r => r.version);
    console.log('Already executed versions:', executedVersions);

    // 3. ディレクトリからマイグレーションファイルを取得 
    const migrationFiles = (await fsPromises.readdir(__dirname))
      .filter(file => file.endsWith('.sql'))
      .sort(); // 繝輔ぃ繧､繝ｫ蜷阪〒繧ｽ繝ｼ繝医＠縺ｦ螳溯｡碁・ｒ菫晁ｨｼ

    // 4. 未実行のマイグレーションを実行 
    for (const file of migrationFiles) {
      if (!executedVersions.includes(file)) {
        console.log(`Running migration: ${file}`);
        
        const filePath = path.join(__dirname, file);
        const sql = await fsPromises.readFile(filePath, 'utf-8');

        // トランザクション内で実行 
        try {
          await client.query('BEGIN');
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`  -> ${file} successfully migrated.`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`Failed to migrate ${file}. Rolled back.`, err);
          throw err; // エラーが発生したらロールバック 
        }
      }
    }

    console.log('Migrations completed successfully.');

  } catch (error) {
    console.error('Migration process failed.', error);
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations();
