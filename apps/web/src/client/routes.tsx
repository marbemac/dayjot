import type { RouteObject } from 'react-router-dom';
import { route, string } from 'react-router-typesafe-routes/dom';

import { RouteErrorBoundary } from '~client/components/RouteErrorBoundary.tsx';
import * as Home from '~client/pages/_index.tsx';
import * as Auth from '~client/pages/auth.tsx';
import * as Journal from '~client/pages/journal.tsx';
import * as Root from '~client/pages/root.tsx';

export const paths = {
  Auth: route('auth'),
  Journal: route('journal', { searchParams: { day: string() } }),
};

export const routes: RouteObject[] = [
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    ...Root,
    children: [
      {
        index: true,
        ...Home,
      },
      {
        path: paths.Auth.path,
        ...Auth,
      },
      {
        path: paths.Journal.path,
        ...Journal,
      },
    ],
  },
];
