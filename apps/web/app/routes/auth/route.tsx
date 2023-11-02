import { Box } from '@supastack/ui-primitives';

import { enforceSignedOut } from '~/auth.tsx';
import { EmailAuthForm } from '~/forms/EmailAuth.tsx';
import type { LoaderFunctionArgs, MetaFunction } from '~/remix-types.ts';

export const meta: MetaFunction = () => {
  return [{ title: 'Authenticate' }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  await enforceSignedOut(context);

  return null;
}

export default function Auth() {
  return (
    <Box tw="flex flex-1 items-center justify-center p-20">
      <EmailAuthForm />
    </Box>
  );
}
