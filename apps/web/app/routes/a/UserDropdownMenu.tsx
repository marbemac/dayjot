import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@supastack/ui-primitives/dropdown-menu';
import { $path } from 'remix-routes';

import { userStore$ } from '~/app-store.ts';
import { Link } from '~/components/Link.tsx';
import { localDbStore$ } from '~/local-db/store.ts';
import { modalPath } from '~/modals/index.tsx';
import { useTrpc } from '~/providers.tsx';

type UserDropdownMenuProps = {
  trigger: React.ReactNode;
};

export const UserDropdownMenu = ({ trigger }: UserDropdownMenuProps) => {
  const logout = useLogout();

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent side="bottom">
        <DropdownMenuGroup label="Settings">
          <DropdownMenuItem as={Link} to={modalPath('settings_theme')}>
            Theme
          </DropdownMenuItem>

          <DropdownMenuItem as={Link} to={modalPath('settings_timezone')}>
            Timezone
          </DropdownMenuItem>

          <DropdownMenuItem as={Link} to={modalPath('settings_journal')}>
            Journal
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={async () => {
              await logout.mutateAsync();

              // Hard reload to re-init the local db (after it's cleared)
              window.location.href = $path('/auth');
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};

const useLogout = ({ onSuccess }: { onSuccess?: () => void | Promise<void> } = {}) => {
  const { trpc } = useTrpc();

  const logout = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      userStore$.isLoggedIn.set(false);

      const db = localDbStore$.db.peek();
      if (db) {
        await db.remove();
      }

      if (onSuccess) {
        await onSuccess();
      }

      await trpc.$invalidate();
    },
  });

  return logout;
};
