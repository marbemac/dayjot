import { observer } from '@legendapp/state/react';

import { useSubscribeSettings } from './index.client.ts';

export const SettingsSync = observer(() => {
  useSubscribeSettings();

  return null;
});
