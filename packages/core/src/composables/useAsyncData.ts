import { ref, type Ref } from '@vue/reactivity'

export interface AsyncDataOptions {
    immediate?: boolean
    onError?: (error: Error) => void
}

export interface UseAsyncDataReturn<T> {
    data: Ref<T | undefined>
    loading: Ref<boolean>
    error: Ref<Error | undefined>
    refresh: () => Promise<void>
    fetch: () => Promise<void>
}

/**
 * Generic async data fetching with loading/error states (like Nuxt's useAsyncData)
 */
export async function useAsyncData<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: AsyncDataOptions = {},
): Promise<UseAsyncDataReturn<T>> {
    const data = ref<T>()
    const loading = ref(false)
    const error = ref<Error>()

    const fetch = async () => {
        loading.value = true
        error.value = undefined

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
        await fetch()
    }

    // Execute immediately if specified
    if (options.immediate !== false) {
        await fetch()
    }

    return {
        data: data as Ref<T | undefined>,
        loading,
        error,
        refresh,
        fetch,
    }
}

