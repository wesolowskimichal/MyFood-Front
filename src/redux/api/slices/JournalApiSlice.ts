import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../queries/BaseQueryReauth'
import { Journal, JournalLegacy, JournalPage, Meal, ProductDetails, Recipe } from '../../../types/Types'
import { getDate } from '../../../helpers/GetDate'

type JournalQuery = { year: number; month: number; day: number }
export type MutationJournalPayloadBody = {
  object_type: 'product' | 'recipe'
  object: ProductDetails | Recipe
  // date: Date
  object_amount: number
  meal: Meal
}
type MutationJournalPayload = {
  object_id: string
  object_type: 'product' | 'recipe'
  object_amount: number
  meal_id: string
}

const convertPostJournalPayload = (payload: MutationJournalPayloadBody): MutationJournalPayload => ({
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
    getJournalsByDate: builder.query<Journal, JournalQuery>({
      query: ({ year, month, day }) => `api/journal/?year=${year}&month=${month}&day=${day}`,
      providesTags: result =>
        result ? result.map(({ meal }) => ({ type: 'Journal', id: meal.id })) : [{ type: 'Journal', id: 'BY_DATE' }]
    }),
    postJournal: builder.mutation<JournalLegacy, MutationJournalPayloadBody>({
      query: journal => ({
        url: 'api/journal/',
        method: 'POST',
        body: convertPostJournalPayload(journal)
      }),
      onQueryStarted(post, { dispatch, queryFulfilled }) {
        queryFulfilled
          .then(({ data }) => {
            dispatch(
              journalApiSlice.util.updateQueryData('getJournalsByDate', getDate(new Date(data.date)), draft => {
                // const journal: Journal = [...draft, { date, object: post }]
                const meal = draft.find(j => j.meal.id === post.meal.id)
                if (!meal) {
                  draft.push({
                    meal: post.meal,
                    journal_entities: [
                      {
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
                    ]
                  })
                  return
                }

                draft
                  .find(j => j.meal.id === post.meal.id)!
                  .journal_entities.push({
                    id: data.id,
                    url: data.url,
                    date: data.date,
                    object: {
                      type: post.object_type,
                      meal: post.meal,
                      entry: post.object,
                      amount: post.object_amount
                    }
                  })
              })
            )
          })
          .catch(error => {
            console.error('Error posting journal:', error)
          })
      },
      invalidatesTags: (_result, _error, obj) => [
        { type: 'Journal', id: 'LIST' },
        { type: 'Journal', id: _result?.id ?? 'BY_DATE' }
      ]
    }),
    patchJournal: builder.mutation<JournalLegacy, { body: MutationJournalPayloadBody; journalId: string }>({
      query: ({ body, journalId }) => ({
        url: `api/journal/${journalId}/`,
        method: 'PATCH',
        body: convertPostJournalPayload(body)
      }),
      onQueryStarted({ body, journalId }, { dispatch, queryFulfilled }) {
        queryFulfilled
          .then(({ data }) => {
            dispatch(
              journalApiSlice.util.updateQueryData('getJournalsByDate', getDate(new Date(data.date)), draft => {
                // const journal: Journal = {
                //   id: data.id,
                //   url: data.url,
                //   date: data.date,
                //   object: {
                //     type: body.object_type,
                //     meal: body.meal,
                //     entry: body.object,
                //     amount: body.object_amount
                //   }
                // }
                // const index = draft.findIndex(j => j.id === journalId)
                // draft[index] = journal

                draft.find(j => j.meal.id === body.meal.id)!.journal_entities.find(j => j.id === journalId)!.object = {
                  type: body.object_type,
                  meal: body.meal,
                  entry: body.object,
                  amount: body.object_amount
                }
              })
            )
          })
          .catch(error => {
            console.error('Error patching journal:', error)
          })
      },
      invalidatesTags: (_result, _error, { journalId }) => [{ type: 'Journal', id: journalId }]
    }),
    deleteJournal: builder.mutation<void, string>({
      query: id => ({
        url: `api/journal/${id}/`,
        method: 'DELETE'
      }),
      onQueryStarted(id, { dispatch, queryFulfilled }) {
        queryFulfilled
          .then(() => {
            dispatch(
              journalApiSlice.util.updateQueryData('getJournalsByDate', getDate(new Date()), draft => {
                draft.forEach(j => {
                  j.journal_entities = j.journal_entities.filter(je => je.id !== id)
                })
              })
            )
          })
          .catch(error => {
            console.error('Error deleting journal:', error)
          })
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'Journal', id: 'LIST' },
        { type: 'Journal', id: 'BY_DATE' },
        { type: 'Journal', id: id }
      ]
      // invalidatesTags: (_result, _error, id) => [{ type: 'Journal', id: id }]
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
