import type { DataFunctionArgs, EntryContext } from '@remix-run/server-runtime';

import { serverHandler } from '~/app.ts';
import type { AppLoadContext } from '~/remix-types.ts';
import { appRouter } from '~/server/trpc/index.ts';
import { getReqTheme } from '~/server/utils/theme.ts';

export function handleDataRequest(response: Response, { request, params, context }: DataFunctionArgs) {
  console.log('server entry handleDataRequest()');
  return response;
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
) {
  const theme = getReqTheme({ getCookie: loadContext.getCookie });

  const stream = await serverHandler({
    req: request,
    meta: {
      // used by @ssrx/remix
      remixContext,
      loadContext,

      // used by the ssrx-theme plugin
      theme,

      // used by @ssrx/plugin-trpc-react
      trpcCaller: appRouter.createCaller(loadContext),
    },
  });

  return new Response(stream, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
