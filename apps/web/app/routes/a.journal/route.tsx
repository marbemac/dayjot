import type { ServerRuntimeMetaFunction } from '@remix-run/server-runtime';
import { Box, HStack } from '@supastack/ui-primitives';

import { Calendar } from './Calendar.tsx';
import { DailyEntry } from './DailyEntry.tsx';
import { DailyScroller } from './DailyScroller.tsx';

export const meta: ServerRuntimeMetaFunction = () => {
  return [{ title: 'Journal' }];
};

export default function Journal() {
  return (
    <HStack divider tw="flex-1">
      <Box as="main" tw="flex-1">
        <DailyScroller Entry={DailyEntry} />
      </Box>

      <Box as="aside" tw="sticky top-0 w-80 overflow-y-auto overflow-x-hidden">
        <Calendar />
      </Box>
    </HStack>
  );
}
