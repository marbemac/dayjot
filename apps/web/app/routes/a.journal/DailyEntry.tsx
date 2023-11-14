import { editors, RichTextEditor } from '@dayjot/editor';
import { Box, Card, Heading, VStack } from '@supastack/ui-primitives';
import { dayjs } from '@supastack/utils-dates';
import { memo, useCallback } from 'react';
import { useRxCollection } from 'rxdb-hooks';

import { useDayEntry } from '~/local-db/hooks.ts';
import { TableName } from '~/local-db/index.client.ts';
import type { Entry, EntryDoc } from '~/local-db/schemas.client.ts';

import { useEntryEditor } from './use-entry-editor.ts';

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

  const entries = useRxCollection<Entry>(TableName.Entries)!;
  const entry = useDayEntry(day);

  const handleStartEditor = useCallback(async () => {
    await entries.upsert({
      day: dayId,
      content: '',
    });

    editors.set.focusOnEditor(dayId);
  }, [dayId, entries]);

  return (
    <Box tw="px-10 pt-10">
      <Card size="lg">
        <VStack spacing={5}>
          <Heading size={4} as="h4">
            {formattedDate}
          </Heading>

          {entry ? (
            <EntryEditor entry={entry} />
          ) : (
            <Box
              tw="w-full cursor-text bg-transparent text-lg text-soft"
              tabIndex={0}
              onClick={handleStartEditor}
              onFocus={handleStartEditor}
            >
              Write here...
            </Box>
          )}
        </VStack>
      </Card>
    </Box>
  );
});

DailyEntry.displayName = 'DailyEntry';

const EntryEditor = ({ entry }: { entry: EntryDoc }) => {
  useEntryEditor(entry);

  return <RichTextEditor id={entry.day} />;
};
