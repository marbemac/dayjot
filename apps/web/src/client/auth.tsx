import { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import type { RouterOutputs } from '~app';
import { ctx } from '~app';
import { paths } from '~client/routes.tsx';

const AuthContext = createContext<{
  user: RouterOutputs['auth']['me'] | null;
  isSignedIn: boolean;
  isLoaded: boolean;
}>({ user: null, isSignedIn: false, isLoaded: false });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isFetched } = ctx.trpc.auth.me.useQuery(undefined, { meta: { deferStream: true } });

  return (
    <AuthContext.Provider
      value={{
        user: data || null,
        isSignedIn: !!data,
        isLoaded: isFetched,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => {
  return useContext(AuthContext);
};

/**
 * For use in components.
 *
 * Like useUser() but will redirect to a route if user is not signed in, and returns a guaranteed user object.
 */
export const useUserOrRedirect = (props: { to?: string } = {}) => {
  const { to = '/' } = props;

  const { user } = useUser();

  if (import.meta.env.SSR) {
    if (!user) {
      throw new Response('', {
        status: 302,
        headers: { Location: to },
      });
    }
  } else {
    /**
     * These conditional hooks are OK because they will always be called in
     * the same order on the client
     */

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const navigate = useNavigate();

    if (!user) {
      navigate(to, { replace: true });
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!user) {
        navigate(to, { replace: true });
      }
    }, [user, navigate, to]);
  }

  return (user || {}) as NonNullable<RouterOutputs['auth']['me']>;
};

/**
 * For use in route loader functions.
 *
 * @example
 * export async function loader() {
 *   await enforceSignedOut();
 *
 *   return null;
 * }
 */
export const enforceSignedOut = async (props: { redirectTo?: string } = {}) => {
  const { redirectTo = paths.A.Journal.buildPath({}) } = props;

  const user = await ctx.trpc.auth.me.fetchQuery(undefined, { meta: { deferStream: true } });
  if (user) {
    throw new Response('', {
      status: 302,
      headers: { Location: redirectTo },
    });
  }
};

/**
 * For use in route loader functions.
 *
 * @example
 * export async function loader() {
 *   await enforceAuthenticated();
 *
 *   return null;
 * }
 */
export const enforceAuthenticated = async (props: { redirectTo?: string } = {}) => {
  // @TODO we could capture the current URL, and redirect back to it after auth
  const { redirectTo = paths.Auth.buildPath({}) } = props;

  const user = await ctx.trpc.auth.me.fetchQuery(undefined, { meta: { deferStream: true } });
  if (!user) {
    throw new Response('', {
      status: 302,
      headers: { Location: redirectTo },
    });
  }
};
