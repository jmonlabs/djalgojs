import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

// For starboard.gg, we need a self-contained bundle without externals
const external = [];
const globals = {};

export default [
  // Main dj bundle - self-contained
  {
    input: 'src/index-no-viz.ts',
    output: {
      file: 'dist/dj.js',
      format: 'es',
      sourcemap: true
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
  
  // Visualization bundle - uses global Plotly
  {
    input: 'src/visualization-plotly.ts',
    output: {
      file: 'dist/viz.js',
      format: 'es',
      sourcemap: true
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