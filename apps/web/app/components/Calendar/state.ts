import { dayjs } from '@supastack/utils-dates';
import { createStore } from 'zustand-x';

type CalendarStore = {
  now: dayjs.Dayjs;
  active: dayjs.Dayjs;
};

export const calendarStore = createStore('calendar')<CalendarStore>({
  now: dayjs(),
  active: dayjs(),
})
  .extendActions((set, get) => ({
    activeDate: (date: dayjs.ConfigType) => {
      const t = dayjs(date);
      set.active(t);
      set.now(t);
    },

    nextMonth: () => {
      const next = get.now().add(1, 'month');
      set.now(next);
    },

    prevMonth: () => {
      const prev = get.now().subtract(1, 'month');
      set.now(prev);
    },
  }))
  .extendActions(set => ({
    today: () => {
      set.activeDate(dayjs());
    },
  }));
