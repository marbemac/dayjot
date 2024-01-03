import { Outlet } from '@remix-run/react';
import { Box } from '@supastack/ui-primitives';

// import { Modals } from '~/modals/index.tsx';
import { AppSidebar } from './AppSidebar.tsx';

// @TODO responsive
const SIDEBAR_WIDTH = 330;

export function AppLayout() {
  return (
    <Box style={{ paddingLeft: SIDEBAR_WIDTH }}>
      <Box tw="fixed inset-y-0 left-0 py-10 pl-10" style={{ width: SIDEBAR_WIDTH }}>
        <AppSidebar />
      </Box>

      <Box as="main" tw="h-screen flex-1">
        <Outlet />
      </Box>
    </Box>
  );
}
