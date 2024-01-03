import { SelectContent, SelectGroup, SelectItem } from '@supastack/ui-primitives/select';
import { SettingsRow } from '@supastack/ui-primitives/settings';
import type { PrebuiltThemeIds } from '@supastack/ui-theme';
import { PREBUILT_THEMES } from '@supastack/ui-theme';
import { useCallback } from 'react';

import { useSettingValue, useUpsertSetting } from '~/local-db/index.client.ts';

export const ThemeSettingsForm = () => {
  const currentTheme = useSettingValue('theme', true);

  const upsertSetting = useUpsertSetting();
  const handleThemeChange = useCallback(
    async (nextTheme: PrebuiltThemeIds) => {
      try {
        await upsertSetting('theme', { ...currentTheme, baseThemeId: nextTheme });
      } catch (err) {
        // @TODO handle error, toast?
        console.error('Error setting theme', err);
      }
    },
    [upsertSetting, currentTheme],
  );

  return (
    <SettingsRow
      type="select"
      label="Colors"
      hint="Set your color scheme."
      value={currentTheme.baseThemeId}
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
