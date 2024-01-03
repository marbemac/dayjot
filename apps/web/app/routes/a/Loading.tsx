import { observer } from '@legendapp/state/react';
import { Box } from '@supastack/ui-primitives';

import { localDbStore$ } from '~/local-db/store.ts';

export const Loading = observer(() => {
  const localDbInitialized = localDbStore$.isReady.get();

  return <Box tw={['fixed inset-0 bg-canvas', localDbInitialized && 'hidden']}>Loading...</Box>;
});
