import type { IconProps } from '@supastack/ui-primitives';
import { Box, Button, ButtonGroup, Card, HStack, Icon, VStack } from '@supastack/ui-primitives';
import type { dayjs } from '@supastack/utils-dates';
import { $path } from 'remix-routes';

import type { RenderDayProps } from '~/components/Calendar/Calendar.tsx';
import { Calendar } from '~/components/Calendar/Calendar.tsx';
import { Link } from '~/components/Link/link.tsx';
import { NavLink } from '~/components/Link/nav-link.tsx';
import { UserDropdownMenu } from '~/components/UserDropdownMenu.tsx';
import { useDayEntry } from '~/local-db/hooks.client.ts';
import { useModalPath } from '~/modals/index.tsx';

/**
 * settings:
 *   theme
 *   timezone
 *   email settings
 *   subscription?
 * search
 * quick add to entry
 * calendar
 * tags
 */

export const AppSidebar = () => {
  return (
    <VStack spacing={4}>
      <Card size="sm">
        <VStack spacing={1}>
          <SidebarLink to={$path('/a/journal')} icon="books" label="Journal" />
          <SidebarLink to={$path('/a/account')} icon="cog" label="Settings" />
        </VStack>
      </Card>

      {/* <ButtonGroup spacing={3} variant="outline">
        <Button startIcon="pencil-alt" fullWidth tw="justify-start">
          Quick add
        </Button>

        <SettingsButton />
      </ButtonGroup> */}

      <Calendar renderDay={(date, props) => <CalendarDay date={date} {...props} />} />
    </VStack>
  );
};

const SettingsButton = () => {
  // return <Button as={Link} to={useModalPath('settings')} startIcon="cog" aria-label="Settings" />;

  return <UserDropdownMenu trigger={<Button startIcon="cog" aria-label="Settings" />} />;
};

const CalendarDay = ({ date, className, ...rest }: { date: dayjs.Dayjs } & RenderDayProps) => {
  const entry = useDayEntry(date);
  const hasContent = !!entry?.content;

  return <Box {...rest} tw={[className, hasContent && 'bg-neutral-soft-1-a']} />;
};

const SidebarLink = ({ icon, label, to }: { icon: IconProps['icon']; label: string; to: string }) => {
  return (
    <HStack
      as={NavLink}
      to={to}
      center="y"
      spacing={1.5}
      tw="rounded-sm px-2 py-1.5 ui-active:cursor-default ui-active:bg-neutral-soft-3-a ui-inactive:hover:bg-neutral-soft-2-a"
    >
      <Icon icon={icon} fw />
      <Box tw="font-medium">{label}</Box>
    </HStack>
  );
};
