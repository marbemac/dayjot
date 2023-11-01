// Importing from debug version temporarily due to this issue:
// https://github.com/tinyplex/tinybase/issues/104
import * as UiReact from 'tinybase/debug/ui-react/with-schemas';
import { createIndexedDbPersister } from 'tinybase/persisters/persister-indexed-db';
import { createStore as baseCreateStore } from 'tinybase/with-schemas';

const tablesSchema = {
  entries: {
    dbId: { type: 'string', default: '@TODO' },
    remoteHash: { type: 'string' },
    localHash: { type: 'string' },
  },
} as const;

const valuesSchema = {} as const;

const UiReactWithSchemas = UiReact as UiReact.WithSchemas<[typeof tablesSchema, typeof valuesSchema]>;

/**
 * Type-safe components/hooks - re-export whatever we need
 */
const {
  Provider,
  TableView,
  useRow,
  useCell,
  useCreateStore,
  useTable,
  ValueView,
  useSetCellCallback,
  useAddRowCallback,
  useStore,
  useCreatePersister,
} = UiReactWithSchemas;

export {
  Provider,
  TableView,
  useAddRowCallback,
  useCell,
  useCreatePersister,
  useCreateStore,
  useRow,
  useSetCellCallback,
  useStore,
  useTable,
  ValueView,
};

/**
 * Ditto above, but for types
 */
export type RowProps = typeof UiReactWithSchemas.RowProps;

const createStore = () => {
  const store = baseCreateStore().setSchema(tablesSchema, valuesSchema);

  return { store };
};

// tinybase store is only on the client, so can be a singleton
const { store: tinyStore } = createStore();

export { tinyStore };

export function TinyProvider({ children }: { children: React.ReactNode }) {
  const store = useCreateStore(() => tinyStore);

  useCreatePersister(
    store,
    store => createIndexedDbPersister(store as any, 'dayjot') as any,
    [],
    async persister => {
      await persister?.startAutoLoad();
      await persister?.startAutoSave();
    },
  );

  return <Provider store={store}>{children}</Provider>;
}
