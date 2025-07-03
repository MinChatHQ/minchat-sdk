import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    plugins: [
        react(),
        visualizer({ open: true }),
        dts({ tsconfigPath: './tsconfig.app.json' })
    ],
    build: {
        minify: true,
        sourcemap: false,
        lib: {
            entry: 'src/index.ts',
            name: '@minchat/react',
            fileName: (format) => `minchat-sdk.${format}.js`,
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            external: ['react',
                'react-dom',
                'react/jsx-runtime',
                'react/jsx-dev-runtime',
                "@minchat/js"
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
}); 