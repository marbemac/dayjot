import type { RxCollection, RxDocument, RxJsonSchema } from 'rxdb';

/**
 * Entries
 */

export type Entry = {
  day: string;
  content: string;
  updatedAt: string;
};

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
