import { readonly, ref } from '@vue/reactivity'

export enum InputMode {
    Normal,
    Insert,
    Command,
}

export function useInputMode(keybindings?: Record<InputMode, string[]>) {
    const mode = ref(InputMode.Normal)

    function changeInputMode(newMode: InputMode) {
        mode.value = newMode
    }

    function initKeybindings() {

    }

    return {
        mode: readonly(mode),
        changeInputMode,
    }
}
