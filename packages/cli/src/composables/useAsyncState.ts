import { ref, type Ref } from '@vue/reactivity'

export interface UseAsyncStateReturn<T> {
    state: Ref<T>
    loading: Ref<boolean>
    error: Ref<Error | null>
    execute: <R>(fn: () => Promise<R>) => Promise<R>
}

/**
 * Simpler version for managing async state
 */
export function useAsyncState<T>(initialState: T): UseAsyncStateReturn<T> {
    const state = ref(initialState) as Ref<T>
    const loading = ref(false)
    const error = ref<Error | null>(null)

    const execute = async <R>(fn: () => Promise<R>): Promise<R> => {
        loading.value = true
        error.value = null

        try {
            const result = await fn()

            return result
        } catch (err) {
            error.value = err instanceof Error ? err : new Error(String(err))
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        state,
        loading,
        error,
        execute,
    }
}

