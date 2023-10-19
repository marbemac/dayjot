import { ctx } from '~app';

export function Component() {
  ctx.useHead({ title: 'Home' });

  return <div className="p-20">Hello world!</div>;
}
