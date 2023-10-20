import '~client/globals.css';

import { reactRouterPlugin } from '@ssrx/plugin-react-router';
import { tanstackQueryPlugin } from '@ssrx/plugin-tanstack-query';
import { unheadPlugin } from '@ssrx/plugin-unhead';
import { createApp } from '@ssrx/react';
import { QueryClientProvider } from '@tanstack/react-query';

// import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { routes } from '~client/routes.tsx';

import { supaThemePlugin } from './ssrx-theme.ts';

// @TODO
// export type RouterInputs = inferRouterInputs<AppRouter>;
// export type RouterOutputs = inferRouterOutputs<AppRouter>;

const { clientHandler, serverHandler, ctx } = createApp({
  plugins: [
    unheadPlugin(),
    supaThemePlugin(),
    tanstackQueryPlugin({ QueryClientProvider }),
    // trpcPlugin<AppRouter>(),
    reactRouterPlugin({ routes }),
  ],
});

export { clientHandler, ctx, serverHandler };
