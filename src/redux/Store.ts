import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'
import authReducer from './slices/AuthSlice'
import themeReducer from './slices/ThemeSlice'
import dataStoreReducer from './slices/dataStore'
import { fridgeApiSlice } from './api/slices/FridgeApiSlice'
import { journalApiSlice } from './api/slices/JournalApiSlice'
import { userMealApiSlice } from './api/slices/UserMealSlice'
import { productApiSlice } from './api/slices/ProductApiSlice'
import { recipeApiSlice } from './api/slices/RecipeApiSlice'
import { userApiSlice } from './api/slices/UserApiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    dataStore: dataStoreReducer,
    [userApiSlice.reducerPath]: userApiSlice.reducer,
    [fridgeApiSlice.reducerPath]: fridgeApiSlice.reducer,
    [journalApiSlice.reducerPath]: journalApiSlice.reducer,
    [recipeApiSlice.reducerPath]: recipeApiSlice.reducer,
    [userMealApiSlice.reducerPath]: userMealApiSlice.reducer,
    [productApiSlice.reducerPath]: productApiSlice.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(
      userApiSlice.middleware,
      fridgeApiSlice.middleware,
      journalApiSlice.middleware,
      recipeApiSlice.middleware,
      userMealApiSlice.middleware,
      productApiSlice.middleware
    )
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
