import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Theme, ThemeColors } from '../../types/Types'
import { DarkThemeColors, LightThemeColors } from '../../constants/colors'
import { getTheme as fetchThemeFromStorage, setTheme as saveThemeToStorage } from '../../services/SecureStore'
import { RootState } from '../Store'

const initialState: {
  theme: Theme
  colors: ThemeColors
} = {
  theme: 'light',
  colors: LightThemeColors
}

export const getTheme = createAsyncThunk('theme/getTheme', async () => {
  const theme = await fetchThemeFromStorage()
  return theme
})

export const toggleTheme = createAsyncThunk('theme/toggleTheme', async (_, { getState }) => {
  const currentTheme = (getState() as RootState).theme.theme
  const newTheme = currentTheme === 'light' ? 'dark' : 'light'
  await saveThemeToStorage(newTheme)
  return newTheme
})

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    getThemeClors: state => {
      state.colors = state.theme === 'light' ? LightThemeColors : DarkThemeColors
    }
  },
  extraReducers: builder => {
    builder.addCase(getTheme.fulfilled, (state, action) => {
      state.theme = action.payload
      state.colors = action.payload === 'light' ? LightThemeColors : DarkThemeColors
    })
    builder.addCase(toggleTheme.fulfilled, (state, action) => {
      state.theme = action.payload
      state.colors = action.payload === 'light' ? LightThemeColors : DarkThemeColors
    })
  }
})

export const { getThemeClors } = themeSlice.actions
export default themeSlice.reducer
