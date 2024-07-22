import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../querys/BaseQueryReauth'
import { MealPage } from '../../../types/Types'

export const userMealApiSlice = createApi({
  reducerPath: 'userMealApi',
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getMeals: builder.query<MealPage, void>({
      query: () => 'api/user-meals/',
      keepUnusedDataFor: 500
    })
  })
})

export const { useGetMealsQuery } = userMealApiSlice
