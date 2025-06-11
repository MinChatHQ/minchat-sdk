import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [dts({ tsconfigPath: './tsconfig.json' })],
    build: {
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