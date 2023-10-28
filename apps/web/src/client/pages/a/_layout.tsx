import { Box, ClientOnly } from '@supastack/ui-primitives';

import { enforceAuthenticated } from '~client/auth.tsx';

/**
 * The entire `/a/*` route tree is protected by authentication.
 */
export async function loader() {
  await enforceAuthenticated();

  return null;
}

export function Component() {
  return (
    <ClientOnly
      component={() => import('~client/components/AppLayout.tsx')}
      fallback={<Box tw="p-8">Initializing...</Box>}
    />
  );
}
