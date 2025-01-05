import { ColorValue, Pressable, ScrollView, Text, View } from 'react-native'
import { RecipeScreenProps } from '../../types/Types'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { useGetUserQuery } from '../../redux/api/slices/UserApiSlice'
import { Image } from 'expo-image'
import StepCreator from '../../components/stepCreator/StepCreator'
import ProductInserter from '../../components/productInserter/ProductInserter'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import { GetLikes } from '../../helpers/GetLikes'
import { ReactNode } from 'react'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'

const Recipe = ({ route, navigation }: RecipeScreenProps) => {
  const { recipe } = route.params
  console.log(recipe)
  const { data: user, isLoading: isUserLoading } = useGetUserQuery()
  const isOwner = user?.id === recipe.added_by.id

  const colors = useSelector((state: RootState) => state.theme.colors)

  const timeFormatter = (time: string) => {
    const [_hours, _minutes] = time.split(':')
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
            // onPress={() => navigation.navigate('RecipeEdit', { recipe })}
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
          <Text>{recipe.description}</Text>
        </Section>

        <Section title="Products">
          <ProductInserter type="view" navigation={navigation} data={recipe.products} />
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
