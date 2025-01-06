import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../queries/BaseQueryReauth'
import { Recipe, RecipePage, User } from '../../../types/Types'

type GetRecipesQueryParams = {
  page: number
  filters?: {
    'is-liked'?: boolean
    shared?: boolean
    name?: string
    user?: User['id']
  }
}

type GetRecipesResponse = {
  recipes: Recipe[]
  isFinished: boolean
}

type MutateRecipeBody =
  | {
      name: string
      description: string
      products: {
        product_id: string
        amount_needed: number
      }[]
      preparation: string
      time: string
      difficulty: string
      servings: number
      picture?: string
    }
  | FormData

export const recipeApiSlice = createApi({
  reducerPath: 'recipeApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Recipe'],
  endpoints: builder => ({
    getRecipes: builder.query<GetRecipesResponse, GetRecipesQueryParams>({
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
          url: `api/recipes/?${queryParams.toString()}`,
          method: 'GET'
        }
      },
      providesTags: result =>
        result
          ? [{ type: 'Recipe', id: 'LIST' }, ...result.recipes.map(({ id }) => ({ type: 'Recipe' as const, id }))]
          : [{ type: 'Recipe', id: 'LIST' }],
      transformResponse: (response: RecipePage) => ({
        recipes: response.results,
        isFinished: !response.next
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { filters = {} } = queryArgs ?? {}
        return `${endpointName}-${JSON.stringify(filters)}`
      },
      merge: (existing, incoming, { arg }) => {
        const { page = 1 } = arg

        if (page === 1 || !existing) {
          return incoming
        }

        const mergedRecipes = [
          ...existing.recipes,
          ...incoming.recipes.filter(
            incomingRecipe => !existing.recipes.some(existingRecipe => existingRecipe.id === incomingRecipe.id)
          )
        ]

        return {
          recipes: mergedRecipes,
          isFinished: incoming.isFinished
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page
      }
    }),
    likeRecipe: builder.mutation<Recipe, string>({
      query: id => ({
        url: `api/recipe/like/${id}`,
        method: 'POST'
      }),
      onQueryStarted(_recipe, { dispatch, queryFulfilled }) {
        queryFulfilled.then(({ data }) => {
          dispatch(
            recipeApiSlice.util.updateQueryData('getRecipes', { page: 1 }, draft => {
              const index = draft.recipes.findIndex(recipe => recipe.id === data.id)
              draft.recipes[index] = data
            })
          )
        })
      }
    }),
    addRecipe: builder.mutation<Recipe, MutateRecipeBody>({
      query: recipe => ({
        url: 'api/recipes/',
        method: 'POST',
        body: recipe,
        headers: recipe instanceof FormData ? {} : { 'Content-Type': 'application/json' }
      })
    }),
    getRecipeById: builder.query<Recipe, string>({
      query: id => `api/recipe/${id}/`,
      providesTags: recipe => (recipe ? [{ type: 'Recipe', id: recipe.id }] : [])
    }),
    patchRecipe: builder.mutation<Recipe, Partial<MutateRecipeBody> & { id: string }>({
      query: ({ id, ...recipe }) => ({
        url: `api/recipe/${id}/`,
        method: 'PATCH',
        body: recipe
      }),
      onQueryStarted(_recipe, { dispatch, queryFulfilled }) {
        queryFulfilled.then(({ data }) => {
          dispatch(
            recipeApiSlice.util.updateQueryData('getRecipes', { page: 1 }, draft => {
              const index = draft.recipes.findIndex(recipe => recipe.id === data.id)
              draft.recipes[index] = data
            })
          )
        })
      }
    }),
    removeRecipe: builder.mutation<void, string>({
      query: id => ({
        url: `api/recipe/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Recipe', id: 'LIST' },
        { type: 'Recipe', id }
      ]
    })
  })
})

export const {
  useGetRecipesQuery,
  useAddRecipeMutation,
  useGetRecipeByIdQuery,
  useLazyGetRecipeByIdQuery,
  usePatchRecipeMutation,
  useLikeRecipeMutation,
  useRemoveRecipeMutation
} = recipeApiSlice
