import { tx } from '@supastack/ui-styles';
import { dayjs } from '@supastack/utils-dates';
import { useCallback, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

type DailyScrollProps = {
  Entry: (props: { day: dayjs.ConfigType }) => React.ReactNode;
};

export const DailyScroller = ({ Entry }: DailyScrollProps) => {
  const INITIAL_FUTURE_COUNT = 5;
  const INITIAL_PAST_COUNT = 30;
  const INITIAL_INDEX = INITIAL_FUTURE_COUNT;
  const COUNT_PER_PREPEND = 10;
  const COUNT_PER_APPEND = 20;

  const anchorDate = dayjs();

  const [days, setDays] = useState(() => [
    ...generateDays({ count: INITIAL_FUTURE_COUNT, from: anchorDate, dir: 'future' }),
    anchorDate,
    ...generateDays({ count: INITIAL_PAST_COUNT, from: anchorDate, dir: 'past' }),
  ]);

  const [firstItemIndex, setFirstItemIndex] = useState(999999);

  const prependDays = useCallback(() => {
    const nextFirstItemIndex = firstItemIndex - COUNT_PER_PREPEND;

    setTimeout(() => {
      setFirstItemIndex(() => nextFirstItemIndex);
      setDays(() => [...generateDays({ count: COUNT_PER_PREPEND, from: days[0]!, dir: 'future' }), ...days]);
    }, 100);

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
      firstItemIndex={firstItemIndex}
      initialTopMostItemIndex={INITIAL_INDEX}
      data={days}
      startReached={prependDays}
      endReached={appendDays}
      overscan={{ main: 500, reverse: 500 }}
      itemContent={(index, day) => <Entry day={day} />}
      className={tx('[&_[data-test-id="virtuoso-item-list"]]:divide-y')}
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
