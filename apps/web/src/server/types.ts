import type { DbSdk } from '@dayjot/db';
import type { CookieOptions } from 'hono/utils/cookie';
import type { Session } from 'lucia';
import type { Sql } from 'postgres';

import type { Auth } from '~server/auth/index.ts';

/**
 * The properties available on `c.var` in hono, or `ctx` in trpc.
 */
export type ReqCtx = {
  getCookie: (key: string) => string | undefined;
  setCookie: (name: string, value: string, opt?: CookieOptions) => void;
  deleteCookie: (name: string, opt?: CookieOptions) => void;

  db: DbSdk;

  // @TODO hopefully can use dbSdk instead of this
  // need https://github.com/igalklebanov/kysely-postgres-js/issues/6
  sql: Sql;

  auth: Auth;
  isAuthed: boolean;
  sessionId?: Session['sessionId'];
  user?: Omit<Session['user'], 'userId'> & { id: Session['userId'] };
};

/**
 * Environment variables available on `c.env` in hono.
 */
export type ReqEnv = { JOT_SQL_URL: string };

export type HonoEnv = { Variables: ReqCtx; Bindings: ReqEnv };
