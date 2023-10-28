import { Box, HStack } from '@supastack/ui-primitives';

import { ctx } from '~app';
import { DailyEntry, DailyScroller } from '~client/components/Journal/index.ts';

export function Component() {
  ctx.useHead({ title: 'Journal' });

  return (
    <HStack divider tw="flex-1">
      <Box as="main" tw="flex-1">
        <DailyScroller Entry={DailyEntry} />
      </Box>

      <Box as="aside" tw="sticky top-0 w-80 overflow-y-auto overflow-x-hidden">
        Cal / Filters
      </Box>
    </HStack>
  );
}
