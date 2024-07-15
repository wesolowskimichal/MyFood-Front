import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../constants/variables'
import { Token } from '../types/Types'
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
