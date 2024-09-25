import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../queries/BaseQueryReauth'
import { Journal, JournalPage, Meal, ProductDetails } from '../../../types/Types'
import { getDate } from '../../../helpers/GetDate'

type JournalQuery = { year: number; month: number; day: number }
export type MutationJournalPayloadBody = {
  object_type: 'product' | 'recipe'
  object: ProductDetails
  date: Date
  object_amount: number
  meal: Meal
}
type MutationJournalPayload = {
  date: Date
  object_id: string
  object_type: 'product' | 'recipe'
  object_amount: number
  meal_id: string
}

const convertPostJournalPayload = (payload: MutationJournalPayloadBody): MutationJournalPayload => ({
  date: payload.date,
  object_id: payload.object.id,
  object_type: payload.object_type,
  object_amount: payload.object_amount,
  meal_id: payload.meal.id
})

export const journalApiSlice = createApi({
  reducerPath: 'journalApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Journal'],
  endpoints: builder => ({
    getJournals: builder.query<JournalPage, void>({
      query: () => `api/journal/`,
      providesTags: result => (result ? [{ type: 'Journal', id: 'LIST' }] : [])
    }),
    getJournalsByDate: builder.query<Journal[], JournalQuery>({
      query: ({ year, month, day }) => `api/journal/?year=${year}&month=${month}&day=${day}`,
      providesTags: (result, _) =>
        result ? [...result.map(({ id }) => ({ type: 'Journal' as const, id }))] : [{ type: 'Journal', id: 'BY_DATE' }]
    }),
    postJournal: builder.mutation<Journal, MutationJournalPayloadBody>({
      query: journal => ({
        url: 'api/journal/',
        method: 'POST',
        body: convertPostJournalPayload(journal)
      }),
      onQueryStarted({ date, ...post }, { dispatch, queryFulfilled }) {
        queryFulfilled
          .then(({ data }) => {
            dispatch(
              journalApiSlice.util.updateQueryData('getJournalsByDate', getDate(date), draft => {
                const journal: Journal = {
                  id: data.id,
                  url: data.url,
                  date: data.date,
                  object: {
                    type: post.object_type,
                    meal: post.meal,
                    entry: post.object,
                    amount: post.object_amount
                  }
                }
                draft.push(journal)
              })
            )
          })
          .catch(error => {
            console.error('Error posting journal:', error)
          })
      }
    }),
    patchJournal: builder.mutation<Journal, { body: MutationJournalPayloadBody; journalId: string }>({
      query: ({ body, journalId }) => ({
        url: `api/journal/${journalId}/`,
        method: 'PATCH',
        body: convertPostJournalPayload(body)
      }),
      onQueryStarted({ body, journalId }, { dispatch, queryFulfilled }) {
        queryFulfilled
          .then(({ data }) => {
            dispatch(
              journalApiSlice.util.updateQueryData('getJournalsByDate', getDate(body.date), draft => {
                const journal: Journal = {
                  id: data.id,
                  url: data.url,
                  date: data.date,
                  object: {
                    type: body.object_type,
                    meal: body.meal,
                    entry: body.object,
                    amount: body.object_amount
                  }
                }
                const index = draft.findIndex(j => j.id === journalId)
                draft[index] = journal
              })
            )
          })
          .catch(error => {
            console.error('Error patching journal:', error)
          })
      }
    }),
    deleteJournal: builder.mutation<void, string>({
      query: id => ({
        url: `api/journal/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Journal', id: id }]
    })
  })
})

export const {
  useGetJournalsQuery,
  useGetJournalsByDateQuery,
  usePostJournalMutation,
  usePatchJournalMutation,
  useDeleteJournalMutation
} = journalApiSlice
