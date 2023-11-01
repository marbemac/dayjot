import { defineRenderPlugin } from '@ssrx/renderer';
import { GlobalThemeContext } from '@supastack/ui-primitives/themed';
import { cssObjToString, type GeneratedTheme, generateThemesForCookie, type ThemeConfig } from '@supastack/ui-theme';

export const PLUGIN_ID = 'supaTheme' as const;

export type SupaThemePluginCtx = {
  config: ThemeConfig | null;
  theme: GeneratedTheme;
  darkTheme?: GeneratedTheme;
};

declare global {
  interface Window {
    $SUPATHEME: ThemeConfig | null;
  }
}

export const supaThemePlugin = () => {
  return defineRenderPlugin({
    id: PLUGIN_ID,

    createCtx: ({ meta }): SupaThemePluginCtx => {
      if (import.meta.env.SSR) {
        const config: ThemeConfig = (meta?.['theme'] as ThemeConfig) ?? null;

        const { generatedTheme, generatedDarkTheme } = generateThemesForCookie(config);

        return {
          config,
          theme: generatedTheme,
          darkTheme: generatedDarkTheme,
        };
      } else {
        return {
          config: window.$SUPATHEME,
        } as SupaThemePluginCtx;
      }
    },

    hooks: {
      'app:extendCtx': ({ ctx }) => {
        const { config } = ctx as SupaThemePluginCtx;

        return { theme: config, setGlobalThemeStyles };
      },

      'app:wrap':
        ({ ctx }) =>
        ({ children }) => {
          const { config } = ctx as SupaThemePluginCtx;

          return <GlobalThemeContext.Provider value={config}>{children()}</GlobalThemeContext.Provider>;
        },

      'ssr:emitToHead': ({ ctx }) => {
        if (import.meta.env.SSR) {
          const { theme, darkTheme } = ctx as SupaThemePluginCtx;

          return [
            `<style id='${PLUGIN_ID}'>${generateThemeStyles({ theme, darkTheme })}</style>`,
            `<script>$SUPATHEME = ${JSON.stringify(ctx.config)};</script>`,
          ].join('');
        }
      },
    },
  });
};

const setGlobalThemeStyles = ({ theme, darkTheme }: { theme: GeneratedTheme; darkTheme?: GeneratedTheme }) => {
  if (import.meta.env.SSR) {
    throw new Error('setGlobalThemeStyles can only be called on the client');
  }

  const t = document.getElementById(PLUGIN_ID);
  if (t) {
    t.innerHTML = generateThemeStyles({ theme, darkTheme });
  }
};

const generateThemeStyles = ({ theme, darkTheme }: { theme: GeneratedTheme; darkTheme?: GeneratedTheme }) => {
  const styles = cssObjToString({ ':root': theme.css });
  const darkStyles = darkTheme ? cssObjToString({ ':root': darkTheme?.css }) : '';

  return `${styles}

  ${
    darkStyles
      ? `@media (prefers-color-scheme: dark) {
    ${darkStyles}
  }`
      : ''
  }`;
};
