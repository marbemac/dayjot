'use client';

import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@supastack/ui-primitives/dropdown-menu';
import { useGlobalTheme } from '@supastack/ui-primitives/themed';
import { PREBUILT_THEMES } from '@supastack/ui-theme';
import { useCallback, useState } from 'react';
import { useRevalidator } from 'react-router-dom';

import { ctx } from '~app';

type UserDropdownMenuProps = {
  trigger: React.ReactNode;
};

export const UserDropdownMenu = ({ trigger }: UserDropdownMenuProps) => {
  const currentTheme = useGlobalTheme();
  const [currentThemeId, setCurrentThemeId] = useState(currentTheme?.baseThemeId || 'system');

  const revalidator = useRevalidator();
  const logout = ctx.trpc.auth.logout.useMutation({
    onSuccess: () => {
      /**
       * Special case.. when logging in/out we need to trigger
       * any loader redirects, etc. Normally we don't need to use router revalidate, and can just leverage the
       * tanstack query cache.
       */
      revalidator.revalidate();

      // invalidate the entire query cache on login/logout
      return ctx.trpc.$invalidate();
    },
  });

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent side="bottom">
        <DropdownMenuGroup label="My Account">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              <ThemePickerMenu currentThemeId={currentThemeId} setCurrentThemeId={setCurrentThemeId} />
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => logout.mutate()}>Logout</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};

export const ThemePickerMenu = ({
  currentThemeId,
  setCurrentThemeId,
}: {
  currentThemeId: string;
  setCurrentThemeId: (id: string) => void;
}) => {
  const update = ctx.trpc.theme.update.useMutation();
  const reset = ctx.trpc.theme.reset.useMutation();

  const lightThemeElems: React.ReactNode[] = [];
  const darkThemeElems: React.ReactNode[] = [];
  for (const id in PREBUILT_THEMES) {
    const t = PREBUILT_THEMES[id as keyof typeof PREBUILT_THEMES];
    if (!t) continue;

    const target = t.isDark ? darkThemeElems : lightThemeElems;
    target.push(
      <DropdownMenuRadioItem key={id} value={id}>
        {t.name}
      </DropdownMenuRadioItem>,
    );
  }

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
    <DropdownMenuRadioGroup value={currentThemeId} onValueChange={handleThemeChange}>
      <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>

      <DropdownMenuSeparator />

      <DropdownMenuLabel>Light</DropdownMenuLabel>

      {lightThemeElems}

      <DropdownMenuSeparator />

      <DropdownMenuLabel>Dark</DropdownMenuLabel>

      {darkThemeElems}
    </DropdownMenuRadioGroup>
  );
};
