import { Box, Button, HStack } from '@supastack/ui-primitives';
import { useCallback } from 'react';
import { NavLink, Outlet, ScrollRestoration } from 'react-router-dom';

import { ctx } from '~app';
import { UserDropdownMenu } from '~client/components/UserDropdownMenu.tsx';

export function Component() {
  // https://unhead.unjs.io/usage/guides/template-params#separator
  ctx.useHead({
    titleTemplate: '%s %separator %subpage %separator %site.name',
    templateParams: {
      site: { name: 'DayJot' },
      separator: '-',
      subpage: null,
    },
    meta: [
      {
        name: 'description',
        content: 'Welcome to %site.name.',
      },
      {
        property: 'og:site_name',
        content: '%site.name',
      },
    ],
  });

  const linkClass = useCallback(
    ({ isActive }: any) => (isActive ? 'opacity-100 cursor-default' : 'hover:opacity-100 opacity-60'),
    [],
  );

  return (
    <>
      <Box tw="flex border-b px-6 py-4">
        <HStack as="nav" center="y" spacing={6}>
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
        </HStack>

        <Box tw="flex-1" />

        <HStack center="y" spacing={6}>
          <UserDropdownMenu trigger={<Button>Tmp Options</Button>} />
        </HStack>
      </Box>

      <Outlet />

      <ScrollRestoration />
    </>
  );
}
