import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    plugins: [dts({ tsconfigPath: './tsconfig.json' }),
    visualizer({open: true})
    ],
    build: {
        minify: true,
        sourcemap: false,
        lib: {
            entry: 'src/index.ts',
            name: '@minchat/js',
            fileName: (format) => `minchat-sdk.${format}.js`,
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {},
            },
        },
    },
}); 