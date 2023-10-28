import { Provider } from 'jotai';

import { AuthProvider } from './auth.tsx';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
};
