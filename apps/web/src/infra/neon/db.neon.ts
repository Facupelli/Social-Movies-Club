import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-serverless';

config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL as string });
export const db = drizzle(pool);

export type PGDb = typeof db;
