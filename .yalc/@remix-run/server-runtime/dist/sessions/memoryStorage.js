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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Creates and returns a simple in-memory SessionStorage object, mostly useful
 * for testing and as a reference implementation.
 *
 * Note: This storage does not scale beyond a single process, so it is not
 * suitable for most production scenarios.
 *
 * @see https://remix.run/utils/sessions#creatememorysessionstorage
 */
const createMemorySessionStorageFactory = createSessionStorage => ({
  cookie
} = {}) => {
  let map = new Map();
  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      let id = Math.random().toString(36).substring(2, 10);
      map.set(id, {
        data,
        expires
      });
      return id;
    },
    async readData(id) {
      if (map.has(id)) {
        let {
          data,
          expires
        } = map.get(id);
        if (!expires || expires > new Date()) {
          return data;
        }

        // Remove expired session data.
        if (expires) map.delete(id);
      }
      return null;
    },
    async updateData(id, data, expires) {
      map.set(id, {
        data,
        expires
      });
    },
    async deleteData(id) {
      map.delete(id);
    }
  });
};

exports.createMemorySessionStorageFactory = createMemorySessionStorageFactory;
