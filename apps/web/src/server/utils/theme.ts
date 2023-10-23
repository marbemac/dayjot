import type { ThemeConfig } from '@supastack/ui-theme';
import { dayjs } from '@supastack/utils-dates';

import type { ReqCtx } from '~server/types.ts';

const THEME_COOKIE = 'theme';

export const getReqTheme = ({ getCookie }: { getCookie: ReqCtx['getCookie'] }) => {
  const stored = getCookie(THEME_COOKIE);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as ThemeConfig;
  } catch (e) {
    console.warn('Error parsing theme cookie', stored, e);
  }

  return null;
};

export const setReqTheme = ({
  theme,
  setCookie,
  deleteCookie,
}: {
  theme: ThemeConfig | null;
  setCookie: ReqCtx['setCookie'];
  deleteCookie: ReqCtx['deleteCookie'];
}) => {
  if (theme) {
    setCookie(THEME_COOKIE, JSON.stringify(theme), { path: '/', expires: dayjs().add(1, 'year').toDate() });
  } else {
    deleteCookie(THEME_COOKIE, { path: '/' });
  }
};
