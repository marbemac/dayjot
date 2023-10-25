import { Box } from '@supastack/ui-primitives';

import { ctx } from '~app';
import { enforceSignedOut } from '~client/auth.tsx';
import { EmailAuthForm } from '~client/forms/EmailAuth.tsx';

export async function loader() {
  await enforceSignedOut();

  return null;
}

export function Component() {
  ctx.useHead({ title: 'Authenticate' });

  return (
    <Box tw="flex flex-1 items-center justify-center p-20">
      <EmailAuthForm />
    </Box>
  );
}
