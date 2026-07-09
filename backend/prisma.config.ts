import 'dotenv/config';
import { defineConfig } from '@prisma/config';

// CLI commands (migrate, studio, db pull) must bypass Supabase's pooled
// connection — DIRECT_URL is set in production/Supabase setups; local dev
// against a single non-pooled Postgres just uses DATABASE_URL for both.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
