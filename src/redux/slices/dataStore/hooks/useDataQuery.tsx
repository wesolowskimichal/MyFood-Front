import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../Store'
import { useCallback, useMemo } from 'react'
import { addStore, add, del, edit } from '..'

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
    (item: TA) => {
      if (!store) {
        initializeStore()
      }
      dispatch(add({ storeName, data: item }))
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

  return { ...data, addItem, editItem, isEdited, getEdited, deleteItem, isDeleted }
}
