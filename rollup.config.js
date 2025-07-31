import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

// For starboard.gg, we need a self-contained bundle without externals
const external = [];
const globals = {};

export default [
  // Main bundle with dj + viz (ES module format)
  {
    input: 'src/index-complete.ts',
    output: {
      file: 'dist/djalgojs.js',
      format: 'es',
      sourcemap: false,
      inlineDynamicImports: true
    },
    plugins: [
      resolve({ 
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      })
    ]
  },
  // Minified version for production use
  {
    input: 'src/index-complete.ts',
    output: {
      file: 'dist/djalgojs.min.js',
      format: 'es',
      sourcemap: false,
      inlineDynamicImports: true
    },
    plugins: [
      resolve({ 
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      }),
      terser()
    ]
  }
];