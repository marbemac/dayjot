import { observer } from '@legendapp/state/react';
import { Box } from '@supastack/ui-primitives';

import { localDbStore$ } from '~/local-db/store.ts';

export const useLoadingState = () => {
  const localDbInitialized = localDbStore$.isReady.get();
  const settingsReady = localDbStore$.isSettingsLoaded.get();
  const isAppReady = localDbInitialized && settingsReady;

  return { localDbInitialized, settingsReady, isAppReady };
};

export const Loading = observer(() => {
  return <Box tw={['fixed inset-0 bg-canvas']}>Loading...</Box>;
});
