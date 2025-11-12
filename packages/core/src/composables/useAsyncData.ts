import { ref, type Ref } from '@vue/reactivity'

export interface AsyncDataOptions {
    immediate?: boolean
    onError?: (error: Error) => void
}

export interface UseAsyncDataReturn<T> {
    data: Ref<T | null>
    loading: Ref<boolean>
    error: Ref<Error | null>
    refresh: () => Promise<void>
    execute: () => Promise<void>
}

/**
 * Generic async data fetching with loading/error states (like Nuxt's useAsyncData)
 */
export function useAsyncData<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: AsyncDataOptions = {},
): UseAsyncDataReturn<T> {
    const data = ref<T | null>(null)
    const loading = ref(false)
    const error = ref<Error | null>(null)

    const execute = async () => {
        loading.value = true
        error.value = null

        try {
            const result = await fetcher()
            data.value = result
        } catch (err) {
            error.value = err instanceof Error ? err : new Error(String(err))

            if (options.onError) {
                options.onError(error.value)
            }
        } finally {
            loading.value = false
        }
    }

    const refresh = async () => {
        await execute()
    }

    // Execute immediately if specified
    if (options.immediate !== false) {
        execute()
    }

    return {
        data: data as Ref<T | null>,
        loading,
        error,
        refresh,
        execute,
    }
}

