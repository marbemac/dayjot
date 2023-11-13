import { Outlet } from '@remix-run/react';
import { Box } from '@supastack/ui-primitives';
import { useEffect, useState } from 'react';
import { Provider } from 'rxdb-hooks';

import { DbSyncer } from '~/local-db/DbSyncer.client.tsx';
import { initLocalDb } from '~/local-db/index.client.ts';

import { AppSidebar } from './AppSidebar.tsx';

// @TODO responsive
const SIDEBAR_WIDTH = 330;

export default function AppLayout() {
  const [db, setDb] = useState<Awaited<ReturnType<typeof initLocalDb>>>();

  useEffect(() => {
    // RxDB instantiation can be asynchronous
    void initLocalDb()
      .then(setDb)
      .catch(err => {
        console.error('Error initializing localDB', err);
      });
  }, []);

  return (
    <Provider db={db}>
      <Box style={{ paddingLeft: SIDEBAR_WIDTH }}>
        <Box tw="fixed inset-y-0 left-0 py-10 pl-10" style={{ width: SIDEBAR_WIDTH }}>
          <AppSidebar />
        </Box>

        <Box as="main" tw="h-screen flex-1">
          <Outlet />
        </Box>
      </Box>

      <DbSyncer />
    </Provider>
  );
}
