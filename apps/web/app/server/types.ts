import type { DbSdk } from '@dayjot/db';
import type { Simplify } from '@supastack/utils-types';
import type { CookieOptions } from 'hono/utils/cookie';
import type { Session } from 'lucia';

import type { Auth } from '~/server/auth/index.ts';

/**
 * The properties available on `c.var` in hono, or `ctx` in trpc.
 */
export type ReqCtx = {
  getCookie: (key: string) => string | undefined;
  setCookie: (name: string, value: string, opt?: CookieOptions) => void;
  deleteCookie: (name: string, opt?: CookieOptions) => void;

  db: DbSdk;

  auth: Auth;
  isAuthed: boolean;
  sessionId?: Session['sessionId'];
  user?: Omit<Session['user'], 'userId'> & { id: Session['userId'] };
};

export type HonoEnv = { Variables: ReqCtx; Bindings: Simplify<EnvVariables> };
