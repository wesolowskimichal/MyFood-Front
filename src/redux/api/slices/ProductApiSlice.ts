import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../queries/BaseQueryReauth'
import { ProductDetails, ProductPage } from '../../../types/Types'

export const productApiSlice = createApi({
  reducerPath: 'productApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product', 'Journal'],
  endpoints: builder => ({
    getProducts: builder.query<ProductPage, { page: number; filters?: Record<string, any> }>({
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
          url: `api/products?${queryParams.toString()}`,
          method: 'GET'
        }
      },
      providesTags: (result, _error, { page }) =>
        result
          ? [
              ...result.results.flatMap(({ barcode, name }) => {
                const tags = []
                if (barcode) {
                  tags.push({ type: 'Product' as const, id: `BARCODE-${barcode}` })
                }
                if (name) {
                  tags.push({ type: 'Product' as const, id: `NAME-${name}` })
                }
                return tags
              }),
              { type: 'Product' as const, id: 'PARTIAL_LIST' },
              { type: 'Product' as const, id: `PAGE-${page}` }
            ]
          : [{ type: 'Product' as const, id: 'PARTIAL_LIST' }]
    }),
    addProduct: builder.mutation<
      ProductDetails,
      (Omit<ProductDetails, 'added_by' | 'url' | 'id' | 'picture'> & { picture?: File }) | FormData
    >({
      query: product => ({
        url: 'api/products/',
        method: 'POST',
        body: product
      }),
      invalidatesTags: [{ type: 'Product', id: 'PARTIAL_LIST' }]
    }),
    getProduct: builder.query<ProductDetails, ProductDetails['barcode']>({
      query: barcode => `api/product/${barcode}`,
      providesTags: (result, error, barcode) => [{ type: 'Product' as const, id: barcode }]
    }),
    updateProduct: builder.mutation<ProductDetails, Partial<ProductDetails> & Pick<ProductDetails, 'barcode'>>({
      query: product => ({
        url: `api/product/${product.barcode}/`,
        method: 'PUT',
        body: product
      }),
      invalidatesTags: () => [{ type: 'Journal', id: 'BY_DATE' }],
      onQueryStarted({ barcode, ...put }, { dispatch, queryFulfilled }) {
        const putResult = dispatch(
          productApiSlice.util.updateQueryData('getProduct', barcode, draft => {
            Object.assign(draft, put)
          })
        )
        queryFulfilled.catch(putResult.undo)
      }
    }),
    patchProduct: builder.mutation<ProductDetails, Partial<ProductDetails> & Pick<ProductDetails, 'barcode'>>({
      query: product => ({
        url: `api/product/${product.barcode}/`,
        method: 'PATCH',
        body: product
      }),
      invalidatesTags: () => [{ type: 'Journal', id: 'BY_DATE' }],
      onQueryStarted({ barcode, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productApiSlice.util.updateQueryData('getProduct', barcode, draft => {
            Object.assign(draft, patch)
          })
        )
        queryFulfilled.catch(patchResult.undo)
      }
    }),
    deleteProduct: builder.mutation<void, Partial<ProductDetails> & Pick<ProductDetails, 'barcode'>>({
      query: ({ barcode }) => ({
        url: `api/product/${barcode}/`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { barcode }) => [
        { type: 'Product', id: barcode },
        { type: 'Journal', id: 'BY_DATE' }
      ]
    })
  })
})

export const {
  useGetProductQuery,
  useLazyGetProductQuery,
  useUpdateProductMutation,
  usePatchProductMutation,
  useDeleteProductMutation,
  useAddProductMutation,
  useGetProductsQuery,
  useLazyGetProductsQuery
} = productApiSlice
