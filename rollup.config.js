import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

const external = ['plotly.js'];
const globals = {
  'plotly.js': 'Plotly'
};

export default [
  // UMD bundle (for CDN usage)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/djalgojs.umd.js',
      format: 'umd',
      name: 'dj',
      globals,
      sourcemap: true
    },
    external,
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      })
    ]
  },
  
  // Minified UMD bundle
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/djalgojs.umd.min.js',
      format: 'umd',
      name: 'dj',
      globals,
      sourcemap: true
    },
    external,
    plugins: [
      resolve({ browser: true }),
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