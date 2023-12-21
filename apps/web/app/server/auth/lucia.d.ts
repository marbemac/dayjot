/// <reference types="lucia" />

declare namespace Lucia {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type Auth = import('./index.ts').Auth;
  type User = import('@dayjot/db').User;

  type DatabaseUserAttributes = {
    email: string;
    name: string | null;
    image: string | null;

    time_zone?: User['timeZone'];
    email_times?: User['emailTimes'];
    email_include_memory?: User['emailIncludeMemory'];
  };

  type DatabaseSessionAttributes = {};
}
