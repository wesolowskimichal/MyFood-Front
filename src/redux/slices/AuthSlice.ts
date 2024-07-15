import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Token, Token__FULL } from '../../types/Types'
import { clearTokens, getTokens, saveTokens } from '../../services/SecureStore'

const initialState: Token = {
  access: null,
  refresh: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<Token__FULL>) {
      state.access = action.payload.access
      state.refresh = action.payload.refresh
      saveTokens(action.payload.access, action.payload.refresh)
    },
    setAccess(state, action: PayloadAction<string>) {
      state.access = action.payload
      saveTokens(action.payload, state.refresh || '')
    },
    clearAuth(state) {
      state.access = null
      state.refresh = null
      clearTokens()
    }
  }
})

export const { setAuth, setAccess, clearAuth } = authSlice.actions
export default authSlice.reducer

export const loadTokens = () => async (dispatch: any) => {
  const tokens = await getTokens()

  if (tokens.access && tokens.refresh) {
    dispatch(setAuth({ access: tokens.access, refresh: tokens.refresh }))
  }
}
