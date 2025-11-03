import { defineConfig } from 'vite'
import * as path from 'node:path'
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        cssCodeSplit: true,
        lib: {
            entry: {
                'index': path.resolve(__dirname, './src/index.ts'),
            },
            formats: ['es'],
        },
    },

    resolve: {
        alias: {
            '~': path.resolve(__dirname, './src'),
            '~tests': path.resolve(__dirname, './tests'),
        },
    },

    plugins: [
        dts({
            rollupTypes: true,
            copyDtsFiles: true,
        }),
    ],
})
