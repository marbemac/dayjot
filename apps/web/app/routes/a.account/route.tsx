import type { ServerRuntimeMetaFunction } from '@remix-run/server-runtime';
import { Box, Heading, VStack } from '@supastack/ui-primitives';

import { AccountSettingsForm } from '~/forms/AccountSettings.tsx';

export const meta: ServerRuntimeMetaFunction = () => {
  return [{ title: 'Settings' }];
};

export default function Settings() {
  return (
    <VStack tw="mx-auto max-w-3xl px-10 py-16" spacing={10}>
      <Heading as="h1" size={7}>
        Account Settings
      </Heading>

      <AccountSettingsForm />
    </VStack>
  );
}
