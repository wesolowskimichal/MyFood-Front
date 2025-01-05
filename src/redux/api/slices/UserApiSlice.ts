import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../queries/BaseQueryReauth'
import { User } from '../../../types/Types'

export const userApiSlice = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getUser: builder.query<User, void>({
      query: () => 'api/user/'
    })
  })
})

export const { useGetUserQuery } = userApiSlice
