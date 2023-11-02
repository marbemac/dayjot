import { Box, Button, HStack } from '@supastack/ui-primitives';
import { useCallback } from 'react';
import { $path } from 'remix-routes';

import { ctx } from '~/app.ts';
import { useUser } from '~/auth.tsx';
import { Link, NavLink, useRouteIsActive } from '~/components/Link/index.ts';
import { UserDropdownMenu } from '~/components/UserDropdownMenu.tsx';
import { tinyQueries, tinyStore } from '~/state/tinybase.client.tsx';

export const SiteNav = () => {
  const { user } = useUser();

  return (
    <Box as="header" tw="sticky top-0 z-10 flex border-b bg-panel/75 px-6 py-4 backdrop-blur-lg">
      <HStack center="y" spacing={6} tw="flex-1">
        {user ? (
          <UserDropdownMenu trigger={<Button variant="soft">Menu</Button>} />
        ) : (
          <Button as={Link} to={$path('/auth')}>
            Login
          </Button>
        )}
      </HStack>

      {user ? (
        <HStack center spacing={6} tw="flex-1">
          <SiteNavLink to={$path('/a/journal')}>Journal</SiteNavLink>
        </HStack>
      ) : null}

      <HStack tw="flex-1 justify-end">
        <SyncButton />
      </HStack>
    </Box>
  );
};

const SiteNavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const isActive = useRouteIsActive({ to });

  return (
    <Button as={NavLink} to={$path('/a/journal')} variant={isActive ? 'solid' : 'ghost'}>
      {children}
    </Button>
  );
};

const SyncButton = () => {
  const { mutateAsync, isPending } = ctx.trpc.sync.fromLocal.useMutation();

  const doSync = useCallback(async () => {
    try {
      const dirtyEntries = Object.values(tinyQueries.getResultTable('dirtyEntries'));
      console.debug('Syncing dirty entries...', dirtyEntries);

      const res = await mutateAsync({ entries: dirtyEntries as any });

      tinyStore.transaction(() => {
        for (const entry of res.updated) {
          console.debug(`  Synced ${entry.day} [${entry.contentHash}]`);
          tinyStore.setPartialRow('entries', entry.day, { remoteHash: entry.contentHash });
        }
      });
    } catch (e) {
      console.error('Error syncing entries from local', e);
    }
  }, [mutateAsync]);

  return (
    <Button onClick={doSync} isLoading={isPending} loadingText="Syncing...">
      Sync
    </Button>
  );
};
