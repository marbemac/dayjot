import { useObserveEffect } from '@legendapp/state/react';
import { useNavigate } from '@remix-run/react';
import { $path } from 'remix-routes';

import { userStore$ } from '~/app-store.ts';

import { AppLayout } from './Layout.tsx';
import { Loading } from './Loading.tsx';

const useRedirectIfNotLoggedIn = () => {
  const navigate = useNavigate();

  useObserveEffect(() => {
    if (!userStore$.isLoggedIn.get()) {
      navigate($path('/auth'), { replace: true });
    }
  });
};

export default function AuthedLayout() {
  useRedirectIfNotLoggedIn();

  return (
    <>
      <AppLayout />
      <Loading />
    </>
  );
}
