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
  // ES Module bundle (for starboard.gg and modern CDN usage)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/djalgojs.esm.js',
      format: 'es',
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
  
  // Minified ES Module bundle
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/djalgojs.esm.min.js',
      format: 'es',
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
  },
  
  // UMD bundle (for script tag usage)
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