export type SetupStoreFn<T> = () => T

const stores = new Map<string, any>()

export function defineStore<T>(id: string, setup: SetupStoreFn<T>): () => T {
    return () => {
        if (stores.has(id)) {
            return stores.get(id) as T
        }

        const store = setup()

        stores.set(id, store)

        return store
    }
}
