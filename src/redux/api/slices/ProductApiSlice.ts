import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../querys/BaseQueryReauth'
import { ProductDetails } from '../../../types/Types'

export const productApiSlice = createApi({
  reducerPath: 'productApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product'],
  endpoints: builder => ({
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
      invalidatesTags: (result, error, { barcode }) => [{ type: 'Product', id: barcode }]
    }),
    patchProduct: builder.mutation<ProductDetails, Partial<ProductDetails> & Pick<ProductDetails, 'barcode'>>({
      query: product => ({
        url: `api/product/${product.barcode}/`,
        method: 'PATCH',
        body: product
      }),
      invalidatesTags: (result, error, { barcode }) => [{ type: 'Product', id: barcode }]
    })
  })
})

export const { useGetProductQuery, useUpdateProductMutation, usePatchProductMutation } = productApiSlice
