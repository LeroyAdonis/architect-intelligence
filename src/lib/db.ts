import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const connectionString = process.env.DATABASE_URL!;

// fallback for type safety during builds without env
const sql = neon(connectionString || "postgresql://user:pass@host/db");
export const db = drizzle(sql);
