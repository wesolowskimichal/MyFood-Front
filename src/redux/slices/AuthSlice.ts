import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Token, Token__FULL } from '../../types/Types'

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
    },
    setAccess(state, action: PayloadAction<string>) {
      state.access = action.payload
    },
    clearAuth(state) {
      state.access = null
      state.refresh = null
    }
  }
})

export const { setAuth, setAccess, clearAuth } = authSlice.actions
export default authSlice.reducer
