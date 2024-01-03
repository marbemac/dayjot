import type { Settings } from '@libs/settings';
import { SelectContent, SelectGroup, SelectItem } from '@supastack/ui-primitives/select';
import { SettingsRow } from '@supastack/ui-primitives/settings';
import { dayjs, majorTimezones } from '@supastack/utils-dates';
import { useCallback } from 'react';

import { useSettingValue, useUpsertSetting } from '~/local-db/index.client.ts';

export const TimezoneSettingsForm = () => {
  const currentConfig = useSettingValue('timeZone', true);

  return currentConfig ? <TimezoneSetting currentConfig={currentConfig} /> : null;
};

export const TimezoneSetting = ({ currentConfig }: { currentConfig: Settings['timeZone'] }) => {
  const upsertSetting = useUpsertSetting();
  const handleChange = useCallback(
    async (offset: string) => {
      try {
        await upsertSetting('timeZone', {
          ...currentConfig,
          name: majorTimezones[offset as keyof typeof majorTimezones],
          offset: parseInt(offset),
        });
      } catch (err) {
        // @TODO handle error, toast?
        console.error('Error setting timezone', err);
      }
    },
    [upsertSetting, currentConfig],
  );

  return (
    <SettingsRow
      type="select"
      label="Timezone"
      hint="Set your timezone to ensure your reminder emails are sent at the correct time."
      value={String(currentConfig.offset)}
      onValueChange={handleChange}
      renderSelectContent={TimezoneSelectContent}
    />
  );
};

const TimezoneSelectContent = () => {
  const zoneData: { name: string; value: string }[] = [];
  for (const [offset, zone] of Object.entries(majorTimezones)) {
    zoneData.push({
      name: `${zone} (${dayjs().tz(zone).format('h:mma')})`,
      value: offset,
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
