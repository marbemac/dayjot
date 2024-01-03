/**
 * @remix-run/server-runtime v2.4.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
import { isCookie } from '../cookies.js';
import { warnOnceAboutSigningSessionCookie, createSession } from '../sessions.js';

/**
 * Creates and returns a SessionStorage object that stores all session data
 * directly in the session cookie itself.
 *
 * This has the advantage that no database or other backend services are
 * needed, and can help to simplify some load-balanced scenarios. However, it
 * also has the limitation that serialized session data may not exceed the
 * browser's maximum cookie size. Trade-offs!
 *
 * @see https://remix.run/utils/sessions#createcookiesessionstorage
 */
const createCookieSessionStorageFactory = createCookie => ({
  cookie: cookieArg
} = {}) => {
  let cookie = isCookie(cookieArg) ? cookieArg : createCookie((cookieArg === null || cookieArg === void 0 ? void 0 : cookieArg.name) || "__session", cookieArg);
  warnOnceAboutSigningSessionCookie(cookie);
  return {
    async getSession(cookieHeader, options) {
      return createSession(cookieHeader && (await cookie.parse(cookieHeader, options)) || {});
    },
    async commitSession(session, options) {
      let serializedCookie = await cookie.serialize(session.data, options);
      if (serializedCookie.length > 4096) {
        throw new Error("Cookie length will exceed browser maximum. Length: " + serializedCookie.length);
      }
      return serializedCookie;
    },
    async destroySession(_session, options) {
      return cookie.serialize("", {
        ...options,
        maxAge: undefined,
        expires: new Date(0)
      });
    }
  };
};

export { createCookieSessionStorageFactory };
