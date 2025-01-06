import { ColorValue, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { RecipeScreenProps } from '../../types/Types'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { useGetUserQuery } from '../../redux/api/slices/UserApiSlice'
import { Image } from 'expo-image'
import StepCreator from '../../components/stepCreator/StepCreator'
import ProductInserter from '../../components/productInserter/ProductInserter'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import { ReactNode, useEffect, useState } from 'react'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import { useDataQuery } from '../../redux/slices/dataStore/hooks/useDataQuery'
import { useLazyGetRecipeByIdQuery } from '../../redux/api/slices/RecipeApiSlice'

const Recipe = ({ route, navigation }: RecipeScreenProps) => {
  const { recipe: _recipe } = route.params
  const { data: user, isLoading: isUserLoading } = useGetUserQuery()
  const [getRecipe] = useLazyGetRecipeByIdQuery()
  const [recipe, setRecipe] = useState(_recipe)
  const [servings, setServings] = useState(recipe.servings)
  const isOwner = user?.id === recipe.added_by.id

  const { items, deleteItem } = useDataQuery<{
    recipe_id: string
  }>({
    storeName: 'RefreshStore'
  })

  useEffect(() => {
    const fetchRecipe = async () => {
      const response = await getRecipe(recipe.id).unwrap()
      setRecipe(response)
      deleteItem(recipe.id)
    }
    if (items('recipe_id').some(item => item.recipe_id === recipe.id)) {
      fetchRecipe()
    }
  }, [items])

  const colors = useSelector((state: RootState) => state.theme.colors)

  const timeFormatter = (time: string) => {
    const [_, _hours, _minutes] = time.split(':')
    const minutes = _minutes.replace(/^0+/, '')
    const hours = _hours.replace(/^0+/, '')
    if (hours.length === 0) return `${minutes}m`
    return `${hours}h ${minutes}m`
  }

  const getTextDifficultyColor = (difficulty: string): ColorValue => {
    switch (difficulty) {
      case 'easy':
        return '#A5D6A7'
      case 'medium':
        return '#FBC02D'
      case 'hard':
        return '#EF9A9A'
      default:
        return '#F00'
    }
  }

  return (
    <ScreenWrapper>
      <View>
        {isOwner && (
          <Pressable
            style={{ position: 'absolute', right: 16, top: 8, zIndex: 10 }}
            onPress={() => navigation.navigate('EditRecipe', { recipe })}
          >
            <AntDesignIcon name="edit" size={24} color={colors.accent} />
          </Pressable>
        )}
      </View>
      <ScrollView style={{ flex: 1, padding: 16, backgroundColor: colors.primary }}>
        <View style={{ alignItems: 'center', marginBottom: 6 }}>
          <Image
            source={{ uri: recipe.picture }}
            style={{
              width: '100%',
              aspectRatio: 1,
              borderRadius: 4,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: colors.neutral.border
            }}
          />
          <View style={{ position: 'relative', paddingVertical: 12, paddingHorizontal: 16 }}>
            <Text
              style={{
                color: getTextDifficultyColor(recipe.difficulty),
                position: 'absolute',
                right: 0,
                top: 0,
                fontSize: 14,
                fontWeight: '800'
              }}
            >
              {recipe.difficulty.toUpperCase()}
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                textAlign: 'center',
                color: colors.neutral.text
              }}
            >
              {recipe.name}
            </Text>
          </View>
        </View>

        <Section title="Description" height={120}>
          <Text style={{ color: colors.neutral.text, fontWeight: '700' }}>{`Time: ${timeFormatter(recipe.time)}`}</Text>
          <View
            style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 16, color: colors.neutral.text, marginBottom: 8 }}>Servings</Text>
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
          <Text>{recipe.description}</Text>
        </Section>

        <Section title="Products">
          <ProductInserter
            type="view"
            navigation={navigation}
            data={recipe.products}
            scale={servings / recipe.servings}
          />
        </Section>

        <Section title="Steps">
          <StepCreator type="view" data={recipe.preparation} />
        </Section>
      </ScrollView>
    </ScreenWrapper>
  )
}

const Section = ({ title, children, height }: { title: string; children: ReactNode; height?: number }) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.accent,
          marginBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.accent,
          paddingHorizontal: 5
        }}
      >
        {title}
      </Text>
      <ScrollView nestedScrollEnabled style={{ maxHeight: height }}>
        {children}
      </ScrollView>
    </View>
  )
}

export default Recipe
