import { addRxPlugin, createRxDatabase } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { RxDBLocalDocumentsPlugin } from 'rxdb/plugins/local-documents';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

import {
  type EntryCollection,
  entryCollectionMethods,
  entryDocMethods,
  entrySchema,
  type SettingCollection,
  settingCollectionMethods,
  settingDocMethods,
  settingSchema,
} from './schemas.client.ts';

export * from './hooks.client.ts';
export { Provider as RxdbHooksProvider, useRxCollection, useRxData } from 'rxdb-hooks';

if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin);
}

addRxPlugin(RxDBLocalDocumentsPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);

// @TODO https://rxdb.info/cleanup.html
// import { RxDBCleanupPlugin } from 'rxdb/plugins/cleanup';

export type LocalDbCollections = {
  entries: EntryCollection;
  settings: SettingCollection;
};

export enum TableName {
  Entries = 'entries',
  Settings = 'settings',
}

let localDbSingleton: ReturnType<typeof $initLocalDb>;

const $initLocalDb = async () => {
  const rxdb = await createRxDatabase<LocalDbCollections>({
    name: 'dayjot',
    storage: getRxStorageDexie(),
    // password: 'myPassword',
  });

  await rxdb.addCollections({
    [TableName.Entries]: {
      schema: entrySchema,
      methods: entryDocMethods,
      statics: entryCollectionMethods,
      localDocuments: true,
    },
    [TableName.Settings]: {
      schema: settingSchema,
      methods: settingDocMethods,
      statics: settingCollectionMethods,
      localDocuments: true,
    },
  });

  // @TODO update updatedAt on save?
  // rxdb.entries.preSave(d => {
  //   d.updatedAt = Date.now();
  //   return d;
  // }, true);

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
