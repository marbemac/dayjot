import { Box, ClientOnly } from '@supastack/ui-primitives';

import { enforceAuthenticated } from '~/auth.tsx';
import type { LoaderFunctionArgs } from '~/remix-types.ts';

/**
 * The entire `/a/*` route tree is protected by authentication.
 */
export async function loader({ context }: LoaderFunctionArgs) {
  await enforceAuthenticated(context);

  return null;
}

export default function AuthedLayout() {
  return <ClientOnly component={() => import('./Layout.tsx')} fallback={<Box tw="p-8">Initializing...</Box>} />;
}
