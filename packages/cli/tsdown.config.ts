import { defineConfig } from 'tsdown'

export default defineConfig([
    {
        entry: 'src/index.ts',
        format: ['esm'],
        dts: true,
        sourcemap: true,
        clean: true,
    },
    {
        entry: { cli: 'src/bin/flow.ts' },
        format: ['esm'],
        dts: false,
        sourcemap: true,
        clean: false,
    },
])

