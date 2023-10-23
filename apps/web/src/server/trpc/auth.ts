import { UserId } from '@dayjot/db/ids';
import { wrap } from '@decs/typeschema';
import { TRPCError } from '@trpc/server';
import type { CookieOptions } from 'hono/utils/cookie';
import { LuciaError } from 'lucia';
import { maxLength, minLength, object, string } from 'valibot';

import { protectedProcedure, publicProcedure, router } from '~server/trpc/trpc.ts';

const SignupSchema = object({
  email: string([minLength(4), maxLength(31)]),
  password: string([minLength(6), maxLength(100)]),
});

const LoginSchema = SignupSchema;

export const authRouter = router({
  me: publicProcedure.query(async ({ ctx }) => {
    return ctx.user || null;
  }),

  signup: publicProcedure.input(wrap(SignupSchema)).mutation(async ({ input, ctx }) => {
    const { auth } = ctx;
    const { email, password } = input;

    try {
      const user = await auth.createUser({
        userId: UserId.generate(),
        key: {
          providerId: 'email',
          providerUserId: email.toLowerCase(),
          password, // hashed by Lucia
        },
        attributes: {
          email,
        },
      });

      const session = await auth.createSession({
        userId: user.userId,
        attributes: {},
      });

      const sessionCookie = auth.createSessionCookie(session);
      const { sameSite, ...cookieAttrs } = sessionCookie.attributes;
      ctx.setCookie(sessionCookie.name, sessionCookie.value, {
        ...cookieAttrs,
        sameSite: sameSiteLuciaToHono(sameSite),
      });
    } catch (e) {
      if (e instanceof LuciaError && e.message === 'AUTH_DUPLICATE_KEY_ID') {
        // key already exists
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Email already exists. Try logging in.',
          cause: e,
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unknown error occurred.',
        cause: e,
      });
    }

    return null;
  }),

  login: publicProcedure.input(wrap(LoginSchema)).mutation(async ({ input, ctx }) => {
    const { auth } = ctx;
    const { email, password } = input;

    try {
      // find user by key
      // and validate password
      const key = await auth.useKey('email', email.toLowerCase(), password);

      const session = await auth.createSession({
        userId: key.userId,
        attributes: {},
      });

      const sessionCookie = auth.createSessionCookie(session);
      const { sameSite, ...cookieAttrs } = sessionCookie.attributes;
      ctx.setCookie(sessionCookie.name, sessionCookie.value, {
        ...cookieAttrs,
        sameSite: sameSiteLuciaToHono(sameSite),
      });

      return null;
    } catch (e) {
      if (e instanceof LuciaError && (e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Incorrect username or password.',
          cause: e,
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unknown error occurred.',
        cause: e,
      });
    }
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const { auth } = ctx;

    // make sure to invalidate the current session!
    await auth.invalidateSession(ctx.sessionId);

    // create blank session cookie
    const sessionCookie = auth.createSessionCookie(null);

    const { sameSite, ...cookieAttrs } = sessionCookie.attributes;
    ctx.deleteCookie(sessionCookie.name, { ...cookieAttrs, sameSite: sameSiteLuciaToHono(sameSite) });

    return null;
  }),
});

/**
 * Similar to https://github.com/lucia-auth/lucia/blob/f714949c0d0841b7419170ad7193ba1fcc4404a4/packages/lucia/src/utils/cookie.ts#L107
 * Unfortunately that function is not available, so we're replicating it here
 */
type LuciaSameSite = true | false | 'lax' | 'strict' | 'none' | undefined;
const sameSiteLuciaToHono = (sameSite: LuciaSameSite): CookieOptions['sameSite'] | undefined => {
  if (!sameSite) return undefined;

  const ss = typeof sameSite === 'string' ? sameSite.toLowerCase() : sameSite;

  if (ss === true || ss === 'strict') return 'Strict';
  if (ss === 'lax') return 'Lax';
  if (ss === 'none') return 'None';

  throw new Error(`option sameSite of ${sameSite} is invalid`);
};
