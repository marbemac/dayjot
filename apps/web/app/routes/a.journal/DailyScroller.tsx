import { observer } from '@legendapp/state/react';
import type { JournalDay, Settings } from '@libs/settings';
import { dayjs } from '@supastack/utils-dates';
import { safeStringify } from '@supastack/utils-json';
import { useCallback, useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { calendarStore$ } from '~/components/Calendar/state.ts';
import type { EntryDoc } from '~/local-db/schemas.client.ts';
import { formatEntryDay } from '~/local-db/schemas.client.ts';
import { localDbStore$, settingsStore$ } from '~/local-db/store.ts';

import type { DailyEntryProps } from './DailyEntry.tsx';
import { DailyEntry } from './DailyEntry.tsx';

const INITIAL_FUTURE_COUNT = 10;
const INITIAL_PAST_COUNT = 30;
const INITIAL_INDEX = INITIAL_FUTURE_COUNT - 1;
const COUNT_PER_PREPEND = 20;
const COUNT_PER_APPEND = 20;
const TWO_WEEKS_AGO = dayjs().subtract(14, 'day');

export default observer(function DailyScroller() {
  // const anchorDate = dayjs('2023-10-20');
  const anchorDate = calendarStore$.active.get();
  const anchorDateSetAt = calendarStore$.activeSetAt.get();
  const journalDays = settingsStore$.settings.journalDays.get();

  const [days, setDays] = useState<ScrollerItemData[] | null>(null);
  const [remountKey, setRemountKey] = useState(computeRemountKey({ anchorDate, journalDays, anchorDateSetAt }));

  useEffect(() => {
    async function generate() {
      const days = await generateDaysWindowAsync(anchorDate, journalDays);
      setDays(days);
      setRemountKey(computeRemountKey({ anchorDate, journalDays, anchorDateSetAt }));
    }

    void generate();
  }, [anchorDate, journalDays, anchorDateSetAt]);

  if (!days) {
    return null;
  }

  // key forces a re-mount when the key props change, to reset+re-render the scroller
  return <Scroller key={remountKey} Entry={DailyEntry} initialDays={days} journalDays={journalDays} />;
});

type ScrollerItemData = { day: dayjs.Dayjs; entry: EntryDoc | undefined };

const Scroller = ({
  Entry,
  initialDays,
  journalDays,
}: {
  Entry: (props: DailyEntryProps) => React.ReactNode;
  initialDays: ScrollerItemData[];
  journalDays: Settings['journalDays'];
}) => {
  const [days, setDays] = useState(initialDays);

  const [firstItemIndex, setFirstItemIndex] = useState(999999);

  const prependDays = useCallback(() => {
    const nextFirstItemIndex = firstItemIndex - COUNT_PER_PREPEND;
    // console.debug('[Scroller] start reached, prepend days', { nextFirstItemIndex, from: days[0]! });

    async function prepend() {
      const prevDays = await generateDays({
        count: COUNT_PER_PREPEND,
        from: days[0]!.day,
        dir: 'future',
        journalDays,
      });

      setFirstItemIndex(() => nextFirstItemIndex);
      setDays(() => [...prevDays, ...days]);
    }

    void prepend();

    return false;
  }, [firstItemIndex, days, journalDays]);

  const appendDays = useCallback(async () => {
    const nextDays = await generateDays({
      count: COUNT_PER_APPEND,
      from: days[days.length - 1]!.day,
      dir: 'past',
      journalDays,
    });

    setDays(() => [...days, ...nextDays]);

    return false;
  }, [days, journalDays]);

  return (
    <Virtuoso
      // useWindowScroll // can be buggy, avoiding for now...
      // logLevel={LogLevel.DEBUG}
      firstItemIndex={firstItemIndex}
      initialTopMostItemIndex={INITIAL_INDEX}
      data={days}
      startReached={prependDays}
      endReached={appendDays}
      // overscan={{ main: 500, reverse: 500 }}
      increaseViewportBy={{ top: 500, bottom: 500 }}
      itemContent={(index, { day, entry }) => <Entry day={day} fallback={entry} />}
    />
  );
};

const generateDaysWindowAsync = async (anchorDate: dayjs.Dayjs, journalDays: Settings['journalDays']) => {
  const [afterAnchor, beforeAnchor, anchorDateEntry] = await Promise.all([
    generateDays({ count: INITIAL_FUTURE_COUNT, from: anchorDate, dir: 'future', journalDays }),
    generateDays({ count: INITIAL_PAST_COUNT, from: anchorDate, dir: 'past', journalDays }),
    localDbStore$.db.entries.findOne(formatEntryDay(anchorDate)).exec(),
  ]);

  return [...afterAnchor, { day: anchorDate, entry: anchorDateEntry ?? undefined }, ...beforeAnchor];
};

const computeRemountKey = ({
  anchorDate,
  journalDays,
  anchorDateSetAt,
}: {
  anchorDate: dayjs.Dayjs;
  journalDays: Settings['journalDays'];
  anchorDateSetAt: number;
}) => safeStringify({ anchorKey: formatEntryDay(anchorDate), journalDays, anchorDateSetAt });

async function generateDays({
  count,
  from,
  dir,
  journalDays,
}: {
  count: number;
  from: dayjs.Dayjs;
  dir: 'past' | 'future';
  journalDays: Settings['journalDays'];
}) {
  let entries: EntryDoc[] = [];
  let oldestEntryDay: dayjs.Dayjs | undefined;
  let newestEntryDay: dayjs.Dayjs | undefined;
  if (dir === 'future') {
    entries = await localDbStore$.db.entries
      .find({
        selector: { day: { $gt: formatEntryDay(from) } },
        sort: [{ day: 'asc' }],
        limit: count,
      })
      .exec();
    oldestEntryDay = entries[0]?.day ? dayjs(entries[0]?.day) : undefined;
    newestEntryDay = entries[entries.length - 1]?.day ? dayjs(entries[entries.length - 1]?.day) : undefined;
  } else {
    entries = await localDbStore$.db.entries
      .find({
        selector: { day: { $lt: formatEntryDay(from) } },
        sort: [{ day: 'desc' }],
        limit: count,
      })
      .exec();
    oldestEntryDay = entries[entries.length - 1]?.day ? dayjs(entries[entries.length - 1]?.day) : undefined;
    newestEntryDay = entries[0]?.day ? dayjs(entries[0]?.day) : undefined;
  }

  const entryMap = entries.reduce(
    (acc, entry) => {
      acc[entry.day] = entry;
      return acc;
    },
    {} as Record<EntryDoc['day'], EntryDoc>,
  );

  return generateDaysWithEntries({
    count: count - 1,
    from,
    dir,
    journalDays,
    entries: entryMap,
    oldestEntryDay,
    newestEntryDay,
  });
}

function generateDaysWithEntries(
  {
    count,
    from,
    dir,
    journalDays,
    entries = {},
    oldestEntryDay,
    newestEntryDay,
  }: {
    count: number;
    from: dayjs.Dayjs;
    dir: 'past' | 'future';
    journalDays: Settings['journalDays'];
    entries: Record<EntryDoc['day'], EntryDoc> | undefined;
    oldestEntryDay: dayjs.Dayjs | undefined;
    newestEntryDay: dayjs.Dayjs | undefined;
  },
  days: ScrollerItemData[] = [],
) {
  if (count === 0) return dir === 'future' ? days.reverse() : days;

  const nextDay = dir === 'past' ? from.subtract(1, 'day') : from.add(1, 'day');

  // If we are going into the past, and we have reached the oldest entry, stop
  if (dir === 'past' && nextDay.isBefore(TWO_WEEKS_AGO) && (!oldestEntryDay || nextDay.isBefore(oldestEntryDay))) {
    return days;
  }

  if (!dayIsVisible(nextDay, journalDays, entries)) {
    return generateDaysWithEntries(
      { count, from: nextDay, dir, journalDays, entries, oldestEntryDay, newestEntryDay },
      days,
    );
  }

  days.push({ day: nextDay, entry: entries[formatEntryDay(nextDay)] });

  return generateDaysWithEntries(
    { count: count - 1, from: nextDay, dir, journalDays, entries, oldestEntryDay, newestEntryDay },
    days,
  );
}

const dayIsVisible = (
  day: dayjs.Dayjs,
  journalDays: Settings['journalDays'],
  entries: Record<EntryDoc['day'], EntryDoc>,
) => {
  // If there is an entry in the active filters, it is always visible
  if (entries[formatEntryDay(day)]) {
    return true;
  }

  // If the day is not enabled in the settings, it is not
  if (!journalDays[day.format('dd').toLowerCase() as JournalDay]?.enabled) {
    return false;
  }

  // Dates older than two weeks ago without an entry are not visible
  if (day.isBefore(TWO_WEEKS_AGO)) {
    return false;
  }

  return true;
};
