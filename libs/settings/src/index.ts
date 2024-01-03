import type { ThemeConfig } from '@supastack/ui-theme';
import { dayjs } from '@supastack/utils-dates';

export type SettingName = keyof Settings;

export type JournalDay = 'su' | 'mo' | 'tu' | 'we' | 'th' | 'fr' | 'sa';

/**
 * NOTE: cannot making breaking changes to this shape without appropriate migration logic (for local and remote DBs).
 */
export type Settings = {
  theme: Readonly<ThemeConfig>;
  timeZone: { name: string; offset: number };
  journalDays: Record<JournalDay, JournalDayConfig>;
  memories: {
    includeInEmails: boolean;
  };
};

export type JournalDayConfig = {
  /** Does the user want to journal on this day in general? */
  enabled: boolean;

  /**
   * When to send the journal email for this day, if at all.
   *
   * 1-24 as a string (e.g. '1', '2', etc), or 'none'
   */
  emailTime: string;
};

const defaultTheme = Object.freeze({ baseThemeId: 'default_dark' });

const defaultJournalDays = Object.freeze({
  su: { enabled: true, emailTime: '7' },
  mo: { enabled: false, emailTime: '7' },
  tu: { enabled: false, emailTime: '7' },
  we: { enabled: true, emailTime: '7' },
  th: { enabled: false, emailTime: '7' },
  fr: { enabled: true, emailTime: '7' },
  sa: { enabled: false, emailTime: '7' },
});

const defaultMemories = Object.freeze({ includeInEmails: true });

export const settingDefault = <S extends SettingName>(name: S): Settings[S] => {
  switch (name) {
    case 'theme':
      return defaultTheme as Settings[S];
    case 'timeZone':
      return { name: dayjs.tz.guess(), offset: parseInt(dayjs().tz(dayjs.tz.guess()).format('ZZ')) } as Settings[S];
    case 'journalDays':
      return defaultJournalDays as Settings[S];
    case 'memories':
      return defaultMemories as Settings[S];
    default:
      throw new Error('Invalid setting name');
  }
};
