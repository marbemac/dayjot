/// <reference types="lucia" />

declare namespace Lucia {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type Auth = import('./index.ts').Auth;

  type DatabaseUserAttributes = import('./types.ts').SessionUser;

  type DatabaseSessionAttributes = {};
}
