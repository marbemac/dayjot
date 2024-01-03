import type { JournalDay, JournalDayConfig } from '@libs/settings';
import { Box, Button, VStack } from '@supastack/ui-primitives';
import { SelectContent, SelectGroup, SelectItem, SelectRoot, SelectTrigger } from '@supastack/ui-primitives/select';
import { useCallback } from 'react';

import { useSettingValue, useUpsertSetting } from '~/local-db/index.client.ts';

const days: { displayName: string; name: JournalDay }[] = [
  { displayName: 'Monday', name: 'mo' },
  { displayName: 'Tuesday', name: 'tu' },
  { displayName: 'Wednesday', name: 'we' },
  { displayName: 'Thursday', name: 'th' },
  { displayName: 'Friday', name: 'fr' },
  { displayName: 'Saturday', name: 'sa' },
  { displayName: 'Sunday', name: 'su' },
];

export function JournalSettingsForm() {
  return <DaysConfig />;
}

type DayConfigHandleChangeFn = (day: JournalDay, config: Partial<JournalDayConfig>) => Promise<void>;

const DaysConfig = () => {
  const currentConfig = useSettingValue('journalDays', true);

  const upsertSetting = useUpsertSetting();
  const handleChange = useCallback<DayConfigHandleChangeFn>(
    async (day, config) => {
      try {
        await upsertSetting('journalDays', { ...currentConfig, [day]: { ...currentConfig[day], ...config } });
      } catch (err) {
        // @TODO handle error, toast?
        console.error('Error setting journalDays', err);
      }
    },
    [upsertSetting, currentConfig],
  );

  return (
    <VStack divider>
      <Box tw="flex justify-end py-3">
        {/* @TODO tooltips */}
        <Box tw="font-semibold">Email Reminder</Box>
        <Box tw="w-24 text-right font-semibold">Enabled</Box>
      </Box>

      {days.map(day => (
        <DayConfig key={day.name} handleChange={handleChange} config={currentConfig[day.name]} {...day} />
      ))}
    </VStack>
  );
};

const DayConfig = ({
  displayName,
  name,
  config,
  handleChange,
}: {
  displayName: string;
  name: JournalDay;
  config: JournalDayConfig;
  handleChange: DayConfigHandleChangeFn;
}) => {
  return (
    <Box tw="flex items-center py-2">
      <Box tw="flex-1 font-medium">{displayName}</Box>

      <Box>
        <SelectRoot
          size="sm"
          value={config.emailTime}
          onValueChange={value => handleChange(name, { emailTime: value })}
        >
          <SelectTrigger variant="outline" />
          <ReminderTimeSelectContent />
        </SelectRoot>
      </Box>

      <Box tw="w-24 text-right">
        <Button size="sm" variant="outline" onClick={() => handleChange(name, { enabled: !config.enabled })}>
          {config.enabled ? 'Yes' : 'No'}
        </Button>
      </Box>
    </Box>
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
