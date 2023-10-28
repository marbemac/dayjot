import { Box, Heading, VStack } from '@supastack/ui-primitives';
import { dayjs } from '@supastack/utils-dates';
import { memo, useCallback } from 'react';

import { Tiptap } from '~client/components/Editor/index.ts';
import { useFocusOnEditor } from '~client/state/editor.ts';
import { useEntryDoc } from '~client/state/entries.ts';
import { useCell, useSetCellCallback } from '~client/state/tinybase.tsx';

export const DailyEntry = memo((props: { day: dayjs.ConfigType }) => {
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

  /**
   * Can switch to simpler hasEntry check if the following issue is implemented
   * https://github.com/tinyplex/tinybase/issues/102
   */
  const dbId = useCell('entries', dayId, 'dbId');
  const hasEntry = !!dbId;

  const entryDoc = useEntryDoc(dayId);

  const focusOnEditor = useFocusOnEditor();
  const addEntry = useSetCellCallback('entries', dayId, 'dbId', () => '@TODO', []);
  const handleStartEditor = useCallback(() => {
    focusOnEditor(dayId);
    addEntry();
  }, [addEntry, dayId, focusOnEditor]);

  return (
    // -mt-px so that the top entry in the list doesn't show a border (doubling up with navbar bottom border)
    <VStack tw="-mt-px p-8" spacing={5}>
      <Heading size={4} as="h4">
        {formattedDate}
      </Heading>

      {hasEntry ? (
        <Tiptap entryDoc={entryDoc} />
      ) : (
        <Box
          tw="h-5 w-full cursor-text bg-transparent text-soft"
          tabIndex={0}
          onClick={handleStartEditor}
          onFocus={handleStartEditor}
        >
          Write here...
        </Box>
      )}
    </VStack>
  );
});

DailyEntry.displayName = 'DailyEntry';
