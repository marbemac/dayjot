import { ssrx } from '@ssrx/vite/plugin';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type PluginOption } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * Note re "Error when using sourcemap for reporting an error: Can't resolve original location of error" warnings during build:
 * https://github.com/rollup/rollup/issues/4699#issuecomment-1770132255
 */

const DO_ANAlYZE = process.env['ANALYZE'];
// const DO_ANAlYZE = true;

// https://vitejs.dev/config/
export default defineConfig(({ ssrBuild, command }) => ({
  plugins: [
    tsconfigPaths(),
    react(),

    ssrx({
      runtime: 'cf-pages',
      serverFile: 'src/server/index.ts',
      clientEntry: 'src/client/entry.client.tsx',
      routesFile: 'src/client/routes.tsx',
    }),

    !ssrBuild &&
      command === 'build' &&
      !!DO_ANAlYZE &&
      (visualizer({
        open: true,
        gzipSize: true,
      }) as PluginOption),
  ].filter(Boolean),

  build: {
    rollupOptions: {
      external: ['cloudflare:sockets'],

      output: {
        manualChunks: !ssrBuild && command === 'build' ? manualChunks : undefined,
      },
    },
  },
}));

function manualChunks(id: string) {
  if (id.match(/node_modules\/(react\/|react-dom\/)/)) {
    return 'vendor-rendering';
  }

  if (id.match(/node_modules\/(@ssrx)/)) {
    return 'vendor-ssrx';
  }

  if (id.match(/node_modules\/(@remix-run|react-router)/)) {
    return 'vendor-router';
  }

  if (id.match(/node_modules\/(@fortawesome)/)) {
    return 'vendor-icons';
  }

  if (id.match(/node_modules\/(@radix|tailwind)/)) {
    return 'vendor-ui';
  }

  if (id.match(/node_modules\/(prosemirror|@tiptap|yjs|react-virtuoso|fnv-plus)/)) {
    return 'vendor-editor';
  }
}
