import { Box } from '@supastack/ui-primitives';

import { ctx } from '~app';
import { enforceSignedOut } from '~client/auth.tsx';

export async function loader() {
  await enforceSignedOut();

  return null;
}

export function Component() {
  ctx.useHead({ title: 'Home' });

  return <Box tw="p-20">Hello world!</Box>;
}
