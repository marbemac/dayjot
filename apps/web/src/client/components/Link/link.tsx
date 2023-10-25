import { forwardRef } from '@supastack/ui-primitives';
import type { StyleProps } from '@supastack/ui-styles';
import { cx } from '@supastack/ui-styles';
import { Link as BaseLink, type LinkProps as BaseLinkProps } from 'react-router-dom';

type BaseProps = Pick<
  BaseLinkProps,
  'to' | 'replace' | 'preventScrollReset' | 'relative' | 'state' | 'reloadDocument' | 'children'
>;

export type LinkProps = BaseProps & StyleProps;

function LinkInner({ to, tw, UNSAFE_class, ...rest }: LinkProps, ref: React.ForwardedRef<HTMLAnchorElement>) {
  return <BaseLink ref={ref} to={to} className={cx(tw, UNSAFE_class)} {...rest} />;
}

export const Link = forwardRef(LinkInner);
