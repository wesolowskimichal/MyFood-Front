import React, { useCallback, useMemo, useState } from 'react'
import { FlatList, StyleSheet, Text, View, TextInput, Pressable } from 'react-native'
import { ThemeColors, Recipe as IRecipe, RecipesListScreenProps, Meal } from '../../types/Types'
import { useGetRecipesQuery } from '../../redux/api/slices/RecipeApiSlice'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import ListItemSkeleton from '../../components/listItemSkeleton/ListItemSkeleton'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import Icon from 'react-native-vector-icons/Feather'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import Loader from '../../components/loader/Loader'
import UpperLoader from '../../components/upperLoader/UpperLoader'
import Animated, { LinearTransition, SlideInLeft, SlideOutRight } from 'react-native-reanimated'
import { useGetUserQuery } from '../../redux/api/slices/UserApiSlice'
import { Image } from 'expo-image'

const RecipesList = ({ navigation, route }: RecipesListScreenProps) => {
  const { meal } = route.params
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const [filters, setFilters] = useState<Record<string, any>>({
    is_liked: undefined,
    user: undefined,
    name: undefined
  })

  const [page, setPage] = useState(1)
  const [servings, setServings] = useState(1)

  const {
    data: { recipes, isFinished } = { recipes: [], isFinished: true },
    isLoading,
    isFetching
  } = useGetRecipesQuery({ page, filters })

  const { data: user, isLoading: isUserLoading } = useGetUserQuery()

  const handleLoadMoreRecipes = useCallback(() => {
    if (!isFetching && !isFinished) {
      setPage(prevPage => prevPage + 1)
    }
  }, [isFetching, recipes])

  const renderItem = ({ item }: { item: IRecipe }) => {
    return <RecipeInfoBar key={item.id} recipe={item} navigation={navigation} servings={servings} meal={meal} />
  }

  const areFiltersEmpty = useMemo(
    () => Object.values(filters).every(value => (value === undefined ? true : value === '' || !value)),
    [filters]
  )

  if ((isLoading && page === 1) || isUserLoading) {
    return <Loader />
  }

  return (
    <ScreenWrapper>
      <View>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={filters.name}
            onChangeText={text => setFilters({ ...filters, name: text })}
            placeholder="Search recipe"
            placeholderTextColor={colors.neutral.border}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 10,
            backgroundColor: colors.neutral.border,
            padding: 8,
            borderRadius: 4,
            marginHorizontal: 5
          }}
        >
          <Pressable onPress={() => setFilters({ ...filters, is_liked: true, user: undefined })}>
            <Text
              style={{
                color: filters.is_liked ? colors.accent : colors.neutral.background,
                fontSize: 15,
                fontWeight: '700'
              }}
            >
              Liked Recipes
            </Text>
          </Pressable>
          <Pressable onPress={() => setFilters({ ...filters, is_liked: undefined, user: undefined })}>
            <Text
              style={{
                color: !filters.is_liked && !filters.user ? colors.accent : colors.neutral.background,
                fontSize: 15,
                fontWeight: '700'
              }}
            >
              All recipes
            </Text>
          </Pressable>
          <Pressable onPress={() => setFilters({ ...filters, is_liked: undefined, user: user?.id })}>
            <Text
              style={{
                color: filters.user ? colors.accent : colors.neutral.background,
                fontSize: 15,
                fontWeight: '700'
              }}
            >
              My Recipes
            </Text>
          </Pressable>
        </View>
        <View style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
          <Text style={{ fontSize: 14, color: colors.neutral.text, marginBottom: 8 }}>Servings</Text>
          <TextInput
            style={{
              textAlign: 'center',
              borderWidth: 1,
              borderColor: colors.neutral.border,
              borderRadius: 4,
              padding: 4,
              paddingHorizontal: 8,
              marginBottom: 16,
              backgroundColor: colors.neutral.surface,
              color: colors.neutral.text
            }}
            keyboardType="numeric"
            onChangeText={text => {
              const numberValue = parseInt(text, 10)
              if (numberValue < 0) {
                setServings(0)
              } else {
                setServings(isNaN(numberValue) ? 0 : numberValue)
              }
            }}
            value={servings.toString()}
          />
        </View>
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
          </View>
        </View>
      ) : (
        <Animated.View
          entering={SlideInLeft}
          exiting={SlideOutRight}
          style={{
            flex: 1,
            padding: 4
          }}
        >
          <FlatList
            data={recipes}
            style={{ paddingHorizontal: 5 }}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            onEndReached={handleLoadMoreRecipes}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{ gap: 10 }}
            ListFooterComponent={isFinished ? null : <ListItemSkeleton width="100%" height={100} borderRadius={4} />}
          />
        </Animated.View>
      )}
    </ScreenWrapper>
  )
}

const RecipeInfoBar = ({
  recipe,
  navigation,
  servings,
  meal
}: {
  recipe: IRecipe
  navigation: RecipesListScreenProps['navigation']
  servings: number
  meal?: Meal
}) => {
  const colors = useSelector((state: RootState) => state.theme.colors)

  const scale = servings / recipe.servings

  const handleOnRecipeInfoClick = () => {
    navigation.navigate('Recipe', { recipe })
  }

  const handleOnRecipeClick = () => {
    navigation.navigate('AddProductToComponent', { meal, journalRecipe: { ...recipe, servings } })
  }

  return (
    <Animated.View
      layout={LinearTransition.springify()}
      entering={SlideInLeft}
      exiting={SlideOutRight}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 4,
        backgroundColor: colors.neutral.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 10
      }}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: recipe.picture }} style={{ width: 60, height: 60, borderRadius: 4, marginRight: 12 }} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginVertical: 4
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: '600', color: colors.neutral.text, marginBottom: 4 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {recipe.name}
            </Text>
            <Pressable onPress={handleOnRecipeInfoClick}>
              <Icon name="info" size={14} color={colors.accent} />
            </Pressable>
          </View>
          <Text style={{ color: colors.neutral.text, fontSize: 12 }}>Difficulty: {recipe.difficulty}</Text>
          <Text style={{ color: colors.neutral.text, fontSize: 12 }}>Likes: {recipe.likes}</Text>
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 8,
              justifyContent: 'space-between'
            }}
          >
            <Text
              style={{ color: colors.neutral.text, flex: 1, fontSize: 12, textAlign: 'center' }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {`P: ${Math.floor(recipe.protein * scale)}`}
            </Text>
            <Text
              style={{ color: colors.neutral.text, flex: 1, fontSize: 12, textAlign: 'center' }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >{`C: ${Math.floor(recipe.carbons * scale)}`}</Text>
            <Text
              style={{ color: colors.neutral.text, flex: 1, fontSize: 12, textAlign: 'center' }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >{`F: ${Math.floor(recipe.fat * scale)}`}</Text>
          </View>
          <Pressable
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              borderWidth: 2,
              borderColor: colors.accent
            }}
            onPress={handleOnRecipeClick}
          >
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 14 }}>Add</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
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
      borderRadius: 4,
      padding: 10
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
      borderRadius: 4
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

export default RecipesList
