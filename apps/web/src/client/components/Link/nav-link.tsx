'use client';

import { forwardRef } from '@supastack/ui-primitives';
import { useLocation } from 'react-router-dom';

import { Link, type LinkProps } from './link.tsx';

export type NavLinkProps = LinkProps & {
  exact?: boolean;
};

function NavLinkInner({ exact, to, ...rest }: NavLinkProps, ref: React.ForwardedRef<HTMLAnchorElement>) {
  const { pathname } = useLocation();
  const hrefString = typeof to === 'string' ? to : to.pathname || '';
  const isActive = exact ? pathname === hrefString : pathname.startsWith(hrefString);
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
