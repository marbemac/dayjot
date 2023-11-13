'use client';

import { useLocation } from '@remix-run/react';
import { forwardRef } from '@supastack/ui-primitives';

import { Link, type LinkProps } from './link.tsx';

export type NavLinkProps = LinkProps & {
  exact?: boolean;
};

export const useRouteIsActive = ({ to, exact }: Pick<NavLinkProps, 'to' | 'exact'>) => {
  const { pathname } = useLocation();
  const hrefString = typeof to === 'string' ? to : to.pathname ?? '';
  return exact ? pathname === hrefString : pathname.startsWith(hrefString);
};

function NavLinkInner({ exact, to, ...rest }: NavLinkProps, ref: React.ForwardedRef<HTMLAnchorElement>) {
  const isActive = useRouteIsActive({ to, exact });
  const ariaCurrent = isActive ? 'page' : undefined;

  return (
    <Link
      ref={ref}
      to={to}
      aria-current={ariaCurrent}
      data-active={isActive ? true : undefined}
      data-inactive={!isActive ? true : undefined}
      {...rest}
    />
  );
}

/**
 * NavLink supports targeting active/inactive state via `ui-active:` and `ui-inactive:` tailwind variants.
 */
export const NavLink = forwardRef(NavLinkInner);
