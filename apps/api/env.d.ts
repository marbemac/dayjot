/// <reference types="@cloudflare/workers-types" />

interface EnvVariables {
  JOT_SQL_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
}
