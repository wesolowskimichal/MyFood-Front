import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Token, Token__FULL } from '../../types/Types'
import { clearTokens, getTokens, saveTokens } from '../../services/SecureStore'
import { validateToken } from '../../utils/Auth'

const initialState: Token & { isAuthenticated: boolean | null } = {
  access: null,
  refresh: null,
  isAuthenticated: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<Token__FULL>) {
      state.access = action.payload.access
      state.refresh = action.payload.refresh
      state.isAuthenticated = true
      saveTokens(action.payload.access, action.payload.refresh)
    },
    setAccess(state, action: PayloadAction<string>) {
      state.access = action.payload
      saveTokens(action.payload, state.refresh || '')
    },
    clearAuth(state) {
      state.access = null
      state.refresh = null
      state.isAuthenticated = false
      clearTokens()
    },
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload
    }
  }
})

export const { setAuth, setAccess, clearAuth, setAuthenticated } = authSlice.actions
export default authSlice.reducer

export const loadTokens = () => async (dispatch: any) => {
  const tokens = await getTokens()

  if (tokens.access && tokens.refresh) {
    const isValid = await validateToken(tokens.access)
    dispatch(setAuth({ access: tokens.access, refresh: tokens.refresh }))
    dispatch(setAuthenticated(isValid))
  } else {
    dispatch(setAuthenticated(false))
  }
}
