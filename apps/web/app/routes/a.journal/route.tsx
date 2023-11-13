import type { ServerRuntimeMetaFunction } from '@remix-run/server-runtime';

import { DailyEntry } from './DailyEntry.tsx';
import { DailyScroller } from './DailyScroller.tsx';

export const meta: ServerRuntimeMetaFunction = () => {
  return [{ title: 'Journal' }];
};

export default function Journal() {
  return <DailyScroller Entry={DailyEntry} />;
}
