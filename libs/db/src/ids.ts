import { Id } from '@supastack/utils-ids';

// Re-export any shared domains this product uses
export * from '@supastack/user-model/ids';

export const EntryId = Id.dbIdFactory('e');
export type EntryNamespace = (typeof EntryId)['namespace'];
export type TEntryId = ReturnType<(typeof EntryId)['generate']>;
