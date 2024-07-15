import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../Store'

export const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.EXPO_PUBLIC_API_URL}/`,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState
    const token = state.auth.access
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  }
})
