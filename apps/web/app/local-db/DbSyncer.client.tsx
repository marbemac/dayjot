import { type ReplicationOptions, type RxCollection, type RxReplicationWriteToMasterRow, type WithDeleted } from 'rxdb';
import type { RxReplicationState } from 'rxdb/plugins/replication';
import { replicateRxCollection } from 'rxdb/plugins/replication';

import { ctx } from '~/app.ts';

import { TableName, useRxCollection } from './index.client.ts';

export const DbSyncer = () => {
  const { mutateAsync: pushEntries } = ctx.trpc.sync.pushEntries.useMutation();
  const { mutateAsync: pullEntries } = ctx.trpc.sync.pullEntries.useMutation();
  useReplicator({ collectionName: TableName.Entries, handlePull: pullEntries, handlePush: pushEntries });

  return null;
};

function useReplicator<RxDocType extends { updatedAt: string }>({
  collectionName,
  handlePull,
  handlePush,
}: { collectionName: TableName } & Pick<InitReplicatorProps<RxDocType>, 'handlePush' | 'handlePull'>) {
  const collection = useRxCollection(collectionName)!;
  initReplicator({ collection, handlePush, handlePull });
}

type CheckpointType = { minUpdatedAt: string };

type PushHandlerFn<RxDocType> = (data: {
  docs: RxReplicationWriteToMasterRow<RxDocType>[];
}) => Promise<WithDeleted<RxDocType>[]>;
type PullHandlerFn<RxDocType> = (data: {
  limit: number;
  checkpoint?: { minUpdatedAt: string };
}) => Promise<{ docs: WithDeleted<RxDocType>[] }>;

type InitReplicatorProps<RxDocType> = Pick<ReplicationOptions<RxDocType, CheckpointType>, 'collection'> & {
  handlePush: PushHandlerFn<RxDocType>;
  handlePull: PullHandlerFn<RxDocType>;
};

const replicatorInstances = new Map<RxCollection, RxReplicationState<any, CheckpointType>>();

function initReplicator<RxDocType extends { updatedAt: string }>({
  collection,
  handlePush,
  handlePull,
}: InitReplicatorProps<RxDocType>): RxReplicationState<RxDocType, CheckpointType> | undefined {
  if (!collection) return;

  let instance = replicatorInstances.get(collection);

  if (!instance) {
    instance = replicateRxCollection<RxDocType, CheckpointType>({
      collection,
      replicationIdentifier: 'https://localhost:3000',
      live: true,
      autoStart: true,
      retryTime: 5 * 1000,
      waitForLeadership: true,

      push: {
        async handler(docs) {
          console.debug(`${collection.name}.replicate.PUSH.start`, docs);

          const res = await handlePush({ docs });

          console.debug(`  ${collection.name}.replicate.PUSH.completed`);

          return res;
        },
      },

      pull: {
        async handler(lastCheckpoint, batchSize) {
          console.debug(`${collection.name}.replicate.PULL.start`, lastCheckpoint);

          const { docs } = await handlePull({
            limit: batchSize,
            checkpoint: lastCheckpoint,
          });

          console.debug(`  ${collection.name}.replicate.PULL.completed`);

          return {
            documents: docs,

            /**
             * The last checkpoint of the returned documents.
             * On the next call to the pull handler,
             * this checkpoint will be passed as 'lastCheckpoint'
             */
            checkpoint:
              docs.length === 0
                ? lastCheckpoint
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

    replicatorInstances.set(collection, instance);
  }

  return instance as RxReplicationState<RxDocType, CheckpointType>;
}
