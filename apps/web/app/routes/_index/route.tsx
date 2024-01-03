import { Box, Button, VStack } from '@supastack/ui-primitives';

import { userStore$ } from '~/app-store.ts';
import { Link } from '~/components/Link.tsx';
import { SiteNav } from '~/components/SiteNav.tsx';
import { TableName, useLocalSyncInfo } from '~/local-db/index.client.ts';
import { localDbStore$ } from '~/local-db/store.ts';
import { modalPath } from '~/modals/index.tsx';
import { useTrpc } from '~/providers.tsx';
import type { MetaFunction } from '~/types.ts';

export const meta: MetaFunction = () => {
  return [{ title: 'Home' }];
};

export default function Home() {
  const syncInfo = useLocalSyncInfo(TableName.Entries);

  const logout = useLogout({
    onSuccess: async () => {
      const db = localDbStore$.db.peek();
      if (!db) return;

      try {
        await db.remove();
      } catch (err) {
        console.error('Error removing local db', err);
      }
    },
  });

  return (
    <>
      <SiteNav />
      <VStack spacing={4} divider tw="p-20">
        <Box>Logged in: {String(userStore$.isLoggedIn.get())}</Box>
        <Box>Last checked: {String(userStore$.checkedAt.get())}</Box>
        <Box>User: {String(userStore$.user.id.get())}</Box>
        <Box>Entries last synced at: {String(syncInfo?.toJSON().data.time)}</Box>
        <Box>
          {userStore$.isLoggedIn.get() ? (
            <Button
              onClick={() => {
                logout.mutate();
              }}
            >
              {logout.isPending ? 'Logging out...' : 'Logout'}
            </Button>
          ) : (
            <Button as={Link} to={modalPath('auth')}>
              Auth
            </Button>
          )}
        </Box>
      </VStack>
    </>
  );
}

const useLogout = ({ onSuccess }: { onSuccess?: () => void | Promise<void> } = {}) => {
  const { trpc } = useTrpc();

  const logout = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      userStore$.isLoggedIn.set(false);

      if (onSuccess) {
        await onSuccess();
      }

      await trpc.$invalidate();
    },
  });

  return logout;
};
