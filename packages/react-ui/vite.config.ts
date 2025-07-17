import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    dts({ tsconfigPath: './tsconfig.app.json' }),
    cssInjectedByJsPlugin(),
    dts({ tsconfigPath: './tsconfig.app.json' }),
    visualizer({ open: false })
  ],
  build: {
    minify: true,
    sourcemap: false,
    lib: {
      entry: 'src/index.tsx',
      name: '@minchat/reactui',
      fileName: (format) => `minchat-sdk.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@minchat/react-chat-ui'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
}); 