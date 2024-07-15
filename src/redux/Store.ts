import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'
import authReducer from './slices/AuthSlice'
import { fridgeApiSlice } from './api/slices/FridgeApiSlice'
import { journalApiSlice } from './api/slices/JournalApiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [fridgeApiSlice.reducerPath]: fridgeApiSlice.reducer,
    [journalApiSlice.reducerPath]: journalApiSlice.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(fridgeApiSlice.middleware, journalApiSlice.middleware)
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
