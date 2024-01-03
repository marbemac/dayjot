import { postgres as postgresAdapter } from '@lucia-auth/adapter-postgresql';
import { lucia } from 'lucia';
import { web } from 'lucia/middleware';
import type { Sql } from 'postgres';

export type { SessionUser } from './types.ts';

export const initAuth = ({ sql, isDev }: { sql: Sql; isDev?: boolean }) => {
  return lucia({
    env: isDev ? 'DEV' : 'PROD',

    middleware: web(),

    // Turn it off during development since api and frontend are on different hosts
    // In prod the api and frontend are on the same host, so cors doesn't come into play
    csrfProtection: isDev ? false : true,

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
        timeZone: data.time_zone!,
        emailTimes: data.email_times!,
      };
    },

    // experimental: {
    //   debugMode: true,
    // },
  });
};

export type Auth = ReturnType<typeof initAuth>;
