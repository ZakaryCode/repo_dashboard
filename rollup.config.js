import resolve from '@rollup/plugin-node-resolve'
import { babel } from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { emptyDir } from 'rollup-plugin-empty-dir'
import { terser } from 'rollup-plugin-terser'
import { bundleImports } from 'rollup-plugin-bundle-imports'

import {
  chromeExtension,
  simpleReloader,
} from 'rollup-plugin-chrome-extension'

const isProduction = !process.env.ROLLUP_WATCH

export default {
  input: './manifest.json',
  output: {
    dir: 'dist',
    format: 'esm',
    banner: `var process = {
  env: {
    NODE_ENV: ${isProduction ? '"production"' : '"production"'}
  }
}
`
  },
  plugins: [
    // always put chromeExtension() before other plugins
    chromeExtension({ browserPolyfill: true, crossBrowser: true, dynamicImportWrapper: false }),
    simpleReloader(),
    // the plugins below are optional
    resolve(),
    typescript(),
    commonjs({ extensions: ['.js', '.ts', '.jsx', '.tsx'], transformMixedEsModules: true, esmExternals: true, requireReturnsDefault: 'preferred' }),
    babel({ babelHelpers: 'bundled', extensions: ['.js', '.ts', '.jsx', '.tsx'] }),
    bundleImports(),
    emptyDir(),
    isProduction && terser()
  ],
}
