import type { DbSdk } from '@libs/db';
import type { TUserId } from '@libs/db/ids';
import type { Session } from 'lucia';

import type { Auth, SessionUser } from './auth/index.ts';

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
  user?: SessionUser & { id: TUserId };
};

type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  secure?: boolean;
  signingSecret?: string;
  sameSite?: 'Strict' | 'Lax' | 'None';
  partitioned?: boolean;
};
