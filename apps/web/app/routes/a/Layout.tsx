import { Outlet } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { Provider } from 'rxdb-hooks';

import { DbSyncer } from '~/local-db/DbSyncer.client.tsx';
import { initLocalDb } from '~/local-db/index.client.ts';

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
      <Outlet />
      <DbSyncer />
    </Provider>
  );
}
