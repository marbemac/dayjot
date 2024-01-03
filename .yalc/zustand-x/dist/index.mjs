var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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

// src/createStore.ts
import { enableMapSet, setAutoFreeze } from "immer";
import { createTrackedSelector } from "react-tracked";
import {
  devtools as devtoolsMiddleware,
  persist as persistMiddleware
} from "zustand/middleware";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { createStore as createVanillaStore } from "zustand/vanilla";

// src/middlewares/immer.middleware.ts
import { produce } from "immer";
var immerMiddleware = (config) => (set, get, api) => {
  const setState = (fn, actionName) => set(produce(fn), true, actionName);
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
  setAutoFreeze((_a = immer == null ? void 0 : immer.enabledAutoFreeze) != null ? _a : false);
  if (immer == null ? void 0 : immer.enableMapSet) {
    enableMapSet();
  }
  const middlewares = [immerMiddleware, ..._middlewares];
  if (persist == null ? void 0 : persist.enabled) {
    const opts = __spreadProps(__spreadValues({}, persist), {
      name: (_b = persist.name) != null ? _b : name
    });
    middlewares.push((config) => persistMiddleware(config, opts));
  }
  if (devtools == null ? void 0 : devtools.enabled) {
    middlewares.push(
      (config) => devtoolsMiddleware(config, __spreadProps(__spreadValues({}, devtools), { name }))
    );
  }
  middlewares.push(createVanillaStore);
  const pipeMiddlewares = (createState) => pipe(createState, ...middlewares);
  const store = pipeMiddlewares(() => initialState);
  const useStore = (selector, equalityFn) => useStoreWithEqualityFn(
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
  const useTrackedStore = createTrackedSelector(useStore);
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
import mapValues from "lodash.mapvalues";
var mapValuesKey = (key, obj) => mapValues(obj, (value) => value[key]);
export {
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
};
//# sourceMappingURL=index.mjs.map