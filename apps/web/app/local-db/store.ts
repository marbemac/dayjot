import type { OpaqueObject } from '@legendapp/state';
import { computed, observable, opaqueObject } from '@legendapp/state';
import type { RxReplicationState } from 'rxdb/plugins/replication';

import type { initLocalDb, TableName } from './index.client.ts';

export type CheckpointType = { minUpdatedAt: string };

// In-memory non-reactive cache of replicator instances - otherwise we end up with issues in react strict mode...
export const replicatorInstances = new Map<TableName, RxReplicationState<any, CheckpointType>>();

export const localDbStore$ = observable({
  db: undefined as OpaqueObject<Awaited<ReturnType<typeof initLocalDb>>> | undefined,

  setDb: (db: Awaited<ReturnType<typeof initLocalDb>>) => {
    localDbStore$.db.set(opaqueObject(db));
  },

  isReady: computed((): boolean => !!localDbStore$.db.get()),
});
