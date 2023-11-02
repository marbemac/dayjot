import './globals.css';

import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

import { SiteNav } from '~/components/SiteNav.tsx';
import { Providers } from '~/providers.tsx';

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <body>
        <Providers>
          <SiteNav />
          <Outlet />
        </Providers>

        <ScrollRestoration />
        <LiveReload />
        <Scripts />
      </body>
    </html>
  );
}
