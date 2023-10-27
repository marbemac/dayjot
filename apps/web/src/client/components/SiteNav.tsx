import { Box, Button, HStack } from '@supastack/ui-primitives';

import { useUser } from '~client/auth.tsx';
import { paths } from '~client/routes.tsx';

import { Link, NavLink } from './Link/index.ts';
import { UserDropdownMenu } from './UserDropdownMenu.tsx';

export const SiteNav = () => {
  const { user } = useUser();

  return (
    <Box as="header" tw="sticky top-0 z-10 flex border-b bg-panel/75 px-6 py-4 backdrop-blur-lg">
      <HStack as="nav" center="y" spacing={6}>
        <NavLink
          to="/"
          exact
          tw="ui-active:cursor-default ui-active:opacity-100 ui-inactive:opacity-60 ui-inactive:hover:opacity-100"
        >
          Home
        </NavLink>
      </HStack>

      <Box tw="flex-1" />

      <HStack center="y" spacing={6}>
        {user ? (
          <UserDropdownMenu trigger={<Button>Menu</Button>} />
        ) : (
          <Button as={Link} to={paths.Auth.buildPath({})}>
            Login
          </Button>
        )}
      </HStack>
    </Box>
  );
};
