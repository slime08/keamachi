// server/db.ts
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

let pool: any = null;

const getDbConfig = () => {
  if (process.env.SUPABASE_URL) {
    console.log("Using SUPABASE_URL for database connection.");
    return { connectionString: process.env.SUPABASE_URL + "?sslmode=require" };
  } else if (process.env.POSTGRES_URL) {
    console.log("Using POSTGRES_URL (Vercel Postgres) for database connection.");
    return { connectionString: process.env.POSTGRES_URL + "?sslmode=require" };
  } else {
    console.log("Using local .env variables for database connection.");
    return {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'care_matching'
    };
  }
};

const dbConfig = getDbConfig();

try {
  pool = new Pool(dbConfig);
  console.log('✅ DB Pool created successfully.');
} catch (e) {
    console.error("❌ DB Pool creation failed.", e)
}

export const query = async (text: string, params?: any[]) => {
  if (pool) {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      // console.log('executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('DB Query Error:', error);
      throw error;
    }
  } else {
    console.log('⚠️  DB pool is not available. Returning mock response.');
    return { rows: [], rowCount: 0 };
  }
};

export default pool;
