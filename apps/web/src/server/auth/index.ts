import { postgres as postgresAdapter } from '@lucia-auth/adapter-postgresql';
import { lucia } from 'lucia';
import { hono } from 'lucia/middleware';
import type { Sql } from 'postgres';

export const initAuth = ({ sql }: { sql: Sql }) => {
  return lucia({
    env: import.meta.env.DEV ? 'DEV' : 'PROD',

    middleware: hono(),

    adapter: postgresAdapter(sql, {
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
};

export type Auth = ReturnType<typeof initAuth>;
