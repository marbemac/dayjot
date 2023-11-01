import { postgres as postgresAdapter } from '@lucia-auth/adapter-postgresql';
import { lucia } from 'lucia';
import { web } from 'lucia/middleware';
import type { Sql } from 'postgres';

export const initAuth = ({ sql }: { sql: Sql }) => {
  return lucia({
    env: !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? 'DEV' : 'PROD',

    middleware: web(),

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
