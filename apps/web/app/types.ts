import type { AppRouter } from '@libs/trpc';
import type { ServerRuntimeMetaFunction } from '@remix-run/server-runtime';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type MetaFunction = ServerRuntimeMetaFunction;
