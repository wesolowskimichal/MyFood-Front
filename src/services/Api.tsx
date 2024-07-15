import axios from 'axios'
import { store } from '../redux/Store'
import { clearAuth, setAuth } from '../redux/slices/AuthSlice'
import { Token__FULL } from '../types/Types'

export const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}`
})

api.interceptors.request.use(
  config => {
    const state = store.getState()
    const token = state.auth.access
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    const originalRequest = error.config
    const state = store.getState()
    const refreshToken = state.auth.refresh

    if (error.response.status === 401 && refreshToken) {
      try {
        const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/token/refresh/`, {
          refresh: refreshToken
        })

        const newTokens: Token__FULL = {
          access: response.data.access,
          refresh: response.data.refresh
        }

        store.dispatch(setAuth(newTokens))

        originalRequest.headers['Authorization'] = `Bearer ${newTokens.access}`
        return api(originalRequest)
      } catch (refreshError) {
        store.dispatch(clearAuth())
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
