import { useSearchParams } from '@remix-run/react';
import { VStack } from '@supastack/ui-primitives';
import type { DialogProps } from '@supastack/ui-primitives/dialog';
import { Dialog, DialogContent, DialogTitle } from '@supastack/ui-primitives/dialog';
import { useCallback } from 'react';

import { appStore } from '~/app-store.ts';
import { EmailAuthForm } from '~/forms/EmailAuth.tsx';
import { JournalSettingsForm } from '~/forms/JournalSettings.tsx';
import { ThemeSettingsForm } from '~/forms/ThemeSettings.tsx';
import { TimezoneSettingsForm } from '~/forms/TimezoneSettings.tsx';

export type ModalId = 'settings_journal' | 'settings_theme' | 'settings_timezone' | 'auth';

export const modalPath = (modalId: ModalId) => {
  // can get more sophisticated as needed.. e.g. preserving other search params, etc.
  return `?modal=${modalId}`;
};

export const Modals = () => {
  const [params, setParams] = useSearchParams();

  const modal = params.get('modal') as ModalId | null;

  const handleClose = useCallback(() => {
    // not preserving other search params atm.. might need to in the future
    setParams({});
  }, [setParams]);

  return (
    <>
      <JournalSettingsModal open={modal === 'settings_journal'} onOpenChange={handleClose} />
      <ThemeSettingsModal open={modal === 'settings_theme'} onOpenChange={handleClose} />
      <TimezoneModal open={modal === 'settings_timezone'} onOpenChange={handleClose} />
      <AuthModal open={modal === 'auth'} onOpenChange={handleClose} />
    </>
  );
};

const JournalSettingsModal = ({ open, onOpenChange }: Pick<DialogProps, 'open' | 'onOpenChange'>) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent tw="w-full">
        <VStack divider spacing={5}>
          <DialogTitle>Journal Settings</DialogTitle>

          <JournalSettingsForm />
        </VStack>
      </DialogContent>
    </Dialog>
  );
};

const ThemeSettingsModal = ({ open, onOpenChange }: Pick<DialogProps, 'open' | 'onOpenChange'>) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent tw="w-full">
        <VStack divider spacing={5}>
          <DialogTitle>Theme Settings</DialogTitle>

          <ThemeSettingsForm />
        </VStack>
      </DialogContent>
    </Dialog>
  );
};

const TimezoneModal = ({ open, onOpenChange }: Pick<DialogProps, 'open' | 'onOpenChange'>) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent tw="w-full">
        <VStack divider spacing={5}>
          <TimezoneSettingsForm />
        </VStack>
      </DialogContent>
    </Dialog>
  );
};

const AuthModal = ({ open, onOpenChange }: Pick<DialogProps, 'open' | 'onOpenChange'>) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <VStack divider spacing={5}>
          <DialogTitle>Login or Signup</DialogTitle>

          <EmailAuthForm onLoggedIn={() => onOpenChange?.(false)} />
        </VStack>
      </DialogContent>
    </Dialog>
  );
};
