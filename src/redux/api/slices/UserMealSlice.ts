import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../queries/BaseQueryReauth'
import { Meal, MealPage } from '../../../types/Types'

type MutateUserMealBody = {
  order?: number
  name: string
  target_proteins?: number
  target_fat?: number
  target_carbons?: number
}

export const userMealApiSlice = createApi({
  reducerPath: 'userMealApi',
  tagTypes: ['UserMeal'],
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getMeals: builder.query<Meal[], void>({
      query: () => 'api/user-meals/',
      providesTags: ['UserMeal'],
      keepUnusedDataFor: 500
    }),
    postMeal: builder.mutation<Meal, MutateUserMealBody>({
      query: data => ({
        url: 'api/user-meals/',
        method: 'POST',
        body: data
      }),
      onQueryStarted: (post, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(({ data }) => {
          dispatch(
            userMealApiSlice.util.updateQueryData('getMeals', undefined, draft => {
              draft.push(data)
              draft.sort((a, b) => a.order - b.order)
            })
          )
        })
      }
    }),
    patchMeal: builder.mutation<Meal, Partial<MutateUserMealBody> & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `api/user-meal/${id}/`,
        method: 'PATCH',
        body
      }),
      onQueryStarted: (post, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          userMealApiSlice.util.updateQueryData('getMeals', undefined, draft => {
            const index = draft.findIndex(meal => meal.id === post.id)
            if (index !== -1) {
              draft[index] = { ...draft[index], ...post }
            }
          })
        )

        queryFulfilled.catch(() => {
          patchResult.undo()
        })
      }
    }),
    deleteMeal: builder.mutation<void, string>({
      query: id => ({
        url: `api/user-meal/${id}/`,
        method: 'DELETE'
      }),
      onQueryStarted: (post, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(() => {
          dispatch(
            userMealApiSlice.util.updateQueryData('getMeals', undefined, draft => {
              const index = draft.findIndex(meal => meal.id === post)
              draft.splice(index, 1)
            })
          )
        })
      }
    })
  })
})

export const { useGetMealsQuery, usePostMealMutation, useDeleteMealMutation, usePatchMealMutation } = userMealApiSlice
