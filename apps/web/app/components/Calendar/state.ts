import { observable, opaqueObject } from '@legendapp/state';
import { dayjs } from '@supastack/utils-dates';

export const calendarStore$ = observable({
  now: opaqueObject(dayjs()),
  active: opaqueObject(dayjs()),
  activeSetAt: Date.now(),

  setActiveDate: (date: dayjs.ConfigType) => {
    const t = dayjs(date);
    calendarStore$.assign({ now: opaqueObject(t), active: opaqueObject(t), activeSetAt: Date.now() });
  },

  goToNextMonth: () => {
    const next = calendarStore$.now.get().add(1, 'month');
    calendarStore$.now.set(opaqueObject(next));
  },

  goToPrevMonth: () => {
    const prev = calendarStore$.now.get().subtract(1, 'month');
    calendarStore$.now.set(opaqueObject(prev));
  },

  goToToday: () => {
    calendarStore$.setActiveDate(dayjs());
  },
});
