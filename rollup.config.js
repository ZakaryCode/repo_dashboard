import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { emptyDir } from 'rollup-plugin-empty-dir'
import { terser } from 'rollup-plugin-terser'

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
    fileName: 'bundle[hash].js'
  },
  plugins: [
    // always put chromeExtension() before other plugins
    chromeExtension({ browserPolyfill: true, crossBrowser: true }),
    simpleReloader(),
    // the plugins below are optional
    resolve(),
    typescript(),
    commonjs({ extensions: ['.js', '.ts', '.jsx', '.tsx'] }),
    emptyDir(),
    isProduction && terser()
  ],
}
