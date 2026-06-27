import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the connection pool
// Note: In a real app, these values would come from environment variables.
// We are hardcoding the defaults for easy local setup based on our schema.
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Helper function to execute queries
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
