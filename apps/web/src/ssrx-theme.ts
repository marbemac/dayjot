import { defineRenderPlugin } from '@ssrx/renderer';
import { cssObjToString, type GeneratedTheme, generateThemesForCookie, type ThemeCookieVal } from '@supastack/ui-theme';

export const PLUGIN_ID = 'supaTheme' as const;

export type SupaThemePluginCtx = {
  config: ThemeCookieVal | null;
  theme: GeneratedTheme;
  darkTheme?: GeneratedTheme;
};

export const supaThemePlugin = () => {
  return defineRenderPlugin({
    id: PLUGIN_ID,

    createCtx: ({ meta }): SupaThemePluginCtx => {
      if (import.meta.env.SSR) {
        const config: ThemeCookieVal = (meta?.['theme'] as ThemeCookieVal) ?? null;

        const { generatedTheme, generatedDarkTheme } = generateThemesForCookie(config);

        return {
          config,
          theme: generatedTheme,
          darkTheme: generatedDarkTheme,
        };
      }

      return {} as SupaThemePluginCtx;
    },

    hooks: {
      'ssr:emitToHead': ({ ctx }) => {
        if (import.meta.env.SSR) {
          const { theme, darkTheme } = ctx as SupaThemePluginCtx;
          const styles = cssObjToString({ ':root': theme.css });
          const darkStyles = darkTheme ? cssObjToString({ ':root': darkTheme?.css }) : '';

          return `<style id='${PLUGIN_ID}'>
          ${styles}

          ${
            darkStyles
              ? `@media (prefers-color-scheme: dark) {
            ${darkStyles}
          }`
              : ''
          }
        </style>`;
        }
      },
    },
  });
};
