import { pg as postgresAdapter } from '@lucia-auth/adapter-postgresql';
import { lucia } from 'lucia';
import { hono } from 'lucia/middleware';
import postgres from 'pg';

// @TODO Extend pool on initDbSdk from @dayjot/db
const pool = new postgres.Pool({
  connectionString: process.env['JOT_SQL_URL']!,
});

export const auth = lucia({
  env: import.meta.env.DEV ? 'DEV' : 'PROD',

  middleware: hono(),

  adapter: postgresAdapter(pool, {
    user: 'users',
    key: 'user_keys',
    session: 'user_sessions',
  }),

  getUserAttributes: data => {
    return {
      email: data.email,
      emailVerified: data.emailVerified,
      name: data.name,
      image: data.image,
    };
  },

  experimental: {
    // debugMode: true,
  },
});

export type Auth = typeof auth;
