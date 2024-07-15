import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../querys/BaseQueryReauth'
import { JournalPage } from '../../../types/Types'

export const journalApiSlice = createApi({
  reducerPath: 'journalApi',
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getJournal: builder.query<JournalPage, void>({
      query: () => 'api/journal/'
    })
  })
})

export const { useGetJournalQuery } = journalApiSlice
