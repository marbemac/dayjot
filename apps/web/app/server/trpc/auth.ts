import type { DbSdk } from '@dayjot/db';
import { type TUserId, UserId } from '@dayjot/db/ids';
import { wrap } from '@decs/typeschema';
import { generateAuthToken } from '@supastack/utils-ids';
import { TRPCError } from '@trpc/server';
import type { CookieOptions } from 'hono/utils/cookie';
import { LuciaError } from 'lucia';
import { isWithinExpiration } from 'lucia/utils';
import { email, maxLength, minLength, object, string } from 'valibot';

import { protectedProcedure, publicProcedure, router } from '~/server/trpc/trpc.ts';

const SignupSchema = object({
  email: string([minLength(4), maxLength(31)]),
  password: string([minLength(6), maxLength(100)]),
});

const LoginSchema = SignupSchema;

const EmailSchema = object({
  email: string('Email invalid', [email(), minLength(3), maxLength(100)]),
});

const TokenSchema = object({
  token: string(),
});

export const authRouter = router({
  me: publicProcedure.query(async ({ ctx }) => {
    return ctx.user ?? null;
  }),

  listLoginOptions: publicProcedure.input(wrap(EmailSchema)).mutation(async ({ input, ctx }) => {
    const { auth, db } = ctx;
    const { email } = input;

    const existingUser = await db.queries.users.byEmail({ email });

    const hasAccount = !!existingUser?.emailVerified;
    let passwordSignInEnabled = false;

    if (hasAccount) {
      try {
        const key = await auth.getKey('email', email.toLowerCase());
        passwordSignInEnabled = !!key.passwordDefined;
      } catch {
        // noop
        console.warn('Failed to get key for email', existingUser.id);
      }
    }

    return {
      hasAccount,
      passwordSignInEnabled,
    };
  }),

  sendMagicLink: publicProcedure.input(wrap(EmailSchema)).mutation(async ({ input, ctx }) => {
    const { auth, db } = ctx;
    const { email } = input;

    let userId;
    const existingUser = await db.queries.users.byEmail({ email });
    if (!existingUser) {
      userId = UserId.generate();

      await auth.createUser({
        userId,
        key: {
          providerId: 'email',
          providerUserId: email.toLowerCase(),
          password: null,
        },
        attributes: {
          email,
          name: null,
          image: null,
        },
      });
    } else {
      userId = existingUser.id;
    }

    const token = await generateMagicLinkToken({ userId, db: db.queries });

    // @TODO send email
    console.log(`!!! New magic link token for ${email}: ${token}`);

    return {};
  }),

  /**
   * Authenticates with a magic link token.
   */
  withMagicToken: publicProcedure.input(wrap(TokenSchema)).mutation(async ({ input, ctx }) => {
    const { auth, db } = ctx;
    const { token } = input;

    const userId = await validateMagicLinkToken({ token, db: db.queries });
    await auth.invalidateAllUserSessions(userId);
    await db.queries.users.updateById({ id: userId }, { emailVerified: new Date() });

    const session = await auth.createSession({
      userId,
      attributes: {},
    });
    const sessionCookie = auth.createSessionCookie(session);
    const { sameSite, ...cookieAttrs } = sessionCookie.attributes;
    ctx.setCookie(sessionCookie.name, sessionCookie.value, {
      ...cookieAttrs,
      sameSite: sameSiteLuciaToHono(sameSite),
    });

    return null;
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
          name: null,
          image: null,
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

const EXPIRES_IN = 1000 * 60 * 60 * 2; // 2 hours

const generateMagicLinkToken = async ({
  userId,
  db,
}: {
  userId: TUserId;
  db: {
    verificationTokens: Pick<DbSdk['queries']['verificationTokens'], 'listByUserId' | 'create'>;
  };
}) => {
  const storedUserTokens = await db.verificationTokens.listByUserId({ userId, purpose: 'magic-link' });

  if (storedUserTokens.length > 0) {
    const reusableStoredToken = storedUserTokens.find(token => {
      // check if expiration is within 1 hour
      // and reuse the token if true
      return isWithinExpiration(token.expires - EXPIRES_IN / 2);
    });

    if (reusableStoredToken) return reusableStoredToken.token;
  }

  const token = generateAuthToken();

  await db.verificationTokens.create({
    token,
    expires: new Date().getTime() + EXPIRES_IN,
    userId,
    purpose: 'magic-link',
  });

  return token;
};

export const validateMagicLinkToken = async ({
  token,
  db,
}: {
  token: string;
  db: {
    verificationTokens: Pick<DbSdk['queries']['verificationTokens'], 'byToken' | 'deleteForUser'>;
  };
}) => {
  const storedToken = await db.verificationTokens.byToken({ token, purpose: 'magic-link' });

  if (!storedToken) throw new Error('Invalid token');

  await db.verificationTokens.deleteForUser({ userId: storedToken.userId, purpose: 'magic-link' });

  const tokenExpires = storedToken.expires;
  if (!isWithinExpiration(tokenExpires)) {
    throw new Error('Expired token');
  }

  return storedToken.userId;
};
