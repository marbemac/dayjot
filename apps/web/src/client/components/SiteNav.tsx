import { Box, Button, HStack } from '@supastack/ui-primitives';

import { useUser } from '~client/auth.tsx';
import { Link, NavLink, useRouteIsActive } from '~client/components/Link/index.ts';
import { paths } from '~client/routes.tsx';

import { UserDropdownMenu } from './UserDropdownMenu.tsx';

export const SiteNav = () => {
  const { user } = useUser();

  return (
    <Box as="header" tw="sticky top-0 z-10 flex border-b bg-panel/75 px-6 py-4 backdrop-blur-lg">
      <HStack center="y" spacing={6} tw="flex-1">
        {user ? (
          <UserDropdownMenu trigger={<Button variant="soft">Menu</Button>} />
        ) : (
          <Button as={Link} to={paths.Auth.buildPath({})}>
            Login
          </Button>
        )}
      </HStack>

      {user ? (
        <HStack center spacing={6} tw="flex-1">
          <SiteNavLink to={paths.A.Journal.buildPath({})}>Journal</SiteNavLink>
        </HStack>
      ) : null}

      <Box tw="flex-1" />
    </Box>
  );
};

const SiteNavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const isActive = useRouteIsActive({ to });

  return (
    <Button as={NavLink} to={paths.A.Journal.buildPath({})} variant={isActive ? 'solid' : 'ghost'}>
      {children}
    </Button>
  );
};
