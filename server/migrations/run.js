import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'care_matching'
});

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    // 1. マイグレーション管理テーブルを作成
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
    const migrationFiles = (await fs.readdir(__dirname))
      .filter(file => file.endsWith('.sql'))
      .sort(); // ファイル名でソートして実行順を保証

    // 4. 未実行のマイグレーションを実行
    for (const file of migrationFiles) {
      if (!executedVersions.includes(file)) {
        console.log(`Running migration: ${file}`);
        
        const filePath = path.join(__dirname, file);
        const sql = await fs.readFile(filePath, 'utf-8');

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
          throw err; // エラーが発生したら以降のマイグレーションを中止
        }
      }
    }

    console.log('Migrations completed successfully.');

  } catch (error) {
    console.error('Migration process failed.');
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations();
