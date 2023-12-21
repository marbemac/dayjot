import { useSearchParams } from '@remix-run/react';
import { VStack } from '@supastack/ui-primitives';
import type { DialogProps } from '@supastack/ui-primitives/dialog';
import { Dialog, DialogContent, DialogTitle } from '@supastack/ui-primitives/dialog';
import { useCallback } from 'react';

import { AccountSettingsForm } from '~/forms/AccountSettings.tsx';

export type ModalId = 'settings';

export const useModalPath = (modalId: ModalId) => {
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
      <AccountSettingsModal open={modal === 'settings'} onOpenChange={handleClose} />
    </>
  );
};

const AccountSettingsModal = ({ open, onOpenChange }: Pick<DialogProps, 'open' | 'onOpenChange'>) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent tw="w-full">
        <VStack divider spacing={5}>
          <DialogTitle>Account Settings</DialogTitle>

          <AccountSettingsForm />
        </VStack>
      </DialogContent>
    </Dialog>
  );
};
