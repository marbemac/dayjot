import type { LoaderFunctionArgs, ServerRuntimeMetaFunction } from '@remix-run/server-runtime';
import { Box } from '@supastack/ui-primitives';

import { enforceSignedOut } from '~/auth.tsx';
import { EmailAuthForm } from '~/forms/EmailAuth.tsx';

export const meta: ServerRuntimeMetaFunction = () => {
  return [{ title: 'Authenticate' }];
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  // await enforceSignedOut();
  console.log('AUTH ROUTE LOADER', context);

  return null;
}

export default function Auth() {
  return (
    <Box tw="flex flex-1 items-center justify-center p-20">
      <EmailAuthForm />
    </Box>
  );
}
