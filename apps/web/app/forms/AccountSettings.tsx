import { SelectContent, SelectGroup, SelectItem } from '@supastack/ui-primitives/select';
import { SettingsRow, SettingsSection, SettingsSections } from '@supastack/ui-primitives/settings';
import { useGlobalTheme } from '@supastack/ui-primitives/themed';
import { PREBUILT_THEMES } from '@supastack/ui-theme';
import { dayjs } from '@supastack/utils-dates';
import { useCallback, useState } from 'react';

import { ctx } from '~/app.ts';
import { useUser } from '~/auth.tsx';

export function AccountSettingsForm() {
  return (
    <SettingsSections>
      <SettingsSection title="Theme">
        <ThemeSetting />
      </SettingsSection>

      <SettingsSection title="Emails">
        <TimezoneSetting />
        <ReminderSetting />
      </SettingsSection>
    </SettingsSections>
  );
}

/**
 * Timezone
 */

const TimezoneSetting = () => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <SettingsRow
      type="select"
      label="Timezone"
      hint="Set your timezone to ensure your reminder emails are sent at the correct time."
      value={user.timeZone}
      onValueChange={val => {
        alert(`Set ${val}`);
      }}
      renderSelectContent={TimezoneSelectContent}
    />
  );
};

const TimezoneSelectContent = () => {
  // Sorted by UTC offset ascending
  const zones = [
    'Pacific/Midway',
    'US/Aleutian',
    'Pacific/Honolulu',
    'US/Alaska',
    'US/Pacific',
    'US/Mountain',
    'US/Central',
    'US/Eastern',
    'Brazil/East',
    'Atlantic/Cape_Verde',
    'Iceland',
    'Europe/London',
    'Europe/Madrid',
    'Europe/Athens',
    'Europe/Moscow',
    'Asia/Tehran',
    'Asia/Kabul',
    'Asia/Calcutta',
    'Indian/Chagos',
    'Asia/Bangkok',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Pacific/Guam',
    'Australia/Melbourne',
    'Pacific/Fiji',
    'Pacific/Auckland',
    'Pacific/Apia',
  ];

  const zoneData: { name: string; value: string }[] = [];
  for (const zone of zones) {
    zoneData.push({
      name: `${zone} (${dayjs().tz(zone).format('h:mma')})`,
      value: zone,
    });
  }

  const zoneElems: React.ReactNode[] = [];
  for (const zone of zoneData) {
    zoneElems.push(
      <SelectItem key={zone.value} value={zone.value}>
        {zone.name}
      </SelectItem>,
    );
  }

  return (
    <SelectContent>
      <SelectGroup>{zoneElems}</SelectGroup>
    </SelectContent>
  );
};

/**
 * Reminder emails time
 */

const ReminderSetting = () => {
  const { user } = useUser();

  if (!user) return null;

  const { emailTimes } = user;

  const updateReminderEmails = (day: string, time: string) => {
    // setReminderEmails({ ...reminderEmails, [day]: time });
    alert(`Set ${day} to ${time}`);
  };

  const days: { name: string; value: keyof typeof emailTimes }[] = [
    { name: 'Monday', value: 'mo' },
    { name: 'Tuesday', value: 'tu' },
    { name: 'Wednesday', value: 'we' },
    { name: 'Thursday', value: 'th' },
    { name: 'Friday', value: 'fr' },
    { name: 'Saturday', value: 'sa' },
    { name: 'Sunday', value: 'su' },
  ];

  return (
    <SettingsRow
      type="list"
      label="Journaling Emails"
      hint="Configure when you'd like to receive your reminder emails. Reply to them to add entries to your journal."
      icon={['fal', 'envelopes-bulk']}
      noAction
      items={days.map(day => ({
        type: 'select',
        children: day.name,
        value: emailTimes[day.value],
        onValueChange: val => updateReminderEmails(day.value, val),
        renderSelectContent: ReminderTimeSelectContent,
      }))}
    />
  );
};

const ReminderTimeSelectContent = () => (
  <SelectContent>
    <SelectGroup>
      <SelectItem value="none">{`Don't remind me`}</SelectItem>
    </SelectGroup>

    <SelectGroup>
      <SelectItem value="4">4am</SelectItem>
      <SelectItem value="5">5am</SelectItem>
      <SelectItem value="6">6am</SelectItem>
      <SelectItem value="7">7am</SelectItem>
      <SelectItem value="8">8am</SelectItem>
      <SelectItem value="9">9am</SelectItem>
      <SelectItem value="10">10am</SelectItem>
      <SelectItem value="11">11am</SelectItem>
      <SelectItem value="12">12pm</SelectItem>
      <SelectItem value="13">1pm</SelectItem>
      <SelectItem value="14">2pm</SelectItem>
      <SelectItem value="15">3pm</SelectItem>
      <SelectItem value="16">4pm</SelectItem>
      <SelectItem value="17">5pm</SelectItem>
      <SelectItem value="18">6pm</SelectItem>
      <SelectItem value="19">7pm</SelectItem>
      <SelectItem value="20">8pm</SelectItem>
      <SelectItem value="21">9pm</SelectItem>
      <SelectItem value="22">10pm</SelectItem>
    </SelectGroup>
  </SelectContent>
);

/**
 * Theme
 */

const ThemeSetting = () => {
  const currentTheme = useGlobalTheme();
  const [currentThemeId, setCurrentThemeId] = useState(currentTheme?.baseThemeId ?? 'system');

  const update = ctx.trpc.theme.update.useMutation();
  const reset = ctx.trpc.theme.reset.useMutation();

  const handleThemeChange = useCallback(
    async (nextTheme: string) => {
      try {
        let res;

        if (nextTheme === 'system') {
          res = await reset.mutateAsync();
        } else {
          res = await update.mutateAsync({ baseThemeId: nextTheme });
        }

        ctx.setGlobalThemeStyles(res);
        setCurrentThemeId(nextTheme);
      } catch (err) {
        // @TODO handle error, toast?
        console.error('Error setting theme', err);
      }
    },
    [reset, update, setCurrentThemeId],
  );

  return (
    <SettingsRow
      type="select"
      label="Colors"
      hint="Set your color scheme."
      value={currentThemeId}
      onValueChange={handleThemeChange}
      renderSelectContent={ThemeSelectContent}
    />
  );
};

const ThemeSelectContent = () => {
  const lightThemeElems: React.ReactNode[] = [];
  const darkThemeElems: React.ReactNode[] = [];
  for (const id in PREBUILT_THEMES) {
    const t = PREBUILT_THEMES[id as keyof typeof PREBUILT_THEMES];
    if (!t) continue;

    const target = t.isDark ? darkThemeElems : lightThemeElems;
    target.push(
      <SelectItem key={id} value={id}>
        {t.name}
      </SelectItem>,
    );
  }

  return (
    <SelectContent>
      <SelectGroup>
        <SelectItem value="system">System</SelectItem>
      </SelectGroup>

      <SelectGroup label="Light">{lightThemeElems}</SelectGroup>

      <SelectGroup label="Dark">{darkThemeElems}</SelectGroup>
    </SelectContent>
  );
};
