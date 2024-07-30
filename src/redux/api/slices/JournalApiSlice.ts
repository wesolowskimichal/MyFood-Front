import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../querys/BaseQueryReauth'
import { Journal, JournalPage } from '../../../types/Types'

export const journalApiSlice = createApi({
  reducerPath: 'journalApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Journal'],
  endpoints: builder => ({
    getJournals: builder.query<JournalPage, void>({
      query: () => `api/journal/`,
      providesTags: result => (result ? [{ type: 'Journal', id: 'LIST' }] : [])
    }),
    getJournalsByDate: builder.query<Journal[], { year: number; month: number; day: number }>({
      query: ({ year, month, day }) => `api/journal/?year=${year}&month=${month}&day=${day}`,
      providesTags: (result, error, { year, month, day }) =>
        result ? result.map(({ id }) => ({ type: 'Journal', id: id })) : []
    })
  })
})

export const { useGetJournalsQuery, useGetJournalsByDateQuery } = journalApiSlice
