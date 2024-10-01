import { createApi } from '@reduxjs/toolkit/query/react'
import { Fridge, FridgePage } from '../../../types/Types'
import { baseQueryWithReauth } from '../queries/BaseQueryReauth'

type GetFridgeQueryParams = {
  'is-on-shopping-list'?: boolean
  'show-below-threshold'?: boolean
  'product-name'?: string
}

type UpdateFridgeBody = {
  current_amount: number
  product_barcode?: string
  treshold?: number
  is_on_shopping_list?: boolean
}

export const fridgeApiSlice = createApi({
  reducerPath: 'fridgeApi',
  tagTypes: ['Fridge'],
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getFridges: builder.query<FridgePage, { page: number; filters?: Record<string, any> }>({
      query: ({ page, filters }) => {
        const queryParams = new URLSearchParams({ page: page.toString() })

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, value.toString())
            }
          })
        }

        return {
          url: `api/fridge/?${queryParams.toString()}`,
          method: 'GET'
        }
      },
      providesTags: (result, _error, { page }) =>
        result
          ? [
              ...result.results.flatMap(({ product }) => {
                const tags = []
                if (product) {
                  tags.push({ type: 'Fridge' as const, id: product.id })
                }
                return tags
              }),
              { type: 'Fridge' as const, id: 'PARTIAL_LIST' }
            ]
          : [{ type: 'Fridge' as const, id: 'PARTIAL_LIST' }]
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
    patchFridgeProduct: builder.mutation<Fridge, { id: string; body: UpdateFridgeBody }>({
      query: ({ id, body }) => ({
        url: `api/fridge/${id}/`,
        method: 'PATCH',
        body: body
      }),
      onQueryStarted: async ({ id, body }, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled

          dispatch(
            fridgeApiSlice.util.updateQueryData('getFridges', { page: 1 }, draft => {
              const fridgeIndex = draft.results.findIndex(f => f.id === id)
              if (fridgeIndex !== -1) {
                draft.results[fridgeIndex].current_amount = body.current_amount
                console.log('found fridge product:', draft.results[fridgeIndex])
              }
            })
          )
        } catch (error) {
          console.error('Failed to update fridge product:', error)
        }
      }
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
  useLazyGetFridgesQuery,
  useGetFridgeByIdQuery,
  useCreateFridgeMutation,
  usePatchFridgeProductMutation,
  useDeleteFridgeMutation
} = fridgeApiSlice
