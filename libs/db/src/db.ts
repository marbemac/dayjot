import type { EntriesDbSchema } from './schemas/entries/schema.ts';
import type { UsersDbSchema } from './schemas/users/schema.ts';

export interface DbSchema extends EntriesDbSchema, UsersDbSchema {}
