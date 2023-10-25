/// <reference types="lucia" />

declare namespace Lucia {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type Auth = import('./index.ts').Auth;

  type DatabaseUserAttributes = {
    email: string;
    name: string | null;
    image: string | null;
  };

  type DatabaseSessionAttributes = {};
}
