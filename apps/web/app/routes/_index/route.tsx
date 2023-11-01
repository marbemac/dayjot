import { Box } from '@supastack/ui-primitives';

// import { ctx } from '~/app.ts';
// import { enforceSignedOut } from '~/auth.tsx';

// export async function loader() {
//   await enforceSignedOut();

//   return null;
// }

export default function Home() {
  // ctx.useHead({ title: 'Home' });

  return <Box tw="p-20">Hello world!</Box>;
}
