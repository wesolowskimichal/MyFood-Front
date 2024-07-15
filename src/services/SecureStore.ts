import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, THEME_KEY } from '../constants/variables'
import { Theme, Token } from '../types/Types'
import * as SecureStore from 'expo-secure-store'

export const saveTokens = async (access: string, refresh: string) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access)
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh)
}

export const getTokens = async (): Promise<Token> => {
  const access = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
  const refresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
  return { access, refresh }
}

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
}

export const getTheme = async (): Promise<Theme> => {
  const theme = await SecureStore.getItemAsync(THEME_KEY)
  if (!theme) {
    await setTheme('light')
    return 'light'
  }
  return theme as Theme
}

export const setTheme = async (theme: Theme) => {
  await SecureStore.setItemAsync(THEME_KEY, theme)
}
