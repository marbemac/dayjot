import '~client/globals.css';

import { reactRouterPlugin } from '@ssrx/plugin-react-router';
import { tanstackQueryPlugin } from '@ssrx/plugin-tanstack-query';
import { trpcPlugin } from '@ssrx/plugin-trpc-react';
import { unheadPlugin } from '@ssrx/plugin-unhead';
import { createApp } from '@ssrx/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { routes } from '~client/routes.tsx';
import type { AppRouter } from '~server/trpc/index.ts';

import { supaThemePlugin } from './ssrx-theme.tsx';

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const TRPC_ROOT = '_rpc';

const { clientHandler, serverHandler, ctx } = createApp({
  plugins: [
    unheadPlugin(),
    supaThemePlugin(),
    tanstackQueryPlugin({
      QueryClientProvider,
      queryClientConfig: {
        defaultOptions: {
          queries: {
            suspense: true,
            retry: false,
            staleTime: 1000 * 60,
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
          },
        },
      },
    }),
    trpcPlugin<AppRouter>({ httpBatchLinkOpts: { url: `/${TRPC_ROOT}` } }),
    reactRouterPlugin({ routes }),
  ],
});

export { clientHandler, ctx, serverHandler };
