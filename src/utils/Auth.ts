import { clearAuth, setAuth } from '../redux/slices/AuthSlice'
import { Token__FULL } from '../types/Types'
import { Store } from '@reduxjs/toolkit'

export const refreshAccessToken = async (store: Store): Promise<string | null> => {
  const state = store.getState()
  const refreshToken = state.auth.refresh

  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: refreshToken })
    })
    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }
    const data: Token__FULL = await response.json()
    store.dispatch(setAuth({ access: data.access, refresh: data.refresh }))
    return data.access
  } catch (error) {
    console.error('Failed to refresh access token: ', error)
    store.dispatch(clearAuth())
    return null
  }
}
