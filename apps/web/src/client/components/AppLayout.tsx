import { Outlet } from 'react-router-dom';
import { StoreInspector } from 'tinybase/debug/ui-react-dom';

import { TinyProvider } from '~client/state/tinybase.tsx';

export default function Component() {
  return (
    <TinyProvider>
      <Outlet />

      <StoreInspector />
    </TinyProvider>
  );
}
