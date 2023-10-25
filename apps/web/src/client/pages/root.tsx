import { Outlet, ScrollRestoration } from 'react-router-dom';

import { ctx } from '~app';
import { SiteNav } from '~client/components/SiteNav.tsx';
import { Providers } from '~client/providers.tsx';

export async function loader() {
  // always attempt to populate authenticated user in the query cache
  await ctx.trpc.auth.me.prefetchQuery(undefined, { meta: { deferStream: true } });

  return null;
}

export function Component() {
  // https://unhead.unjs.io/usage/guides/template-params#separator
  ctx.useHead({
    titleTemplate: '%s %separator %subpage %separator %site.name',
    templateParams: {
      site: { name: 'DayJot' },
      separator: '-',
      subpage: null,
    },
    meta: [
      {
        name: 'description',
        content: 'Welcome to %site.name.',
      },
      {
        property: 'og:site_name',
        content: '%site.name',
      },
    ],
  });

  return (
    <Providers>
      <SiteNav />

      <Outlet />

      <ScrollRestoration />
    </Providers>
  );
}
