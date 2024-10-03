import { createApi } from '@reduxjs/toolkit/query/react'
import { Fridge, FridgePage, ProductBase, ProductDetails } from '../../../types/Types'
import { baseQueryWithReauth } from '../queries/BaseQueryReauth'

type GetFridgeQueryParams = {
  'is-on-shopping-list'?: boolean
  'show-below-threshold'?: boolean
  'product-name'?: string
}

type PostFrigeBody = {
  product: ProductDetails
  current_amount: number
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
    getFridges: builder.query<
      { fridgeProducts: Fridge[]; isFinished: boolean },
      { page: number; filters?: Record<string, any> }
    >({
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
      transformResponse: (response: FridgePage) => ({ fridgeProducts: response.results, isFinished: !response.next }),

      providesTags: result =>
        result
          ? [
              ...result.fridgeProducts.map(({ product }) => ({
                type: 'Fridge' as const,
                id: product.id
              })),
              { type: 'Fridge', id: 'PARTIAL_LIST' }
            ]
          : [{ type: 'Fridge', id: 'PARTIAL_LIST' }]
    }),
    getFridgeById: builder.query<Fridge, string>({
      query: id => `api/fridge/${id}/`
    }),
    addFridgeProduct: builder.mutation<Fridge, PostFrigeBody>({
      query: ({ product, current_amount }) => ({
        url: 'api/fridge/',
        method: 'POST',
        body: {
          product_barcode: product.barcode,
          current_amount,
          threshold: 0,
          is_on_shopping_list: false
        }
      }),
      invalidatesTags: [{ type: 'Fridge', id: 'PARTIAL_LIST' }],
      onQueryStarted: async ({ product }, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled
          dispatch(
            fridgeApiSlice.util.updateQueryData('getFridges', { page: 1 }, draft => {
              draft.fridgeProducts.push(data)
            })
          )
        } catch (error) {
          console.error('Failed to add fridge product:', error)
        }
      }
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
              const fridgeIndex = draft.fridgeProducts.findIndex(f => f.id === id)
              if (fridgeIndex !== -1) {
                draft.fridgeProducts[fridgeIndex].current_amount = body.current_amount
                console.log('found fridge product:', draft.fridgeProducts[fridgeIndex])
              }
            })
          )
        } catch (error) {
          console.error('Failed to update fridge product:', error)
        }
      }
    }),
    removeFridgeProduct: builder.mutation<{ success: boolean }, string>({
      query: id => ({
        url: `api/fridge/${id}/`,
        method: 'DELETE'
      }),
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          fridgeApiSlice.util.updateQueryData('getFridges', { page: 1 }, draft => {
            const index = draft.fridgeProducts.findIndex(fridge => fridge.id === id)
            if (index !== -1) draft.fridgeProducts.splice(index, 1)
          })
        )
        try {
          await queryFulfilled
        } catch (error) {
          patchResult.undo()
          console.error('Failed to delete fridge product:', error)
        }
      },
      invalidatesTags: [{ type: 'Fridge', id: 'PARTIAL_LIST' }]
    })
  })
})

export const {
  useGetFridgesQuery,
  useLazyGetFridgesQuery,
  useGetFridgeByIdQuery,
  useAddFridgeProductMutation,
  usePatchFridgeProductMutation,
  useRemoveFridgeProductMutation
} = fridgeApiSlice
