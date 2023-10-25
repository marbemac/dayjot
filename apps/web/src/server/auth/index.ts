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

    /**
     * NOTE: the properties on `data` will exactly match the columns in the db (camel_case).
     */
    getUserAttributes: data => {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        image: data.image,
      };
    },

    experimental: {
      // debugMode: true,
    },
  });
};

export type Auth = ReturnType<typeof initAuth>;
