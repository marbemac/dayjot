import { observable } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { focusManager, onlineManager } from '@tanstack/react-query';

import type { RouterOutputs } from './types.ts';

export const appStore$ = observable({
  isOnline: onlineManager.isOnline(),
  isVisible: focusManager.isFocused(),
});

export const userStore$ = observable({
  version: 1,
  isLoggedIn: false,
  checkedAt: 0,
  user: null as RouterOutputs['auth']['me'] | null,
});

persistObservable(userStore$, {
  pluginLocal: ObservablePersistLocalStorage,
  local: {
    name: 'dayjot-user-store',
  },
});
