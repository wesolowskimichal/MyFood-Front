import { createApi } from '@reduxjs/toolkit/dist/query/react'
import { baseQueryWithReauth } from '../queries/BaseQueryReauth'
import { Recipe, RecipePage, User } from '../../../types/Types'

type GetRecipesQueryParams = {
  'is-liked'?: boolean
  shared?: boolean
  name?: string
  user?: User['id']
}

type GetRecipesResponse = {
  recipes: Recipe[]
  isFinished: boolean
}

type MutateRecipeBody = {
  name: string
  description: string
  products: {
    product_id: string
    amount_needed: number
  }[]
  preparation: string
  time: string
  difficulty: 'easy' | 'medium' | 'hard'
  servings: number
  picture?: string
}

export const recipeApiSlice = createApi({
  reducerPath: 'recipeApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Recipe'],
  endpoints: builder => ({
    getRecipes: builder.query<GetRecipesResponse, GetRecipesQueryParams>({
      query: () => 'api/recipes/',
      providesTags: result =>
        result
          ? [{ type: 'Recipe', id: 'LIST' }, ...result.recipes.map(({ id }) => ({ type: 'Recipe' as const, id }))]
          : [{ type: 'Recipe', id: 'LIST' }],
      transformResponse: (response: RecipePage) => ({
        recipes: response.results,
        isFinished: !response.next
      })
    }),
    addRecipe: builder.mutation<Recipe, MutateRecipeBody>({
      query: recipe => ({
        url: 'api/recipes/',
        method: 'POST',
        body: recipe
      }),
      onQueryStarted(_recipe, { dispatch, queryFulfilled }) {
        queryFulfilled.then(({ data }) => {
          dispatch(
            recipeApiSlice.util.updateQueryData('getRecipes', {}, draft => {
              draft.recipes.push(data)
            })
          )
        })
      }
    }),
    getRecipeById: builder.query<Recipe, string>({
      query: id => `api/recipes/${id}/`,
      providesTags: recipe => (recipe ? [{ type: 'Recipe', id: recipe.id }] : [])
    }),
    patchRecipe: builder.query<Recipe, Partial<MutateRecipeBody> & { id: string }>({
      query: ({ id, ...recipe }) => ({
        url: `api/recipes/${id}/`,
        method: 'PATCH',
        body: recipe
      }),
      onQueryStarted(_recipe, { dispatch, queryFulfilled }) {
        queryFulfilled.then(({ data }) => {
          dispatch(
            recipeApiSlice.util.updateQueryData('getRecipes', {}, draft => {
              const index = draft.recipes.findIndex(recipe => recipe.id === data.id)
              draft.recipes[index] = data
            })
          )
        })
      }
    }),
    deleteRecipe: builder.mutation<void, string>({
      query: id => ({
        url: `api/recipes/${id}/`,
        method: 'DELETE'
      }),
      onQueryStarted(_id, { dispatch, queryFulfilled }) {
        queryFulfilled.then(() => {
          dispatch(
            recipeApiSlice.util.updateQueryData('getRecipes', {}, draft => {
              const index = draft.recipes.findIndex(recipe => recipe.id === _id)
              draft.recipes.splice(index, 1)
            })
          )
        })
      },
      invalidatesTags: [{ type: 'Recipe', id: 'LIST' }]
    })
  })
})

export const {
  useGetRecipesQuery,
  useAddRecipeMutation,
  useGetRecipeByIdQuery,
  usePatchRecipeQuery,
  useDeleteRecipeMutation
} = recipeApiSlice
