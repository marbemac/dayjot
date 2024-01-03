import { useObserveEffect } from '@legendapp/state/react';
import { useNavigate } from '@remix-run/react';
import { VStack } from '@supastack/ui-primitives';
import { $path } from 'remix-routes';

import { userStore$ } from '~/app-store.ts';
import { EmailAuthForm } from '~/forms/EmailAuth.tsx';
import type { MetaFunction } from '~/types.ts';

export const meta: MetaFunction = () => {
  return [{ title: 'Login or Signup' }];
};

const useRedirectIfLoggedIn = () => {
  const navigate = useNavigate();

  useObserveEffect(() => {
    if (userStore$.isLoggedIn.get()) {
      navigate($path('/a/journal'), { replace: true });
    }
  });
};

export default function Auth() {
  useRedirectIfLoggedIn();

  return (
    <VStack center tw="min-h-screen">
      <EmailAuthForm />
    </VStack>
  );
}
