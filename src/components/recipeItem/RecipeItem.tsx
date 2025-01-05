import { useCallback } from 'react'
import { useDataQuery } from '../../redux/slices/dataStore/hooks/useDataQuery'
import { Recipe } from '../../types/Types'
import RecipeItemList from './_RecipeItemList'
import RecipeItemTile from './_RecipeItemTile'
import { useLikeRecipeMutation } from '../../redux/api/slices/RecipeApiSlice'
import { useGetUserQuery } from '../../redux/api/slices/UserApiSlice'

export type RecipeItemProps = {
  recipe: Recipe
  onClick?: (recipe: Recipe) => void
  type?: 'tile' | 'list'
}

const RecipeItem = ({ recipe, onClick, type = 'tile' }: RecipeItemProps) => {
  const { editItem, deleteItem } = useDataQuery<Recipe, Partial<Recipe>>({
    storeName: 'Recipes'
  })
  const [likeRecipe, { isLoading: isLiking }] = useLikeRecipeMutation()
  const { data: user } = useGetUserQuery()
  const isOwner = user?.id === recipe.added_by.id

  const handleLikeRecipe = useCallback(
    (id: string, value: boolean) => {
      likeRecipe(id)
      editItem(id, { ...recipe, is_liked: value, likes: value ? recipe.likes + 1 : recipe.likes - 1 })
    },
    [editItem, likeRecipe]
  )
  return type === 'tile' ? (
    <RecipeItemTile
      recipe={recipe}
      isOwner={isOwner}
      onLikeToggle={handleLikeRecipe}
      onRecipeRemove={deleteItem}
      onClick={onClick}
    />
  ) : (
    <RecipeItemList
      recipe={recipe}
      isOwner={isOwner}
      onLikeToggle={handleLikeRecipe}
      onRecipeRemove={deleteItem}
      onClick={onClick}
    />
  )
}

export default RecipeItem
