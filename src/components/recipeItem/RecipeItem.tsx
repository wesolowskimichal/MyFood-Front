import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { Recipe, ThemeColors } from '../../types/Types'
import Animated, {
  SlideInLeft,
  SlideOutRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/Feather'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'

type RecipeItemProps = {
  recipe: Recipe
  onLikeToggle: (id: string) => void
  onRecipeRemove: (id: string) => void
}

const RecipeItem = ({ recipe, onLikeToggle, onRecipeRemove }: RecipeItemProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])
  const [isRemoving, setIsRemoving] = useState(false)

  // Animation for remove button scale
  const removeButtonScale = useSharedValue(1)

  // Animated style for the remove button
  const removeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: removeButtonScale.value }]
  }))

  // Handle remove product with sliding out animation
  const handleRemove = () => {
    setIsRemoving(true)
    runOnJS(() => onRecipeRemove(recipe.id))()
  }

  // Button press in and out animations
  const handlePressIn = () => {
    removeButtonScale.value = withSpring(0.95)
  }

  const handlePressOut = () => {
    removeButtonScale.value = withSpring(1)
  }

  const handleOnLikeToggle = () => {
    onLikeToggle(recipe.id)
  }

  return (
    <Animated.View style={styles.productItem} entering={SlideInLeft} exiting={SlideOutRight}>
      <Image source={{ uri: recipe.picture }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{recipe.name}</Text>
        <Text style={styles.productDetails}>Difficulty: {recipe.difficulty}</Text>
        <Text style={styles.productDetails}>Likes: {recipe.likes}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={handleOnLikeToggle} style={styles.likeButton}>
          <Icon name={recipe.is_liked ? 'heart' : 'heart-outline'} size={20} color={colors.accent} />
        </Pressable>
        <Pressable
          onPress={handleRemove}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.removeButton}
        >
          <Animated.View style={removeButtonStyle}>
            <Icon name="trash-2" size={18} color="#FFF" />
          </Animated.View>
        </Pressable>
      </View>
    </Animated.View>
  )
}

// Style generator using theme colors
const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    productItem: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
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
      borderRadius: 10,
      marginRight: 12
    },
    productInfo: {
      flex: 1,
      justifyContent: 'center'
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.neutral.text,
      marginBottom: 4
    },
    productDetails: {
      fontSize: 12,
      color: colors.neutral.text
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    likeButton: {
      marginRight: 10
    },
    removeButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#CD5C5C',
      padding: 12,
      borderRadius: 8
    }
  })

export default RecipeItem
