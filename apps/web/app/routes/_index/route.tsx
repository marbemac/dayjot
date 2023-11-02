import { Box } from '@supastack/ui-primitives';

import type { MetaFunction } from '~/remix-types.ts';

export const meta: MetaFunction = () => {
  return [{ title: 'Home' }];
};

export default function Home() {
  return <Box tw="p-20">Hello world!</Box>;
}
