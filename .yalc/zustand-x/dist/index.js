"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  createStore: () => createStore,
  createZustandStore: () => createZustandStore,
  extendActions: () => extendActions,
  extendSelectors: () => extendSelectors,
  generateStateActions: () => generateStateActions,
  generateStateGetSelectors: () => generateStateGetSelectors,
  generateStateHookSelectors: () => generateStateHookSelectors,
  generateStateTrackedHooksSelectors: () => generateStateTrackedHooksSelectors,
  immerMiddleware: () => immerMiddleware,
  mapValuesKey: () => mapValuesKey,
  pipe: () => pipe,
  storeFactory: () => storeFactory
});
module.exports = __toCommonJS(src_exports);

// src/createStore.ts
var import_immer2 = require("immer");
var import_react_tracked = require("react-tracked");
var import_middleware = require("zustand/middleware");
var import_traditional = require("zustand/traditional");
var import_vanilla = require("zustand/vanilla");

// src/middlewares/immer.middleware.ts
var import_immer = require("immer");
var immerMiddleware = (config) => (set, get, api) => {
  const setState = (fn, actionName) => set((0, import_immer.produce)(fn), true, actionName);
  api.setState = setState;
  return config(setState, get, api);
};

// src/utils/generateStateActions.ts
var generateStateActions = (store, storeName) => {
  const actions = {};
  Object.keys(store.getState()).forEach((key) => {
    actions[key] = (value) => {
      const prevValue = store.getState()[key];
      if (prevValue === value)
        return;
      const actionKey = key.replace(/^\S/, (s) => s.toUpperCase());
      store.setState((draft) => {
        draft[key] = value;
      }, `@@${storeName}/set${actionKey}`);
    };
  });
  return actions;
};

// src/utils/generateStateGetSelectors.ts
var generateStateGetSelectors = (store) => {
  const selectors = {};
  Object.keys(store.getState()).forEach((key) => {
    selectors[key] = () => store.getState()[key];
  });
  return selectors;
};

// src/utils/generateStateHookSelectors.ts
var generateStateHookSelectors = (useStore, store) => {
  const selectors = {};
  Object.keys(store.getState()).forEach((key) => {
    selectors[key] = (equalityFn) => {
      return useStore((state) => state[key], equalityFn);
    };
  });
  return selectors;
};

// src/utils/generateStateTrackedHooksSelectors.ts
var generateStateTrackedHooksSelectors = (useTrackedStore, store) => {
  const selectors = {};
  Object.keys(store.getState()).forEach((key) => {
    selectors[key] = () => {
      return useTrackedStore()[key];
    };
  });
  return selectors;
};

// src/utils/pipe.ts
function pipe(x, ...fns) {
  return fns.reduce((y, fn) => fn(y), x);
}

// src/utils/extendActions.ts
var extendActions = (builder, api) => {
  const actions = builder(api.set, api.get, api);
  return __spreadProps(__spreadValues({}, api), {
    set: __spreadValues(__spreadValues({}, api.set), actions)
  });
};

// src/utils/extendSelectors.ts
var extendSelectors = (builder, api) => {
  const use = __spreadValues({}, api.use);
  const useTracked = __spreadValues({}, api.useTracked);
  const get = __spreadValues({}, api.get);
  Object.keys(builder(api.store.getState(), api.get, api)).forEach((key) => {
    use[key] = (...args) => api.useStore((state) => {
      const selectors = builder(state, api.get, api);
      const selector = selectors[key];
      return selector(...args);
    });
    useTracked[key] = (...args) => {
      const trackedState = api.useTrackedStore();
      const selectors = builder(trackedState, api.get, api);
      const selector = selectors[key];
      return selector(...args);
    };
    get[key] = (...args) => {
      const selectors = builder(api.store.getState(), api.get, api);
      const selector = selectors[key];
      return selector(...args);
    };
  });
  return __spreadProps(__spreadValues({}, api), {
    get,
    use,
    useTracked
  });
};

// src/utils/storeFactory.ts
var storeFactory = (api) => {
  return __spreadProps(__spreadValues({}, api), {
    extendSelectors: (builder) => storeFactory(extendSelectors(builder, api)),
    extendActions: (builder) => storeFactory(extendActions(builder, api))
  });
};

// src/createStore.ts
var createStore = (name) => (initialState, options = {}) => {
  var _a, _b;
  const {
    middlewares: _middlewares = [],
    devtools,
    persist,
    immer
  } = options;
  (0, import_immer2.setAutoFreeze)((_a = immer == null ? void 0 : immer.enabledAutoFreeze) != null ? _a : false);
  if (immer == null ? void 0 : immer.enableMapSet) {
    (0, import_immer2.enableMapSet)();
  }
  const middlewares = [immerMiddleware, ..._middlewares];
  if (persist == null ? void 0 : persist.enabled) {
    const opts = __spreadProps(__spreadValues({}, persist), {
      name: (_b = persist.name) != null ? _b : name
    });
    middlewares.push((config) => (0, import_middleware.persist)(config, opts));
  }
  if (devtools == null ? void 0 : devtools.enabled) {
    middlewares.push(
      (config) => (0, import_middleware.devtools)(config, __spreadProps(__spreadValues({}, devtools), { name }))
    );
  }
  middlewares.push(import_vanilla.createStore);
  const pipeMiddlewares = (createState) => pipe(createState, ...middlewares);
  const store = pipeMiddlewares(() => initialState);
  const useStore = (selector, equalityFn) => (0, import_traditional.useStoreWithEqualityFn)(
    store,
    selector,
    equalityFn
  );
  const stateActions = generateStateActions(store, name);
  const mergeState = (state, actionName) => {
    store.setState(
      (draft) => {
        Object.assign(draft, state);
      },
      actionName || `@@${name}/mergeState`
    );
  };
  const setState = (fn, actionName) => {
    store.setState(fn, actionName || `@@${name}/setState`);
  };
  const hookSelectors = generateStateHookSelectors(useStore, store);
  const getterSelectors = generateStateGetSelectors(store);
  const useTrackedStore = (0, import_react_tracked.createTrackedSelector)(useStore);
  const trackedHooksSelectors = generateStateTrackedHooksSelectors(
    useTrackedStore,
    store
  );
  const api = {
    get: __spreadValues({
      state: store.getState
    }, getterSelectors),
    name,
    set: __spreadValues({
      state: setState,
      mergeState
    }, stateActions),
    store,
    use: hookSelectors,
    useTracked: trackedHooksSelectors,
    useStore,
    useTrackedStore,
    extendSelectors: () => api,
    extendActions: () => api
  };
  return storeFactory(api);
};
var createZustandStore = createStore;

// src/utils/mapValuesKey.ts
var import_lodash = __toESM(require("lodash.mapvalues"));
var mapValuesKey = (key, obj) => (0, import_lodash.default)(obj, (value) => value[key]);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createStore,
  createZustandStore,
  extendActions,
  extendSelectors,
  generateStateActions,
  generateStateGetSelectors,
  generateStateHookSelectors,
  generateStateTrackedHooksSelectors,
  immerMiddleware,
  mapValuesKey,
  pipe,
  storeFactory
});
//# sourceMappingURL=index.js.map