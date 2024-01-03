import { useQuery } from '@tanstack/react-query';
import { type RxCollection, type RxReplicationWriteToMasterRow, type WithDeleted } from 'rxdb';
import type { RxReplicationState } from 'rxdb/plugins/replication';
import { replicateRxCollection } from 'rxdb/plugins/replication';

import { useTrpc } from '~/providers.tsx';

import { TableName, useRxCollection } from './index.client.ts';
import type { CheckpointType } from './store.ts';
import { replicatorInstances } from './store.ts';

export enum LocalDocId {
  SyncInfo = 'syncInfo',
}

export type LocalSyncInfo = {
  time: number;
};

export const DbSyncer = () => {
  const { trpc } = useTrpc();
  const { mutateAsync: pushEntries } = trpc.sync.pushEntries.useMutation();
  const { mutateAsync: pullEntries } = trpc.sync.pullEntries.useMutation();
  useReplicator({ collectionName: TableName.Entries, handlePull: pullEntries, handlePush: pushEntries });

  return null;
};

function useReplicator<RxDocType extends { updatedAt: string }>({
  collectionName,
  handlePull,
  handlePush,
}: { collectionName: TableName } & Pick<InitReplicatorProps<RxDocType>, 'handlePush' | 'handlePull'>) {
  const collection = useRxCollection(collectionName) as RxCollection<RxDocType> | null;
  const instance = useInitReplicator({ collection, handlePush, handlePull });

  // Re-sync
  useQuery({
    queryKey: [instance?.collection.name, 'sync'],
    refetchInterval: 60000 * 1000,
    initialData: true,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      instance?.reSync();

      return true;
    },
  });
}

type PushHandlerFn<RxDocType> = (data: {
  docs: RxReplicationWriteToMasterRow<RxDocType>[];
}) => Promise<WithDeleted<RxDocType>[]>;
type PullHandlerFn<RxDocType> = (data: {
  limit: number;
  checkpoint?: { minUpdatedAt: string };
}) => Promise<{ docs: WithDeleted<RxDocType>[] }>;

type InitReplicatorProps<RxDocType> = {
  collection: RxCollection<RxDocType> | null;
  handlePush: PushHandlerFn<RxDocType>;
  handlePull: PullHandlerFn<RxDocType>;
};

function useInitReplicator<RxDocType extends { updatedAt: string }>({
  collection,
  handlePush,
  handlePull,
}: InitReplicatorProps<RxDocType>): RxReplicationState<RxDocType, CheckpointType> | null {
  if (!collection) return null;

  let instance = replicatorInstances.get(collection.name as TableName);

  if (!instance) {
    // https://rxdb.info/replication.html#replicaterxcollection
    instance = replicateRxCollection<RxDocType, CheckpointType>({
      collection,

      /**
       * An id for the replication to identify it
       * and so that RxDB is able to resume the replication on app reload.
       * If you replicate with a remote server, it is recommended to put the
       * server url into the replicationIdentifier.
       *
       */
      // @TODO use var replaced at build? or determine at runtime?
      replicationIdentifier: 'https://localhost:3000',

      /**
       * By default it will do an ongoing realtime replication.
       * By settings live: false the replication will run once until the local state
       * is in sync with the remote state, then it will cancel itself.
       * (optional), default is true.
       */
      live: true,

      /**
       * If this is set to false,
       * the replication will not start automatically
       * but will wait for replicationState.start() being called.
       * (optional), default is true
       */
      autoStart: true,

      /**
       * Time in milliseconds after when a failed backend request
       * has to be retried.
       * This time will be skipped if a offline->online switch is detected
       * via navigator.onLine
       * (optional), default is 5 seconds.
       */
      retryTime: 5 * 1000,

      /**
       * When multiInstance is true, like when you use RxDB in multiple browser tabs,
       * the replication should always run in only one of the open browser tabs.
       * If waitForLeadership is true, it will wait until the current instance is leader.
       * If waitForLeadership is false, it will start replicating, even if it is not leader.
       * [default=true]
       */
      waitForLeadership: true,

      /**
       * Custom deleted field, the boolean property of the document data that
       * marks a document as being deleted.
       * If your backend uses a different fieldname then '_deleted', set the fieldname here.
       * RxDB will still store the documents internally with '_deleted', setting this field
       * only maps the data on the data layer.
       *
       * If a custom deleted field contains a non-boolean value, the deleted state
       * of the documents depends on if the value is truthy or not. So instead of providing a boolean * * deleted value, you could also work with using a 'deletedAt' timestamp instead.
       *
       * [default='_deleted']
       */
      // deletedField: '_deleted',

      push: {
        /**
         * Batch size, optional
         * Defines how many documents will be given to the push handler at once.
         */
        // batchSize: 5,

        /**
         * Modifies all documents before they are given to the push handler.
         * Can be used to swap out a custom deleted flag instead of the '_deleted' field.
         * If the push modifier return null, the document will be skipped and not send to the remote.
         * Notice that the modifier can be called multiple times and should not contain any side effects.
         * (optional)
         */
        // modifier: d => d,

        async handler(docs) {
          console.debug(`${collection.name}.replicate.PUSH.start`, docs);

          const res = await handlePush({ docs });

          console.debug(`  ${collection.name}.replicate.PUSH.completed`);

          return res;
        },
      },

      pull: {
        /**
         * Batch size, optional
         * Defines how many documents will be requested from the pull handler at once.
         */
        batchSize: 200,

        /**
         * Modifies all documents after they have been pulled
         * but before they are used by RxDB.
         * Notice that the modifier can be called multiple times and should not contain any side effects.
         * (optional)
         */
        // modifier: d => d,

        /**
         * Stream of the backend document writes.
         * See below.
         * You only need a stream$ when you have set live=true
         */
        // stream$: pullStream$.asObservable(),

        async handler(lastCheckpoint, batchSize) {
          console.debug(`${collection.name}.replicate.PULL.start`, batchSize, lastCheckpoint);

          const { docs } = await handlePull({
            limit: batchSize,
            checkpoint: lastCheckpoint,
          });

          const isFinished = docs.length < batchSize;
          if (isFinished) {
            console.debug(`  ${collection.name}.replicate.PULL.completed`);
            void collection.upsertLocal<LocalSyncInfo>(LocalDocId.SyncInfo, { time: Date.now() }).catch();
          } else {
            console.debug(`  ${collection.name}.replicate.PULL.batchCompleted`);
          }

          return {
            /**
             * Contains the pulled documents from the remote.
             * Notice: If documentsFromRemote.length < batchSize,
             * then RxDB assumes that there are no more un-replicated documents
             * on the backend, so the replication will switch to 'Event observation' mode.
             */
            documents: docs,

            /**
             * The last checkpoint of the returned documents.
             * On the next call to the pull handler,
             * this checkpoint will be passed as 'lastCheckpoint'
             */
            checkpoint:
              docs.length === 0
                ? lastCheckpoint ?? null
                : {
                    minUpdatedAt: docs[docs.length - 1]!.updatedAt,
                  },
          };
        },
      },
    });

    instance.error$.subscribe(err => {
      console.log('Got replication error:');
      console.dir(err);
    });

    replicatorInstances.set(collection.name as TableName, instance);
  }

  return instance as RxReplicationState<RxDocType, CheckpointType>;
}
