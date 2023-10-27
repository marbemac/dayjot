import { Box, Heading, VStack } from '@supastack/ui-primitives';
import { dayjs } from '@supastack/utils-dates';
import { ChangeEventHandler, memo, useCallback, useState } from 'react';
import { StoreInspector } from 'tinybase/debug/ui-react-dom';

import { DailyScroller } from './DailyScroller.tsx';
import { StoreProvider, useRow, useSetCellCallback } from './store.tsx';

export default function Debug() {
  return (
    <StoreProvider>
      <DebugInner />
    </StoreProvider>
  );
}

const DebugInner = () => {
  return (
    <>
      <DailyScroller Entry={DailyEntry} />
      <StoreInspector />
    </>
  );
};

const DailyEntry = memo((props: { day: dayjs.ConfigType }) => {
  const day = dayjs(props.day);
  const dayId = day.format('YYYY-MM-DD');
  const formattedDate = day.calendar(null, {
    sameDay: '[Today]', // The same day ( Today )
    nextDay: '[Tomorrow]', // The next day ( Tomorrow )
    nextWeek: '[Next] dddd', // The next week ( Next Sunday )
    lastDay: '[Yesterday]', // The day before ( Yesterday )
    lastWeek: 'ddd, MMM D', // Last week ( Wed, Jan 25 )
    sameElse: 'ddd, MMM D', // Everything else ( Wed, Jan 25 )
  });

  const entry = useRow('entries', dayId);

  const handleChange = useSetCellCallback(
    'entries',
    dayId,
    'content',
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => evt.currentTarget.value,
    [],
  );

  // console.log('DailyEntry.render', dayId, formattedDate, entry);

  return (
    // -mt-px so that the top entry in the list doesn't show a border (doubling up with navbar bottom border)
    <VStack tw="-mt-px p-8" spacing={5}>
      <Heading size={4} as="h4">
        {formattedDate}
      </Heading>

      <Box
        as="textarea"
        value={entry.content || ''}
        placeholder="Write here..."
        onChange={handleChange}
        tw="h-28 w-full bg-transparent text-fg"
      />
    </VStack>
  );
});

DailyEntry.displayName = 'DailyEntry';
