import { Box, ClientOnly } from '@supastack/ui-primitives';

// import { enforceAuthenticated } from '~/auth.tsx';

/**
 * The entire `/a/*` route tree is protected by authentication.
 */
// export async function loader() {
//   await enforceAuthenticated();

//   return null;
// }

export default function AppLayout() {
  return (
    <ClientOnly component={() => import('~/components/AppLayout.tsx')} fallback={<Box tw="p-8">Initializing...</Box>} />
  );
}
