import type { DbSdk } from '@dayjot/db';
import type { CookieOptions } from 'hono/utils/cookie';
import type { Session } from 'lucia';

/**
 * The properties available on `c.var` in hono, or `ctx` in trpc.
 */
export type ReqCtx = {
  getCookie: (key: string) => string | undefined;
  setCookie: (name: string, value: string, opt?: CookieOptions) => void;
  deleteCookie: (name: string, opt?: CookieOptions) => void;

  db: DbSdk;
  isAuthed: boolean;
  sessionId?: Session['sessionId'];
  user?: Omit<Session['user'], 'userId'> & { id: Session['userId'] };
};

/**
 * Environment variables available on `c.env` in hono.
 */
export type ReqEnv = { JOT_SQL_URL: string };

export type HonoEnv = { Variables: ReqCtx; Bindings: ReqEnv };
