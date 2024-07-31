import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../queries/BaseQueryReauth'
import { Journal, JournalPage } from '../../../types/Types'
import { getDate } from '../../../helpers/GetDate'

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
      providesTags: (result, error, _) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Journal' as const, id })), { type: 'Journal', id: 'BY_DATE' }]
          : [{ type: 'Journal', id: 'BY_DATE' }]
    }),
    updateJournal: builder.mutation<Journal, Partial<Journal> & Pick<Journal, 'id' | 'date'>>({
      query: journal => ({
        url: `api/journal/${journal.id}`,
        method: 'PUT',
        body: journal
      }),
      onQueryStarted({ id, date, ...put }, { dispatch, queryFulfilled }) {
        const putResult = dispatch(
          journalApiSlice.util.updateQueryData('getJournalsByDate', getDate(date), draft => {
            const journal = draft.find(j => j.id === id)
            if (journal) {
              Object.assign(journal, put)
            }
          })
        )
        queryFulfilled.catch(putResult.undo)
      }
    }),
    patchJournal: builder.mutation<Journal, Partial<Journal> & Pick<Journal, 'id'>>({
      query: journal => ({
        url: `api/journal/${journal.id}`,
        method: 'PATCH',
        body: journal
      }),
      onQueryStarted({ id, date, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          journalApiSlice.util.updateQueryData('getJournalsByDate', getDate(date), draft => {
            const journal = draft.find(j => j.id === id)
            if (journal) {
              Object.assign(journal, patch)
            }
          })
        )
        queryFulfilled.catch(patchResult.undo)
      }
    }),
    deleteJournal: builder.mutation<void, Partial<Journal> & Pick<Journal, 'id'>>({
      query: ({ id }) => ({
        url: `api/journal/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Journal', id: id }]
    })
  })
})

export const {
  useGetJournalsQuery,
  useGetJournalsByDateQuery,
  useUpdateJournalMutation,
  usePatchJournalMutation,
  useDeleteJournalMutation
} = journalApiSlice
