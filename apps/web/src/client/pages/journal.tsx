import { Box, ClientOnly, HStack } from '@supastack/ui-primitives';

import { ctx } from '~app';
import { enforceAuthenticated } from '~client/auth.tsx';

export async function loader() {
  await enforceAuthenticated();

  return null;
}

export function Component() {
  ctx.useHead({ title: 'Journal' });

  return (
    <HStack divider tw="flex-1">
      <Box as="main" tw="flex-1">
        <ClientOnly
          component={() => import('~client/components/Journal/index.tsx')}
          fallback={<Box tw="p-8">Initializing...</Box>}
        />
      </Box>

      <Box as="aside" tw="sticky top-0 w-80 overflow-y-auto overflow-x-hidden">
        Cal / Filters
      </Box>
    </HStack>
  );
}
