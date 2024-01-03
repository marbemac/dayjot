import type { OpaqueObject } from '@legendapp/state';
import { computed, observable, opaqueObject } from '@legendapp/state';
import { settingDefault, type Settings } from '@libs/settings';
import type { RxReplicationState } from 'rxdb/plugins/replication';

import type { LocalDb, TableName } from './index.client.ts';

export type CheckpointType = { minUpdatedAt: string };

// In-memory non-reactive cache of replicator instances - otherwise we end up with issues in react strict mode...
export const replicatorInstances = new Map<TableName, RxReplicationState<any, CheckpointType>>();

export const localDbStore$ = observable({
  db: undefined as OpaqueObject<LocalDb> | undefined,

  setDb: (db: LocalDb): void => {
    localDbStore$.db.set(opaqueObject(db));
  },

  isReady: computed((): boolean => !!localDbStore$.db.get()),

  isSettingsLoaded: false,
  settings: {
    theme: settingDefault('theme'),
    timeZone: settingDefault('timeZone'),
    journalDays: settingDefault('journalDays'),
    memories: settingDefault('memories'),
  } satisfies Settings,
});
