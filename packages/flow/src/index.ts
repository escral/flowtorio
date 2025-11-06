#!/usr/bin/env node

import { defineCommand, runMain } from 'citty'
import { loadFlowConfig, setConfig } from './config'
import { createFlowApp } from './app/FlowApp'

const main = defineCommand({
    meta: {
        name: 'flow',
        version: '0.0.0', // @todo Replace with dynamic version from package.json
        description: 'Flowtorio - Terminal control center for developer tools', // @todo Get from package.json
    },
    args: {
        version: {
            type: 'boolean',
            alias: 'v',
            description: 'Show version',
        },
    },
    async run({ args }) {
        if (args.version) {
            console.log('flow v0.0.0') // @todo Replace with dynamic version from package.json

            return
        }

        try {
            // Load configuration
            const config = await loadFlowConfig()
            setConfig(config)

            // Create and run the app
            const app = createFlowApp()
            app.run()
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : String(error))
            process.exit(1)
        }
    },
})

// Run the CLI
// noinspection JSIgnoredPromiseFromCall
runMain(main)

