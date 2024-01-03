import type { ReqCtx } from '@libs/trpc';
import type { Simplify } from '@supastack/utils-types';

export type { ReqCtx } from '@libs/trpc';

export type HonoEnv = { Variables: ReqCtx; Bindings: Simplify<EnvVariables> };
