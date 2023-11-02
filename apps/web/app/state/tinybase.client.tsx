// Importing from debug version temporarily due to this issue:
// https://github.com/tinyplex/tinybase/issues/104
import * as UiReact from 'tinybase/debug/ui-react/with-schemas';
import { createIndexedDbPersister } from 'tinybase/persisters/persister-indexed-db';
import { createQueries, createStore } from 'tinybase/with-schemas';

const tablesSchema = {
  entries: {
    day: { type: 'string' },
    content: { type: 'string' },
    remoteHash: { type: 'string' },
    localHash: { type: 'string' },
    remoteUpdatedAt: { type: 'string' },
    localUpdatedAt: { type: 'string' },
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
  useQueries,
  ResultRowView,
  ResultCellView,
  ResultTableView,
} = UiReactWithSchemas;

export {
  Provider,
  ResultCellView,
  ResultRowView,
  ResultTableView,
  TableView,
  useAddRowCallback,
  useCell,
  useCreateStore,
  useQueries,
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
export type ResultRowProps = typeof UiReactWithSchemas.ResultRowProps;

const initTiny = async () => {
  const store = createStore().setSchema(tablesSchema, valuesSchema);

  const queries = createQueries(store);

  queries.setQueryDefinition('dirtyEntries', 'entries', ({ select, where }) => {
    select('day');
    select('content');
    select('localUpdatedAt');
    where(getCell => getCell('localHash') !== getCell('remoteHash'));
  });

  // Make sure persister is only created ONCE. If we create it in the react tree, react strict mode will
  // result in two instances being created during development, which will cause issues.
  const persister = createIndexedDbPersister(store as any, 'dayjot', 1, error => {
    console.warn('IndexedDbPersister error', error);
  });
  await persister.startAutoLoad();
  await persister.startAutoSave();

  return { store, queries };
};

// tinybase is only on the client, so can be a singleton
const { store: tinyStore, queries: tinyQueries } = await initTiny();

export { tinyQueries, tinyStore };

export function TinyProvider({ children }: { children: React.ReactNode }) {
  const store = useCreateStore(() => tinyStore);

  return (
    <Provider store={store} queries={tinyQueries}>
      {children}
    </Provider>
  );
}
