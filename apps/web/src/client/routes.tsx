import type { RouteObject } from 'react-router-dom';
import { route } from 'react-router-typesafe-routes/dom';

import { RouteErrorBoundary } from '~client/components/RouteErrorBoundary.tsx';
import * as Home from '~client/pages/_index.tsx';
import * as Auth from '~client/pages/auth.tsx';
import * as Root from '~client/pages/root.tsx';

export const paths = {
  Auth: route('auth'),
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
    ],
  },
];
