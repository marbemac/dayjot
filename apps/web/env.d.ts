/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

/// <reference types="@cloudflare/workers-types" />
/// <reference types="vite/client" />

/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

interface EnvVariables {
  JOT_SQL_URL: string;
}

namespace NodeJS {
  interface ProcessEnv extends EnvVariables {}
}

interface AppLoadContext {
  env: EnvVariables;
}
