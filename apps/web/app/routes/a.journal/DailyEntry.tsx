import { editors, RichTextEditor } from '@dayjot/editor';
import { Box, Heading, VStack } from '@supastack/ui-primitives';
import { dayjs } from '@supastack/utils-dates';
import { memo, useCallback } from 'react';
import type { RxCollection } from 'rxdb';
import { useRxCollection, useRxData } from 'rxdb-hooks';

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
  const q = useCallback((c: RxCollection<Entry>) => c.findOne(dayId), [dayId]);

  const { result } = useRxData<Entry>(TableName.Entries, q);
  const entry = result[0] as EntryDoc | undefined;

  const handleStartEditor = useCallback(async () => {
    await entries.upsert({
      day: dayId,
      content: '',
    });

    editors.set.focusOnEditor(dayId);
  }, [dayId, entries]);

  return (
    // -mt-px so that the top entry in the list doesn't show a border (doubling up with navbar bottom border)
    <VStack tw="-mt-px p-8" spacing={5}>
      <Heading size={4} as="h4">
        {formattedDate}
      </Heading>

      {entry ? (
        <EntryEditor entry={entry} />
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

// const EntryEditor = ({ entry }: { entry: EntryDoc }) => {
//   const entryDoc = useEntryEditor2(entry);

//   return <Editor id={entry.day} editor={entryDoc.editor} />;
// };

const EntryEditor = ({ entry }: { entry: EntryDoc }) => {
  useEntryEditor(entry);

  return <RichTextEditor id={entry.day} />;
};
