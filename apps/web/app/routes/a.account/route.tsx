import type { ServerRuntimeMetaFunction } from '@remix-run/server-runtime';

export const meta: ServerRuntimeMetaFunction = () => {
  return [{ title: 'Your Account' }];
};

export default function Journal() {
  return <div>Your Account</div>;
}
