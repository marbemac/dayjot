import { createIndexedDbPersister } from 'tinybase/persisters/persister-indexed-db';
import * as UiReact from 'tinybase/ui-react/with-schemas';
import { createStore as baseCreateStore } from 'tinybase/with-schemas';

const tablesSchema = {
  entries: { content: { type: 'string' } },
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
  useCreatePersister,
} = UiReactWithSchemas;

export {
  Provider,
  TableView,
  useCell,
  useCreatePersister,
  useCreateStore,
  useRow,
  useSetCellCallback,
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
const globalStore = createStore();

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useCreateStore(() => globalStore.store);

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
