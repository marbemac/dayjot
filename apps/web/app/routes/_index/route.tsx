import { Box } from '@supastack/ui-primitives';

import { SiteNav } from '~/components/SiteNav.tsx';
import type { MetaFunction } from '~/remix-types.ts';

export const meta: MetaFunction = () => {
  return [{ title: 'Home' }];
};

export default function Home() {
  return (
    <>
      <SiteNav />
      <Box tw="p-20">Hello world!</Box>
    </>
  );
}
