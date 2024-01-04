import { dayjs } from '@supastack/utils-dates';
import type { RxCollection, RxDocument, RxJsonSchema } from 'rxdb';

/**
 * Entries
 */

// Day is a string in the format YYYY-MM-DD
export type EntryDay = string;

export type Entry = {
  day: EntryDay;
  content: string;
  updatedAt: string;
};

export const formatEntryDay = (day: dayjs.ConfigType) => dayjs(day).format('YYYY-MM-DD');

export const entrySchema: RxJsonSchema<Entry> = {
  version: 0,
  primaryKey: 'day',
  type: 'object',
  properties: {
    day: {
      type: 'string',
      maxLength: 10,
    },
    content: {
      type: 'string',
    },
    updatedAt: {
      type: 'string',
    },
  },
  required: ['day', 'content'],
} as const;

export type EntryMethods = {
  updateContent: (content: string) => Promise<void>;
};
export const entryDocMethods: EntryMethods = {
  updateContent: async function (this: EntryDoc, content: string) {
    await this.incrementalPatch({ content });
  },
};

export type EntryCollectionMethods = {
  // custom collection methods
};
export const entryCollectionMethods: EntryCollectionMethods = {};

export type EntryDoc = RxDocument<Entry, EntryMethods>;
export type EntryCollection = RxCollection<Entry, EntryMethods, EntryCollectionMethods>;

/**
 * Settings
 */

export type Setting = {
  name: string;
  value: string;
  updatedAt: string;
};

export const settingSchema: RxJsonSchema<Setting> = {
  version: 0,
  primaryKey: 'name',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      maxLength: 100,
    },
    value: {
      type: 'string',
    },
    updatedAt: {
      type: 'string',
    },
  },
  required: ['name', 'value'],
} as const;

export type SettingMethods = {
  updateValue: (value: string) => Promise<void>;
};
export const settingDocMethods: SettingMethods = {
  updateValue: async function (this: SettingDoc, value: string) {
    await this.incrementalPatch({ value });
  },
};

export type SettingCollectionMethods = {
  // custom collection methods
};
export const settingCollectionMethods: SettingCollectionMethods = {};

export type SettingDoc = RxDocument<Setting, SettingMethods>;
export type SettingCollection = RxCollection<Setting, SettingMethods, SettingCollectionMethods>;
