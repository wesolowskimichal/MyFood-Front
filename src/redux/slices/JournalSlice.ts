import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState: {
  journalRefetch: boolean
} = {
  journalRefetch: false
}

const journalSlice = createSlice({
  name: 'journalRefetch',
  initialState,
  reducers: {
    setJournalRefetch(state, action: PayloadAction<boolean>) {
      state.journalRefetch = action.payload
    }
  }
})

export const { setJournalRefetch } = journalSlice.actions
export default journalSlice.reducer
