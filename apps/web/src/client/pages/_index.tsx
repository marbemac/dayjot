import { Box } from '@supastack/ui-primitives';

import { ctx } from '~app';

export function Component() {
  ctx.useHead({ title: 'Home' });

  return <Box tw="p-20">Hello world!</Box>;
}
