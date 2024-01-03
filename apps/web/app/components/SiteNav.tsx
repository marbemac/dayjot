import { Box, Button, HStack } from '@supastack/ui-primitives';
import { $path } from 'remix-routes';

import { useUser } from '~/auth.tsx';

// import { Link, NavLink, useRouteIsActive } from './Link/index.ts';
// import { UserDropdownMenu } from './UserDropdownMenu.tsx';

export const SiteNav = () => {
  return (
    <Box as="header" tw="sticky top-0 z-auto flex border-b bg-panel/75 px-6 py-4 backdrop-blur-lg">
      foo
    </Box>
  );
};

// export const SiteNav = () => {
//   const { user } = useUser();

//   return (
//     <Box as="header" tw="sticky top-0 z-auto flex border-b bg-panel/75 px-6 py-4 backdrop-blur-lg">
//       <HStack center="y" spacing={6} tw="flex-1">
//         {user ? (
//           <UserDropdownMenu trigger={<Button variant="soft">Menu</Button>} />
//         ) : (
//           <Button as={Link} to={$path('/auth')}>
//             Login
//           </Button>
//         )}
//       </HStack>

//       {user ? (
//         <HStack center spacing={6} tw="flex-1">
//           <SiteNavLink to={$path('/a/journal')}>Journal</SiteNavLink>
//         </HStack>
//       ) : null}

//       <Box tw="flex flex-1 justify-end" />
//     </Box>
//   );
// };

// const SiteNavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
//   const isActive = useRouteIsActive({ to });

//   return (
//     <Button as={NavLink} to={$path('/a/journal')} variant={isActive ? 'solid' : 'ghost'}>
//       {children}
//     </Button>
//   );
// };
