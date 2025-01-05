import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DataState } from '../../../types/Types'

type DataStore<T> = Record<string, DataState<T>>

const initialState: DataStore<unknown> = {}

type addStoreBody = {
  storeName: string
}

type addBody = {
  storeName: string
  data: unknown
  key?: string
}

type editBody = {
  storeName: string
  data: {
    key: string
    value: unknown
  }
}

type delBody = {
  storeName: string
  key: string
}

const dataStoreSlice = createSlice({
  name: 'dataStore',
  initialState,
  reducers: {
    addStore(state, action: PayloadAction<addStoreBody>) {
      state[action.payload.storeName] = { added: [], edited: {}, deleted: [] }
    },
    clearStore(state, action: PayloadAction<string>) {
      state[action.payload] = { added: [], edited: {}, deleted: [] }
    },
    add(state, action: PayloadAction<addBody>) {
      const store = state[action.payload.storeName]
      if (store) {
        if (action.payload.key && store.deleted.includes(action.payload.key)) {
          store.deleted = store.deleted.filter(key => key !== action.payload.key)
        }
        store.added.push(action.payload.data)
      }
    },
    edit(state, action: PayloadAction<editBody>) {
      const store = state[action.payload.storeName]
      if (store) {
        store.edited[action.payload.data.key] = action.payload.data.value
        console.log(store.edited)
      }
    },
    del(state, action: PayloadAction<delBody>) {
      const store = state[action.payload.storeName]
      if (store) {
        store.deleted.push(action.payload.key)
      }
    }
  }
})

export const { addStore, clearStore, add, edit, del } = dataStoreSlice.actions
export type dataStoreAction = ReturnType<typeof addStore | typeof clearStore | typeof add | typeof edit | typeof del>

export default dataStoreSlice.reducer
