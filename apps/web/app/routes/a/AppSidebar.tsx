import { Box, Button, HStack, VStack } from '@supastack/ui-primitives';
import type { dayjs } from '@supastack/utils-dates';

import { userStore$ } from '~/app-store.ts';
import type { RenderDayProps } from '~/components/Calendar/Calendar.tsx';
import { Calendar } from '~/components/Calendar/Calendar.tsx';
// import { Link } from '~/components/Link/link.tsx';
// import { UserDropdownMenu } from '~/components/UserDropdownMenu.tsx';
import { useDayEntry } from '~/local-db/hooks.client.ts';

import { UserDropdownMenu } from './UserDropdownMenu.tsx';
// import { useModalPath } from '~/modals/index.tsx';

/**
 * settings:
 *   theme
 *   timezone
 *   email settings
 *   subscription?
 * search
 * quick add to today
 * calendar
 * tags
 */

export const AppSidebar = () => {
  return (
    <VStack spacing={4}>
      <HStack>
        <UserDropdownMenu
          trigger={
            <Button startIcon="user-circle" endIcon="chevron-down" variant="outline">
              {userStore$.user.name.get() || 'Account'}
            </Button>
          }
        />
      </HStack>

      <Calendar renderDay={(date, props) => <CalendarDay date={date} {...props} />} />
    </VStack>
  );
};

const CalendarDay = ({ date, className, ...rest }: { date: dayjs.Dayjs } & RenderDayProps) => {
  const entry = useDayEntry(date);
  const hasContent = !!entry?.content;

  return <Box {...rest} tw={[className, hasContent && 'bg-neutral-soft-1-a']} />;
};
