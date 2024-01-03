import type { ThemeConfig } from '@supastack/ui-theme';
import { generateThemesForCookie, themeConfigSchema } from '@supastack/ui-theme';
import { parse } from 'valibot';

import { publicProcedure, router } from '../trpc.ts';
import { setReqTheme } from '../utils/theme.ts';

export const themeRouter = router({
  /**
   * Queries
   */

  // --

  /**
   * Mutations
   */

  update: publicProcedure
    .input(i => parse(themeConfigSchema, i))
    .mutation(async ({ input, ctx }) => {
      const config = input as ThemeConfig;

      if (ctx.user) {
        // @TODO persist user's theme choice in db, use that to set initial cookie if not set (new browser, etc)
      }

      setReqTheme({ theme: config, setCookie: ctx.setCookie, deleteCookie: ctx.deleteCookie });

      const { generatedTheme, generatedDarkTheme } = generateThemesForCookie(config);

      return { theme: generatedTheme, darkTheme: generatedDarkTheme };
    }),

  /**
   * Resets back to "system" (none) choice
   */
  reset: publicProcedure.mutation(async ({ input, ctx }) => {
    console.log('reset', input);

    if (ctx.user) {
      // @TODO persist user's theme choice in db, use that to set initial cookie if not set (new browser, etc)
    }

    setReqTheme({ theme: null, setCookie: ctx.setCookie, deleteCookie: ctx.deleteCookie });

    const { generatedTheme, generatedDarkTheme } = generateThemesForCookie(null);

    return { theme: generatedTheme, darkTheme: generatedDarkTheme };
  }),
});
