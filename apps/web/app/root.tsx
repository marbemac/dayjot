import './globals.css';

import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

import { Providers } from '~/providers.tsx';

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="preconnect" href="//ka-p.fontawesome.com" crossOrigin="anonymous" />
        <script
          src="https://kit.fontawesome.com/4b93191a51.js"
          crossOrigin="anonymous"
          async
          data-auto-replace-svg="nest"
          data-auto-add-css="false"
        />

        <Meta />
        <Links />
      </head>

      <body>
        <Providers>
          <Outlet />
        </Providers>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
