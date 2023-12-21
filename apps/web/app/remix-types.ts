import type {
  ActionFunctionArgs as RRActionFunctionArgs,
  LoaderFunctionArgs as RRLoaderFunctionArgs,
} from '@remix-run/router';
import type { ServerRuntimeMetaFunction } from '@remix-run/server-runtime';

import type { ReqCtx } from './server/types.ts';

// Remix's loader context
export type AppLoadContext = ReqCtx;

export type LoaderFunctionArgs = RRActionFunctionArgs<AppLoadContext> &
  RRLoaderFunctionArgs<AppLoadContext> & {
    context: AppLoadContext;
  };

export type MetaFunction = ServerRuntimeMetaFunction;
