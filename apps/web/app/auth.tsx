import { useNavigate } from '@remix-run/react';
import { createContext, useContext, useEffect } from 'react';
import { $path } from 'remix-routes';

import { ctx, type RouterOutputs } from '~/app.ts';
import type { AppLoadContext } from '~/remix-types.ts';

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
export const enforceSignedOut = async (
  { isAuthed }: Pick<AppLoadContext, 'isAuthed'>,
  props: { redirectTo?: string } = {},
) => {
  const { redirectTo = $path('/a/journal') } = props;

  if (isAuthed) {
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
export const enforceAuthenticated = async (
  { isAuthed }: Pick<AppLoadContext, 'isAuthed'>,
  props: { redirectTo?: string } = {},
) => {
  // @TODO we could capture the current URL, and redirect back to it after auth
  const { redirectTo = $path('/auth') } = props;

  if (!isAuthed) {
    throw new Response('', {
      status: 302,
      headers: { Location: redirectTo },
    });
  }
};
