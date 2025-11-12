import { shallowReactive } from '@vue/reactivity'
import { runCommand, type CommandDef, showUsage } from 'citty'

export interface UseCommandsReturn {
    commands: Record<string, CommandDef>
    register: (name: string, command: CommandDef) => void
    unregister: (name: string) => void
    execute: (commandString: string) => Promise<void>
    getCommands: () => Record<string, CommandDef>
}

/**
 * Register and execute citty commands from Command mode
 */
export function useCommands(): UseCommandsReturn {
    const commands = shallowReactive<Record<string, CommandDef>>({})

    const register = (name: string, command: CommandDef) => {
        commands[name] = command
    }

    const unregister = (name: string) => {
        delete commands[name]
    }

    const execute = async (commandString: string) => {
        const parts = commandString.trim().split(/\s+/)
        const commandName = parts[0]
        const args = parts.slice(1)

        const command = commands[commandName]

        if (!command) {
            throw new Error(`Command not found: ${commandName}`)
        }

        // Execute the command using citty's runCommand
        await runCommand(command, {
            rawArgs: args,
        })
    }

    const getCommands = () => {
        return { ...commands }
    }

    return {
        commands,
        register,
        unregister,
        execute,
        getCommands,
    }
}

