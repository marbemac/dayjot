import type { RouteObject } from 'react-router-dom';
import { route } from 'react-router-typesafe-routes/dom';

import { RouteErrorBoundary } from '~client/components/RouteErrorBoundary.tsx';
import * as Home from '~client/pages/_index.tsx';
import { Component as RootLayout } from '~client/pages/root.tsx';

export const paths = {
  Todo: route('todo'),
};

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        ...Home,
      },
    ],
  },
];
