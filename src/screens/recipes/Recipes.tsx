import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, StyleSheet, Text, View, TextInput, Pressable } from 'react-native'
import { RecipesScreenProps, ThemeColors, Recipe as IRecipe } from '../../types/Types'
import { useGetRecipesQuery, useRemoveRecipeMutation } from '../../redux/api/slices/RecipeApiSlice'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import ListItemSkeleton from '../../components/listItemSkeleton/ListItemSkeleton'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import Icon from 'react-native-vector-icons/Feather'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import EmbeddedSwitch from '../../components/embeddedSwitch/EmbeddedSwitch'
import Loader from '../../components/loader/Loader'
import UpperLoader from '../../components/upperLoader/UpperLoader'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import RecipeItem from '../../components/recipeItem/RecipeItem'

const Recipes = ({ navigation }: RecipesScreenProps) => {
  const dispatch = useAppDispatch()

  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const [filters, setFilters] = useState<Record<string, any>>({
    'is-liked': false,
    shared: false,
    name: undefined
  })

  const [deletedRecipes, setDeletedRecipes] = useState<string[]>([])
  const [viewType, setViewType] = useState<'tile' | 'list'>('tile')
  const [page, setPage] = useState(1)

  const {
    data: { recipes: recipesApi, isFinished } = { recipes: [], isFinished: true },
    isLoading,
    isFetching
  } = useGetRecipesQuery({ page, filters })

  const [removeRecipe] = useRemoveRecipeMutation()

  const recipes = useMemo(
    () => recipesApi.filter(recipe => !deletedRecipes.includes(recipe.id)),
    [recipesApi, deletedRecipes]
  )

  const handleLoadMoreRecipes = useCallback(() => {
    if (!isFetching && !isFinished) {
      setPage(prevPage => prevPage + 1)
    }
  }, [isFetching, recipes])

  const handleRemoveRecipe = useCallback(
    async (id: string) => {
      try {
        await removeRecipe(id)
        setDeletedRecipes(prevRecipes => [...prevRecipes, id])
      } catch (error) {
        console.error(error)
      }
    },
    [dispatch]
  )

  const handleLikeRecipe = useCallback((id: string) => {}, [])

  const renderItem = ({ item }: { item: IRecipe }) => (
    <RecipeItem recipe={item} onLikeToggle={handleLikeRecipe} onRecipeRemove={handleRemoveRecipe} />
  )

  const handleSwitchToggle = useCallback(() => {
    setViewType(prevType => (prevType === 'tile' ? 'list' : 'tile'))
  }, [])

  const handleOnAddRecipeClick = useCallback(() => {
    navigation.navigate('AddRecipe')
  }, [navigation])

  const areFiltersEmpty = useMemo(
    () => Object.values(filters).every(value => (value === undefined ? true : value === '' || !value)),
    [filters]
  )

  if (isLoading && page === 1) {
    return <Loader />
  }

  return (
    <ScreenWrapper>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={filters.name}
          onChangeText={text => setFilters({ ...filters, name: text })}
          placeholder="Search recipe"
          placeholderTextColor={colors.neutral.text}
        />
        <EmbeddedSwitch
          leftOption={
            <Icon name="grid" size={20} color={viewType === 'tile' ? colors.accent : colors.neutral.border} />
          }
          rightOption={
            <Icon name="list" size={20} color={viewType === 'list' ? colors.accent : colors.neutral.border} />
          }
          onSwitchToggle={handleSwitchToggle}
        />
      </View>
      {isFetching && <UpperLoader />}
      {!isFetching && !isLoading && recipes.length === 0 ? (
        <View style={styles.noRecipes}>
          <MaterialIcon name="error-outline" size={100} color="#CD5C5C" />
          <View style={styles.noRecipesTextContainer}>
            <Text style={styles.noRecipesText}>No recipes found</Text>
            {areFiltersEmpty ? (
              <Text style={styles.suggestionText}>Add recipes to your list</Text>
            ) : (
              <Text style={styles.suggestionText}>Try changing your filters</Text>
            )}
            <Pressable onPress={handleOnAddRecipeClick} style={styles.addRecipeButton}>
              <MaterialIcon name="add" size={24} color="#CD5C5C" />
              <Text style={styles.addRecipeButtonText}>Add Recipe</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          key={viewType}
          data={recipes}
          numColumns={viewType === 'tile' ? 2 : 1}
          style={{ paddingHorizontal: 5 }}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onEndReached={handleLoadMoreRecipes}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFinished ? null : <ListItemSkeleton width="100%" height={100} borderRadius={10} />}
        />
      )}
      <Pressable style={styles.addRecipeIconButton} onPress={handleOnAddRecipeClick}>
        <MaterialIcon name="add" size={32} color={colors.accent} />
      </Pressable>
    </ScreenWrapper>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
      paddingHorizontal: 5
    },
    input: {
      flex: 1,
      borderColor: colors.neutral.border,
      color: colors.neutral.text,
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      marginRight: 10
    },
    recipeItem: {
      flex: 1,
      margin: 5
    },
    addRecipeIconButton: {
      position: 'absolute',
      bottom: 16,
      right: 16,
      borderColor: colors.accent,
      borderWidth: 1,
      padding: 4,
      borderRadius: 10
    },
    noRecipes: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
      height: '100%',
      width: '100%'
    },
    noRecipesTextContainer: {
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10
    },
    noRecipesText: {
      color: '#CD5C5C',
      fontWeight: '700',
      fontSize: 20
    },
    suggestionText: {
      color: '#CD5C5C',
      fontWeight: '500',
      fontSize: 14
    },
    addRecipeButton: {
      flexDirection: 'row',
      gap: 10,
      borderWidth: 1,
      borderColor: '#CD5C5C',
      padding: 8,
      borderRadius: 8
    },
    addRecipeButtonText: {
      color: '#CD5C5C',
      fontWeight: '700',
      fontSize: 16
    }
  })

export default Recipes
