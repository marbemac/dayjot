import { observer, useComputed } from '@legendapp/state/react';
import type { AppRouter } from '@libs/trpc';
import { createTRPCReact } from '@ssrx/trpc-react-query';
import { ThemedGlobalInner } from '@supastack/ui-primitives/themed';
import { generateTheme } from '@supastack/ui-theme';
import { focusManager, onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createTRPCUntypedClient, httpBatchLink } from '@trpc/client';
import { createContext, memo, useContext, useEffect } from 'react';

import { appStore$, userStore$ } from '~/app-store.ts';
import { RxdbHooksProvider, useInitLocalDb, useSettingValue } from '~/local-db/index.client.ts';
import { RemoteSync } from '~/local-db/RemoteSync.client.tsx';

import { SettingsSync } from './local-db/SettingsSync.tsx';
import { localDbStore$ } from './local-db/store.ts';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createQueryClient();
  const trpc = createTrpcClient({ queryClient });

  // Track network status
  useEffect(() => onlineManager.subscribe(isOnline => appStore$.isOnline.set(isOnline)), []);

  // Track window focus
  // @ts-expect-error - bad type
  useEffect(() => focusManager.subscribe(isVisible => appStore$.isVisible.set(isVisible)), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TrpcProvider trpc={trpc}>
        <AuthSyncer />

        <LocalDBProvider>
          <ThemedGlobal>{children}</ThemedGlobal>
        </LocalDBProvider>
      </TrpcProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

/**
 * Tanstack Query
 */

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
        retry: 4,
        retryDelay: attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
      },
    },
  });
};

/**
 * TRPC
 */

// Match up with apps/api/src/index.ts
// @TODO - use env vars, different in prod
const TRPC_ROOT = 'http://localhost:3009/api/_rpc';

type TrpcClient = ReturnType<typeof createTrpcClient>;

const createTrpcClient = ({ queryClient }: { queryClient: QueryClient }) => {
  const trpcClient = createTRPCUntypedClient({
    links: [
      httpBatchLink({
        url: TRPC_ROOT,
        fetch(url, options) {
          return fetch(url, {
            ...options,

            // @TODO only include credentials in dev
            credentials: 'include', // cors
          });
        },
      }),
    ],
  });

  const trpc = createTRPCReact<AppRouter>({
    client: trpcClient,
    queryClient,
  });

  return trpc;
};

const TrpcContext = createContext<{ trpc: TrpcClient }>({ trpc: null! });

const TrpcProvider = ({ children, trpc }: { children: React.ReactNode; trpc: TrpcClient }) => {
  return <TrpcContext.Provider value={{ trpc }}>{children}</TrpcContext.Provider>;
};

export const useTrpc = () => {
  return useContext(TrpcContext);
};

/**
 * Theme
 */

export const ThemedGlobal = memo(({ children }: { children: React.ReactNode }) => {
  const baseTheme = useSettingValue('theme', true);

  return baseTheme ? (
    <ThemedGlobalInner generatedTheme={generateTheme(baseTheme.baseThemeId, baseTheme.customTheme)}>
      {children}
    </ThemedGlobalInner>
  ) : null;
});

ThemedGlobal.displayName = 'ThemedGlobal';

/**
 * RXDB
 */

export const LocalDBProvider = observer(({ children }: { children: React.ReactNode }) => {
  const db = localDbStore$.db.get();
  const shouldSyncRemote = useComputed(() => localDbStore$.isReady.get() && userStore$.isLoggedIn.get());

  useInitLocalDb();

  return (
    <RxdbHooksProvider db={db}>
      {children}

      {db ? <SettingsSync /> : null}
      {shouldSyncRemote.get() ? <RemoteSync /> : null}
    </RxdbHooksProvider>
  );
});

/**
 * Auth
 */

const AuthSyncer = observer(() => {
  const { trpc } = useTrpc();

  const enabled = useComputed(() => userStore$.isLoggedIn.get() || !userStore$.checkedAt.get()).get();
  const { data, isFetched, dataUpdatedAt } = trpc.auth.me.useQuery(undefined, {
    enabled,
  });

  useEffect(() => {
    if (dataUpdatedAt) {
      userStore$.checkedAt.set(dataUpdatedAt);
    }

    if (isFetched) {
      userStore$.isLoggedIn.set(!!data);
    }

    if (data !== undefined) {
      userStore$.user.set(data);
    }
  }, [isFetched, data, dataUpdatedAt]);

  return null;
});
