import { createApi } from '@reduxjs/toolkit/query/react'
import { Fridge, FridgePage } from '../../../types/Types'
import { baseQueryWithReauth } from '../querys/BaseQueryReauth'

export const fridgeApiSlice = createApi({
  reducerPath: 'fridgeApi',
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getFridges: builder.query<FridgePage, void>({
      query: () => 'api/fridge/'
    }),
    getFridgeById: builder.query<Fridge, string>({
      query: id => `api/fridge/${id}/`
    }),
    createFridge: builder.mutation<Fridge, Partial<Fridge>>({
      query: newFridge => ({
        url: 'api/fridge/',
        method: 'POST',
        body: newFridge
      })
    }),
    updateFridge: builder.mutation<Fridge, { id: string; fridge: Partial<Fridge> }>({
      query: ({ id, fridge }) => ({
        url: `api/fridge/${id}/`,
        method: 'PUT',
        body: fridge
      })
    }),
    patchFridge: builder.mutation<Fridge, { id: string; fridge: Partial<Fridge> }>({
      query: ({ id, fridge }) => ({
        url: `api/fridge/${id}/`,
        method: 'PATCH',
        body: fridge
      })
    }),
    deleteFridge: builder.mutation<{ success: boolean }, string>({
      query: id => ({
        url: `api/fridge/${id}/`,
        method: 'DELETE'
      })
    })
  })
})

export const {
  useGetFridgesQuery,
  useGetFridgeByIdQuery,
  useCreateFridgeMutation,
  useUpdateFridgeMutation,
  usePatchFridgeMutation,
  useDeleteFridgeMutation
} = fridgeApiSlice
