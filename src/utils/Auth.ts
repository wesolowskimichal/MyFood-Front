import { jwtDecode } from 'jwt-decode'
import { clearAuth, setAuth } from '../redux/slices/AuthSlice'
import { Token__FULL } from '../types/Types'
import { store } from '../redux/Store'

export const checkTokenValidity = async (): Promise<boolean> => {
  const state = store.getState()
  const { access, refresh } = state.auth
  if (!access) {
    return false
  }

  const isTokenValid = await validateToken(access)
  return isTokenValid
}

export const validateToken = async (token: string): Promise<boolean> => {
  const decodedToken = jwtDecode(token)
  const tokenExpiration = decodedToken.exp
  const now = Date.now() / 1000

  if (!tokenExpiration) {
    return false
  }

  if (tokenExpiration > now) {
    return true
  }
  const newToken = await refreshAccessToken()
  return newToken !== null
}

export const refreshAccessToken = async (): Promise<string | null> => {
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
