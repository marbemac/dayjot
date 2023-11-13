import type { dayjs } from '@supastack/utils-dates';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { calendarStore } from '~/components/Calendar/state.ts';

type DailyScrollProps = {
  Entry: (props: { day: dayjs.ConfigType }) => React.ReactNode;
};

const INITIAL_FUTURE_COUNT = 10;
const INITIAL_PAST_COUNT = 30;
const INITIAL_INDEX = INITIAL_FUTURE_COUNT;
const COUNT_PER_PREPEND = 20;
const COUNT_PER_APPEND = 20;

const generateDaysWindow = (anchorDate: dayjs.Dayjs) => {
  return [
    ...generateDays({ count: INITIAL_FUTURE_COUNT, from: anchorDate, dir: 'future' }),
    anchorDate,
    ...generateDays({ count: INITIAL_PAST_COUNT, from: anchorDate, dir: 'past' }),
  ];
};

export const DailyScroller = ({ Entry }: DailyScrollProps) => {
  // const anchorDate = dayjs('2023-10-20');
  const anchorDate = calendarStore.use.active();

  const hasBeenRendered = useRef(false);
  const [anchorKey, setAnchorKey] = useState(anchorDate.format('YYYY-MM-DD'));
  const [days, setDays] = useState(generateDaysWindow(anchorDate));

  useEffect(() => {
    if (hasBeenRendered.current) {
      setAnchorKey(anchorDate.format('YYYY-MM-DD'));
      setDays(generateDaysWindow(anchorDate));
    }

    hasBeenRendered.current = true;
  }, [anchorDate]);

  // key forces a re-mount when the anchorDate changes, to reset the scroller
  return <Scroller key={anchorKey} Entry={Entry} initialDays={days} />;
};

const Scroller = ({ Entry, initialDays }: DailyScrollProps & { initialDays: dayjs.Dayjs[] }) => {
  const [days, setDays] = useState(() => initialDays);

  useEffect(() => {
    console.debug('[Scroller] mount');
  }, []);

  const [firstItemIndex, setFirstItemIndex] = useState(999999);

  const prependDays = useCallback(() => {
    const nextFirstItemIndex = firstItemIndex - COUNT_PER_PREPEND;
    // console.debug('[Scroller] start reached, prepend days', { nextFirstItemIndex, from: days[0]! });

    setFirstItemIndex(() => nextFirstItemIndex);
    setDays(() => [...generateDays({ count: COUNT_PER_PREPEND, from: days[0]!, dir: 'future' }), ...days]);

    return false;
  }, [firstItemIndex, days]);

  const appendDays = useCallback(() => {
    setTimeout(() => {
      setDays(() => [...days, ...generateDays({ count: COUNT_PER_APPEND, from: days[days.length - 1]!, dir: 'past' })]);
    }, 100);

    return false;
  }, [days]);

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

function generateDays(
  { count, from, dir }: { count: number; from: dayjs.Dayjs; dir: 'past' | 'future' },
  days: dayjs.Dayjs[] = [],
) {
  if (count === 0) return dir === 'future' ? days.reverse() : days;

  const nextDay = dir === 'past' ? from.subtract(1, 'day') : from.add(1, 'day');
  days.push(nextDay);

  return generateDays({ count: count - 1, from: nextDay, dir }, days);
}
