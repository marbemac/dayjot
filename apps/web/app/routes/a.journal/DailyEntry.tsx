import { observer, useComputed, useObservable, useObserve } from '@legendapp/state/react';
import { useMeasure } from '@legendapp/state/react-hooks/useMeasure';
import { editors$, RichTextEditor } from '@libs/editor';
import { Box, BoxRef, Button, Card, Heading, VStack } from '@supastack/ui-primitives';
import { dayjs } from '@supastack/utils-dates';
import { memo, useCallback, useRef } from 'react';

import { useDayEntry, useUpsertDayEntry } from '~/local-db/index.client.ts';
import type { EntryDay } from '~/local-db/schemas.client.ts';
import { type EntryDoc, formatEntryDay } from '~/local-db/schemas.client.ts';

import { useEntryEditor } from './use-entry-editor.ts';

const CURRENT_YEAR = dayjs().year();

export type DailyEntryProps = { day: dayjs.Dayjs; fallback?: EntryDoc };

export const DailyEntry = memo(({ day, fallback }: DailyEntryProps) => {
  const dayId = formatEntryDay(day);
  let formattedDate = day.calendar(null, {
    sameDay: '[Today]', // The same day ( Today )
    nextDay: '[Tomorrow]', // The next day ( Tomorrow )
    nextWeek: '[Next] dddd', // The next week ( Next Sunday )
    lastDay: '[Yesterday]', // The day before ( Yesterday )
    lastWeek: 'ddd, MMM D', // Last week ( Wed, Jan 25 )
    sameElse: 'ddd, MMM D', // Everything else ( Wed, Jan 25 )
  });

  if (day.year() !== CURRENT_YEAR) {
    formattedDate = `${formattedDate}, '${day.format('YY')}`;
  }

  const entry = useDayEntry(day) ?? fallback;

  const upsertEntry = useUpsertDayEntry();
  const handleStartEditor = useCallback(async () => {
    await upsertEntry(dayId);

    editors$.focusOnEditor(dayId);
  }, [dayId, upsertEntry]);

  return (
    <Box tw="mx-auto max-w-6xl px-10 pt-10">
      <Card size="lg" tw="relative">
        <VStack spacing={5}>
          <Heading size={4} as="h4">
            {formattedDate}
          </Heading>

          <DailyEntryInner dayId={dayId} entry={entry} handleStartEditor={handleStartEditor} />
        </VStack>
      </Card>
    </Box>
  );
});

DailyEntry.displayName = 'DailyEntry';

const DailyEntryInner = observer(
  ({ dayId, entry, handleStartEditor }: { dayId: EntryDay; entry?: EntryDoc; handleStartEditor: () => void }) => {
    const ref = useRef<HTMLDivElement>(null)!;
    const { height } = useMeasure(ref);

    const showAll = useObservable(false);
    const editorIsFocused = useComputed(() => editors$.focusedEditor.get() === dayId, [dayId]);
    const constrainHeight = useComputed(() => height.get() > 200 && !showAll.get());

    useObserve(() => {
      if (editorIsFocused.get()) {
        showAll.set(true);
      }
    });

    return (
      <>
        <Box tw={[constrainHeight.get() && 'max-h-96 overflow-hidden']}>
          <BoxRef ref={ref}>
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
          </BoxRef>
        </Box>

        {constrainHeight.get() && (
          <Box>
            <Button
              endIcon="arrow-down"
              onClick={() => {
                showAll.set(true);
              }}
            >
              Show All
            </Button>
          </Box>
        )}
      </>
    );
  },
);

const EntryEditor = ({ entry }: { entry: EntryDoc }) => {
  useEntryEditor(entry);

  return <RichTextEditor id={entry.day} />;
};
