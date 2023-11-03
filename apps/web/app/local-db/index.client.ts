import { addRxPlugin, createRxDatabase } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

import { type EntryCollection, entryCollectionMethods, entryDocMethods, entrySchema } from './schemas.client.ts';

if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin);
}

addRxPlugin(RxDBLeaderElectionPlugin);

export type LocalDbCollections = {
  entries: EntryCollection;
};

export enum TableName {
  Entries = 'entries',
}

let localDbSingleton: ReturnType<typeof $initLocalDb>;

const $initLocalDb = async () => {
  const rxdb = await createRxDatabase<LocalDbCollections>({
    name: 'dayjot-rx',
    storage: getRxStorageDexie(),
    eventReduce: true,
    // password: 'myPassword',
  });

  await rxdb.addCollections({
    [TableName.Entries]: {
      schema: entrySchema,
      methods: entryDocMethods,
      statics: entryCollectionMethods,
    },
  });

  void rxdb.waitForLeadership().then(() => {
    console.debug('DB.isLeader');
  });

  return rxdb;
};

export const initLocalDb = async () => {
  // Make sure we only init once. App is run in react <StrictMode> so this ends up being called twice.
  if (!localDbSingleton) {
    localDbSingleton = $initLocalDb();
  }

  return localDbSingleton;
};
