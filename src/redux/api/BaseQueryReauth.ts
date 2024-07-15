import { BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './BaseQuery'
import { refreshAccessToken } from '../../utils/Auth'
import { store } from '../Store'

export const baseQueryWithReauth = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: {}) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    const newAccessToken = await refreshAccessToken(store)
    if (newAccessToken) {
      result = await baseQuery(args, api, extraOptions)
    }
  }

  return result
}
