import type { DataFunctionArgs, EntryContext } from '@remix-run/server-runtime';

import { createReqCtx } from '~/api/middleware/context.ts';
import { appRouter } from '~/api/trpc/index.ts';

import { serverHandler } from './app.ts';

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
  const reqCtx = await createReqCtx(request, responseHeaders, loadContext.env ?? process.env);

  const stream = await serverHandler({
    req: request,
    meta: {
      // used by @ssrx/remix
      remixContext,
      loadContext,

      // used by @ssrx/plugin-trpc-react
      trpcCaller: appRouter.createCaller(reqCtx),
    },
  });

  return new Response(stream, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
