import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

// For starboard.gg, we need a self-contained bundle without externals
const external = [];
const globals = {};

export default [
  // Self-contained ES module - everything inlined
  {
    input: 'src/index-simple.ts',
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
  }
];