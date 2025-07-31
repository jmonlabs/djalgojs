import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

// For starboard.gg, we need a self-contained bundle without externals
const external = [];
const globals = {};

export default [
  // Self-contained ES Module bundle for starboard.gg (without visualization)
  {
    input: 'src/index-no-viz.ts',
    output: {
      file: 'dist/djalgojs.standalone.js',
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
  
  // Minified self-contained ES Module bundle (without visualization)
  {
    input: 'src/index-no-viz.ts',
    output: {
      file: 'dist/djalgojs.standalone.min.js',
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
      }),
      terser()
    ]
  },
  
  // Visualization module that uses global Plotly
  {
    input: 'src/visualization-plotly.ts',
    output: {
      file: 'dist/djalgojs.viz.js',
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