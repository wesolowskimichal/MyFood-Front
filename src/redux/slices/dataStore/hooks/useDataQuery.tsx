import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../Store'
import { useCallback, useMemo } from 'react'
import { addStore, clearStore, add, del, edit } from '..'

type DataQuery = {
  storeName: string
}

export const useDataQuery = <TA, TE = TA>({ storeName }: DataQuery) => {
  const dispatch = useDispatch()
  const store = useSelector((state: RootState) => state.dataStore[storeName])

  const data = useMemo(() => {
    if (!store) {
      return {
        added: [] as TA[],
        edited: {} as Record<string, TE>,
        deleted: [] as string[]
      }
    }

    return {
      added: (store.added as TA[]) ?? [],
      edited: (store.edited as Record<string, TE>) ?? {},
      deleted: store.deleted
    }
  }, [store])

  const initializeStore = useCallback(() => {
    if (!store) {
      dispatch(addStore({ storeName }))
    }
  }, [dispatch, store, storeName])

  const addItem = useCallback(
    (item: TA, key?: string) => {
      if (!store) {
        initializeStore()
      }
      dispatch(add({ storeName, data: item, key }))
    },
    [dispatch, store, storeName]
  )

  const editItem = useCallback(
    (key: string, value: TE) => {
      if (!store) {
        initializeStore()
      }
      dispatch(edit({ storeName, data: { key, value } }))
    },
    [dispatch, store, storeName]
  )

  const isEdited = useCallback(
    (key: string) => {
      const keys = Object.keys(data.edited)
      return keys.includes(key)
    },
    [store, data]
  )

  const getEdited = useCallback(
    (key: string) => {
      return data.edited[key]
    },
    [store, data]
  )

  const isDeleted = useCallback(
    (key: string) => {
      return data.deleted.includes(key)
    },
    [store, data]
  )

  const deleteItem = useCallback(
    (key: string) => {
      if (!store) {
        initializeStore()
      }
      dispatch(del({ storeName, key }))
    },
    [dispatch, store, storeName]
  )

  const cleanUp = useCallback(() => {
    dispatch(clearStore(storeName))
  }, [])

  const items = useMemo(
    () => (id: keyof TA, external?: TA[]) => {
      const combinedProducts = external ? [...data.added, ...external] : data.added

      const productMap = new Map()
      combinedProducts.forEach(item => {
        if (isEdited(item[id] as string)) {
          item = { ...item, ...getEdited(item[id] as string) }
        }
        if (!isDeleted(item[id] as string)) {
          productMap.set(item[id], item)
        }
      })

      return Array.from(productMap.values())
    },
    [store, data, isEdited, getEdited, isDeleted]
  )

  return { ...data, addItem, cleanUp, editItem, isEdited, getEdited, deleteItem, isDeleted, items }
}
