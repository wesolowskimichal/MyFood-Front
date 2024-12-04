import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Recipe, ThemeColors } from '../../types/Types'
import Animated, { LinearTransition, SlideInLeft, SlideOutRight } from 'react-native-reanimated'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { memo, useMemo } from 'react'
import { useRemoveRecipeMutation } from '../../redux/api/slices/RecipeApiSlice'
import { Image } from 'expo-image'
import ADIcon from 'react-native-vector-icons/AntDesign'
import Icon from 'react-native-vector-icons/Feather'

type RecipeItemProps = {
  recipe: Recipe
  onLikeToggle: (id: string, value: boolean) => void
  onRecipeRemove: (id: string) => void
}

export const RecipeItemTile = ({ recipe, onLikeToggle, onRecipeRemove }: RecipeItemProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])
  const [removeRecipe, { isLoading: isRemovingRecipe }] = useRemoveRecipeMutation()

  const handleRemove = async () => {
    try {
      await removeRecipe(recipe.id)
      onRecipeRemove(recipe.id)
    } catch (error) {
      console.log(error)
    }
  }

  const handleOnLikeToggle = () => {
    onLikeToggle(recipe.id, !recipe.is_liked)
  }

  return (
    <Animated.View
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: colors.neutral.border,
        borderRadius: 4,
        backgroundColor: colors.neutral.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5
      }}
      layout={LinearTransition.springify()}
      entering={SlideInLeft}
      exiting={SlideOutRight}
    >
      <Image source={{ uri: recipe.picture }} style={{ width: '100%', aspectRatio: 1 }} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{recipe.name}</Text>
        <Text style={styles.productDetails}>Difficulty: {recipe.difficulty}</Text>
        <Text style={styles.productDetails}>Likes: {recipe.likes}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={handleOnLikeToggle}
          style={[styles.likeButton, recipe.is_liked && { backgroundColor: colors.accent }]}
        >
          <ADIcon
            name={recipe.is_liked ? 'heart' : 'hearto'}
            size={20}
            color={recipe.is_liked ? colors.primary : colors.accent}
          />
          <Text style={{ color: recipe.is_liked ? colors.primary : colors.accent, fontWeight: '500' }}>
            {recipe.is_liked ? 'LIKED' : 'LIKE'}
          </Text>
        </Pressable>
        <Pressable onPress={handleRemove} style={styles.removeButton} disabled={isRemovingRecipe}>
          {isRemovingRecipe ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Icon name="trash-2" size={16} color="#FFF" />
          )}
        </Pressable>
      </View>
    </Animated.View>
  )
}

export default memo(RecipeItemTile)

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    productItem: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 8,
      backgroundColor: colors.neutral.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      marginBottom: 10
    },
    productImage: {
      width: 60,
      height: 60,
      borderRadius: 4,
      marginRight: 12
    },
    productInfo: {
      flex: 1,
      padding: 4,
      justifyContent: 'center'
    },
    productName: {
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '600',
      color: colors.neutral.text,
      borderBottomWidth: 1,
      marginBottom: 4
    },
    productDetails: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.neutral.text
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      paddingHorizontal: 4,
      paddingVertical: 2
    },
    likeButton: {
      flex: 1,
      borderWidth: 2,
      borderRadius: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      borderColor: colors.accent,
      maxWidth: 100,
      padding: 2
    },
    removeButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#CD5C5C',
      padding: 8,
      borderRadius: 4
    }
  })
