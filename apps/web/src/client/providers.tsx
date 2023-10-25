import { AuthProvider } from './auth.tsx';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};
