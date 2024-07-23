import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../querys/BaseQueryReauth'
import { Journal, JournalPage } from '../../../types/Types'

export const journalApiSlice = createApi({
  reducerPath: 'journalApi',
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getJournals: builder.query<JournalPage, void>({
      query: () => `api/journal/`
    }),
    getJournalsByDate: builder.query<Journal[], { year: number; month: number; day: number }>({
      query: ({ year, month, day }) => `api/journal/?year=${year}&month=${month}&day=${day}`
    })
  })
})

export const { useGetJournalsQuery, useGetJournalsByDateQuery } = journalApiSlice
