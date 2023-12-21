import type { dayjs } from '@supastack/utils-dates';
import { useCallback } from 'react';
import type { RxCollection } from 'rxdb';

import { TableName, useRxData } from './index.client.ts';
import type { Entry, EntryDoc } from './schemas.client.ts';

export const useDayEntry = (day: dayjs.Dayjs) => {
  const dayId = day.format('YYYY-MM-DD');

  const q = useCallback((c: RxCollection<Entry>) => c.findOne(dayId), [dayId]);

  const { result } = useRxData<Entry>(TableName.Entries, q);

  return result[0] as EntryDoc | undefined;
};
