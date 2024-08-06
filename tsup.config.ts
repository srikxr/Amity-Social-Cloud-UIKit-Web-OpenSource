import { defineConfig } from 'tsup';
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  sourcemap: options.sourcemap,
  minify: options.minify,
  clean: true,
  splitting: true,
  ignoreErrors: true,
  treeshake: true,
  metafile: true,
  legacyOutput: true,
  esbuildPlugins: [
    replace({
      include: /.(ts|js|jsx|tsx)$/,
      __TEST__: 'false',
      __VERSION__: `'${pkg.version}'`,
      __DEV__:
        '(typeof process !== "undefined" && process.env && process.env.NODE_ENV ? (process.env.NODE_ENV !== "production") : false)',
    }),
  ],
  loader: {
    '.css': 'local-css',
  },
}));
