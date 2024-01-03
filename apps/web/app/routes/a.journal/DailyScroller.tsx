import { observer } from '@legendapp/state/react';
import type { JournalDay, Settings } from '@libs/settings';
import type { dayjs } from '@supastack/utils-dates';
import { safeStringify } from '@supastack/utils-json';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { calendarStore$ } from '~/components/Calendar/state.ts';
import { settingsStore$ } from '~/local-db/store.ts';

import { DailyEntry } from './DailyEntry.tsx';

const INITIAL_FUTURE_COUNT = 10;
const INITIAL_PAST_COUNT = 30;
const INITIAL_INDEX = INITIAL_FUTURE_COUNT;
const COUNT_PER_PREPEND = 20;
const COUNT_PER_APPEND = 20;

export default observer(function DailyScroller() {
  // const anchorDate = dayjs('2023-10-20');
  const anchorDate = calendarStore$.active.get();
  const journalDays = settingsStore$.settings.journalDays.get();

  const hasBeenRendered = useRef(false);
  const [days, setDays] = useState(generateDaysWindow(anchorDate, journalDays));
  const [remountKey, setRemountKey] = useState(computeRemountKey({ anchorDate, journalDays }));

  useEffect(() => {
    if (hasBeenRendered.current) {
      setRemountKey(computeRemountKey({ anchorDate, journalDays }));
      setDays(generateDaysWindow(anchorDate, journalDays));
    }

    hasBeenRendered.current = true;
  }, [anchorDate, journalDays]);

  // key forces a re-mount when the key props change, to reset+re-render the scroller
  return <Scroller key={remountKey} Entry={DailyEntry} initialDays={days} journalDays={journalDays} />;
});

const Scroller = ({
  Entry,
  initialDays,
  journalDays,
}: {
  Entry: (props: { day: dayjs.ConfigType }) => React.ReactNode;
  initialDays: dayjs.Dayjs[];
  journalDays: Settings['journalDays'];
}) => {
  const [days, setDays] = useState(() => initialDays);

  const [firstItemIndex, setFirstItemIndex] = useState(999999);

  const prependDays = useCallback(() => {
    const nextFirstItemIndex = firstItemIndex - COUNT_PER_PREPEND;
    // console.debug('[Scroller] start reached, prepend days', { nextFirstItemIndex, from: days[0]! });

    setFirstItemIndex(() => nextFirstItemIndex);
    setDays(() => [...generateDays({ count: COUNT_PER_PREPEND, from: days[0]!, dir: 'future', journalDays }), ...days]);

    return false;
  }, [firstItemIndex, days, journalDays]);

  const appendDays = useCallback(() => {
    setTimeout(() => {
      setDays(() => [
        ...days,
        ...generateDays({ count: COUNT_PER_APPEND, from: days[days.length - 1]!, dir: 'past', journalDays }),
      ]);
    }, 100);

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
      overscan={{ main: 500, reverse: 500 }}
      itemContent={(index, day) => <Entry day={day} />}
    />
  );
};

const generateDaysWindow = (anchorDate: dayjs.Dayjs, journalDays: Settings['journalDays']) => {
  return [
    ...generateDays({ count: INITIAL_FUTURE_COUNT, from: anchorDate, dir: 'future', journalDays }),
    anchorDate,
    ...generateDays({ count: INITIAL_PAST_COUNT, from: anchorDate, dir: 'past', journalDays }),
  ];
};

const computeRemountKey = ({
  anchorDate,
  journalDays,
}: {
  anchorDate: dayjs.Dayjs;
  journalDays: Settings['journalDays'];
}) => safeStringify({ anchorKey: anchorDate.format('YYYY-MM-DD'), journalDays });

function generateDays(
  {
    count,
    from,
    dir,
    journalDays,
  }: { count: number; from: dayjs.Dayjs; dir: 'past' | 'future'; journalDays: Settings['journalDays'] },
  days: dayjs.Dayjs[] = [],
) {
  if (count === 0) return dir === 'future' ? days.reverse() : days;

  const nextDay = dir === 'past' ? from.subtract(1, 'day') : from.add(1, 'day');
  if (!dayIsVisible(nextDay, journalDays)) {
    return generateDays({ count, from: nextDay, dir, journalDays }, days);
  }

  days.push(nextDay);

  return generateDays({ count: count - 1, from: nextDay, dir, journalDays }, days);
}

const dayIsVisible = (day: dayjs.Dayjs, journalDays: Settings['journalDays']) => {
  if (!journalDays[day.format('dd').toLowerCase() as JournalDay]?.enabled) {
    return false;
  }

  return true;
};
