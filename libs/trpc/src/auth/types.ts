import type { User } from '@libs/db';

export type SessionUser = {
  email: string;
  name: string | null;
  image: string | null;

  time_zone?: User['timeZone'];
  email_times?: User['emailTimes'];
  email_include_memory?: User['emailIncludeMemory'];
};
