import { useCallback } from 'react'
import { useDataQuery } from '../../redux/slices/dataStore/hooks/useDataQuery'
import { Recipe } from '../../types/Types'
import RecipeItemList from './_RecipeItemList'
import RecipeItemTile from './_RecipeItemTile'
import { useLikeRecipeMutation } from '../../redux/api/slices/RecipeApiSlice'

export type RecipeItemProps = {
  recipe: Recipe
  type?: 'tile' | 'list'
}

const RecipeItem = ({ recipe, type = 'tile' }: RecipeItemProps) => {
  const { editItem, deleteItem } = useDataQuery<Recipe, Partial<Recipe>>({
    storeName: 'Recipes'
  })
  const [likeRecipe, { isLoading: isLiking }] = useLikeRecipeMutation()

  const handleLikeRecipe = useCallback(
    (id: string, value: boolean) => {
      likeRecipe(id)
      console.log({ id, value })
      editItem(id, { ...recipe, is_liked: value, likes: value ? recipe.likes + 1 : recipe.likes - 1 })
    },
    [editItem, likeRecipe]
  )
  return type === 'tile' ? (
    <RecipeItemTile recipe={recipe} onLikeToggle={handleLikeRecipe} onRecipeRemove={deleteItem} />
  ) : (
    <RecipeItemList recipe={recipe} onLikeToggle={handleLikeRecipe} onRecipeRemove={deleteItem} />
  )
}

export default RecipeItem
