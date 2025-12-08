import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// 開発環境: DB接続がない場合はモック関数を使用
const useDB = process.env.NODE_ENV === 'production' || process.env.DB_HOST !== 'localhost';

let pool: any = null;

if (useDB) {
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'care_matching'
  });
} else {
  console.log('⚠️  Development mode: Using mock database');
}

export const query = async (text: string, params?: any[]) => {
  if (pool) {
    try {
      return await pool.query(text, params);
    } catch (error) {
      console.error('DB Query Error:', error);
      throw error;
    }
  } else {
    // Mock return for development
    return { rows: [], rowCount: 0 };
  }
};

export default pool;

