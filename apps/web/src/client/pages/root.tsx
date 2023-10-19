import { useCallback } from 'react';
import { NavLink, Outlet, ScrollRestoration } from 'react-router-dom';

import { ctx } from '~app';

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

  const linkClass = useCallback(
    ({ isActive }: any) => (isActive ? 'opacity-100 cursor-default' : 'hover:opacity-100 opacity-60'),
    [],
  );

  return (
    <>
      <div className="border-b flex">
        <nav className="border-b flex items-center gap-6 py-4 px-6 flex-1">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
        </nav>
      </div>

      <Outlet />

      <ScrollRestoration />
    </>
  );
}
