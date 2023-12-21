import { Box, Button, Card, HStack, VStack } from '@supastack/ui-primitives';
import { tx } from '@supastack/ui-styles';
import { dayjs } from '@supastack/utils-dates';
import { Fragment, useMemo } from 'react';

import { calendarStore } from './state.ts';

export type RenderDayProps = {
  onClick: React.MouseEventHandler;
  className: string;
  children: React.ReactNode;
};

export type CalendarProps = {
  renderDay?: (date: dayjs.Dayjs, props: RenderDayProps) => React.ReactNode;
};

export const Calendar = (props: CalendarProps) => {
  return (
    <Card size="sm">
      <MonthHeading />
      <VStack spacing={2} divider>
        <WeekHeading />
        <Days {...props} />
      </VStack>
    </Card>
  );
};

const MonthHeading = () => {
  const now = calendarStore.use.now();
  const month = useMemo(() => now.format('MMMM'), [now]);
  const year = useMemo(() => (now.isSame(dayjs(), 'year') ? null : now.format('YYYY')), [now]);

  return (
    <Box tw="flex items-center pb-3">
      <HStack spacing={1} center="y" tw="flex-1">
        <Button
          size="sm"
          variant="ghost"
          startIcon="calendar-alt"
          aria-label="Go to today"
          onClick={() => calendarStore.set.today()}
        />
        <Box tw="font-medium">{[month, year].filter(Boolean).join(', ')}</Box>
      </HStack>

      <HStack spacing={1}>
        <Button
          size="sm"
          variant="ghost"
          startIcon="chevron-left"
          aria-label="Previous month"
          onClick={() => calendarStore.set.prevMonth()}
        />

        <Button
          size="sm"
          variant="ghost"
          startIcon="chevron-right"
          aria-label="Next month"
          onClick={() => calendarStore.set.nextMonth()}
        />
      </HStack>
    </Box>
  );
};

const GRID_GAP = 'gap-1.5' as const;

const WeekHeading = () => {
  const dayElems = [];
  const now = calendarStore.get.now();

  for (let i = 0; i < 7; i++) {
    dayElems.push(
      <Box key={i} tw="flex-1 text-center">
        {now.weekday(i).format('dd')}
      </Box>,
    );
  }

  return <Box tw={`flex ${GRID_GAP}`}>{dayElems}</Box>;
};

const Days = ({ renderDay }: Pick<CalendarProps, 'renderDay'>) => {
  const now = calendarStore.use.now();
  const active = calendarStore.use.active();
  const days = useMemo(() => getAllDays(now), [now]);
  const dayElems: React.ReactNode[] = [];

  let isActiveDay = false;
  days.forEach((d, index) => {
    isActiveDay = !isActiveDay && d.date.isSame(active, 'day');

    const dayProps = {
      onClick: () => calendarStore.set.activeDate(d.date),
      children: d.day,
      className: tx([
        `flex h-7 w-8 items-center justify-center rounded`,
        !d.isActiveMonth && 'opacity-45',
        !isActiveDay && 'cursor-pointer hover:bg-neutral-soft-2-a',
        isActiveDay && 'cursor-default bg-primary-1 text-on-primary',
      ]),
    };

    dayElems.push(
      renderDay ? <Fragment key={index}>{renderDay(d.date, dayProps)}</Fragment> : <div key={index} {...dayProps} />,
    );
  });

  return <Box tw={`grid grid-cols-7 place-items-center ${GRID_GAP}`}>{dayElems}</Box>;
};

const getAllDays = (now: dayjs.Dayjs) => {
  let currentDate = now.startOf('month').weekday(0);
  const nextMonth = now.add(1, 'month').month();

  const allDates = [];

  while (currentDate.weekday(0).toObject().months !== nextMonth) {
    allDates.push(formateDateObject(currentDate, now));
    currentDate = currentDate.add(1, 'day');
  }

  return allDates;
};

const formateDateObject = (date: dayjs.Dayjs, now: dayjs.Dayjs) => {
  const clonedObject = { ...date.toObject() };

  const formatedObject = {
    date,
    day: clonedObject.date,
    month: clonedObject.months,
    year: clonedObject.years,
    isActiveMonth: date.isSame(now, 'month'),
  };

  return formatedObject;
};
