import { settingDefault, type SettingName, type Settings } from '@libs/settings';
import type { dayjs } from '@supastack/utils-dates';
import { safeParse, safeStringify } from '@supastack/utils-json';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RxCollection, RxLocalDocument } from 'rxdb';

import { initLocalDb, TableName, useRxCollection, useRxData } from './index.client.ts';
import type { LocalSyncInfo } from './RemoteSync.client.tsx';
import { LocalDocId } from './RemoteSync.client.tsx';
import { type Entry, type EntryDoc, formatEntryDay, type Setting } from './schemas.client.ts';
import { localDbStore$, settingsStore$ } from './store.ts';

/**
 * General
 */

export const useInitLocalDb = () => {
  useEffect(() => {
    // RxDB instantiation can be asynchronous
    void initLocalDb()
      .then(db => {
        localDbStore$.setDb(db);
      })
      .catch(err => {
        console.error('Error initializing localDB', err);
      });
  }, []);
};

const useLocalDoc = <S>(collectionName: TableName, docId: LocalDocId) => {
  const [doc, setDoc] = useState<RxLocalDocument<RxCollection, S> | null>(null);
  const collection = useRxCollection(collectionName);

  useEffect(() => {
    if (!collection) return;

    const subscription = collection.getLocal$<S>(docId).subscribe(documentOrNull => {
      setDoc(documentOrNull);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [collection, docId, setDoc]);

  return doc;
};

export const useLocalSyncInfo = (collectionName: TableName) => {
  return useLocalDoc<LocalSyncInfo>(collectionName, LocalDocId.SyncInfo);
};

/**
 * EntryDay
 */

export const useDayEntry = (day: dayjs.Dayjs) => {
  const dayId = formatEntryDay(day);

  const q = useCallback((c: RxCollection<Entry>) => c.findOne(dayId), [dayId]);

  const { result } = useRxData<Entry>(TableName.Entries, q);

  return result[0] as EntryDoc | undefined;
};

export const useUpsertDayEntry = () => {
  const entries = useRxCollection<Entry>(TableName.Entries)!;

  return useCallback((dayId: string, content = '') => entries.upsert({ day: dayId, content }), [entries]);
};

/**
 * Settings
 */

// Syncs settings from rxjs to localDbStore$ for ease of use across
// the app (in read-only context, writes still must go to rxdb)
export const useSubscribeSettings = () => {
  const isSettingsLoaded = settingsStore$.isLoaded.get();

  const q = useCallback((c: RxCollection<Setting>) => c.find(), []);
  const { isFetching, result } = useRxData<Setting>(TableName.Settings, q);

  useEffect(() => {
    for (const setting of result) {
      const data = setting.toJSON();
      settingsStore$.settings[data.name as SettingName].set(safeParse(data.value));
    }
  }, [result]);

  useEffect(() => {
    if (!isSettingsLoaded && !isFetching) {
      settingsStore$.isLoaded.set(true);
    }
  }, [isFetching, isSettingsLoaded]);
};

export const useSettingValue = <S extends SettingName, F extends boolean>(
  name: S,
  useFallback?: F,
): Settings[S] | undefined => {
  const q = useCallback((c: RxCollection<Setting>) => c.findOne(name), [name]);

  const { result, isFetching } = useRxData<Setting>(TableName.Settings, q);
  const value = result[0]?.value;
  const parsed = useMemo(() => safeParse(value), [value]);

  if (!isFetching && useFallback) {
    return parsed ?? (settingDefault(name) as Settings[S]);
  }

  return parsed;
};

export const useUpsertSetting = <S extends SettingName>() => {
  const settings = useRxCollection<Setting>(TableName.Settings)!;

  return useCallback(
    (name: S, value: Settings[S]) => settings.upsert({ name, value: safeStringify(value) }),
    [settings],
  );
};
