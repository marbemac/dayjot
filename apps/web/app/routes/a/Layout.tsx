import { Outlet } from '@remix-run/react';
import { StoreInspector } from 'tinybase/debug/ui-react-dom';

import { TinyProvider } from '~/state/tinybase.tsx';

export default function AppLayout() {
  return (
    <TinyProvider>
      <Outlet />

      <StoreInspector />
    </TinyProvider>
  );
}
