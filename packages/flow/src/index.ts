#!/usr/bin/env node

import { defineCommand, runMain } from 'citty'
import { loadFlowConfig, setConfig } from './config'
import { createFlowApp } from './app/FlowApp'
import packageInfo from '../package.json' assert { type: 'json' }

const main = defineCommand({
    meta: {
        name: 'flow',
        version: packageInfo.version,
        description: packageInfo.description,
    },
    args: {
        version: {
            type: 'boolean',
            alias: 'v',
            description: 'Show version',
        },
    },
    async run({ args, cmd }) {
        if (args.version) {
            console.log(`flow ${(cmd.meta as any).version}`)

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
            console.error(error)
            process.exit(1)
        }
    },
})

// Run the CLI
// noinspection JSIgnoredPromiseFromCall
runMain(main)
