import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Recipe, ThemeColors } from '../../types/Types'
import Animated, { LinearTransition, SlideInLeft, SlideOutRight } from 'react-native-reanimated'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { memo, useMemo, useState } from 'react'
import { useRemoveRecipeMutation } from '../../redux/api/slices/RecipeApiSlice'
import { Image } from 'expo-image'
import ADIcon from 'react-native-vector-icons/AntDesign'

import Icon from 'react-native-vector-icons/Feather'
import Dialog, { DialogContent } from '../dialog/Dialog'

type RecipeItemProps = {
  isOwner: boolean
  recipe: Recipe
  onLikeToggle: (id: string, value: boolean) => void
  onRecipeRemove: (id: string) => void
  onClick?: (recipe: Recipe) => void
}

export const RecipeItemList = ({ isOwner, recipe, onLikeToggle, onRecipeRemove, onClick }: RecipeItemProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])
  const [removeRecipe, { isLoading: isRemovingRecipe }] = useRemoveRecipeMutation()

  const [isRemoveProductDialogVisible, setIsRemoveProductDialogVisible] = useState(false)

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

  const handleOnRecipeClick = () => {
    onClick?.(recipe)
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
      <TouchableOpacity onPress={handleOnRecipeClick} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: recipe.picture }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
            {recipe.name}
          </Text>
          <Text style={styles.productDetails}>Difficulty: {recipe.difficulty}</Text>
          <Text style={styles.productDetails}>Likes: {recipe.likes}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleOnLikeToggle} style={styles.likeButton}>
          <ADIcon name={recipe.is_liked ? 'heart' : 'hearto'} size={20} color={colors.accent} />
        </TouchableOpacity>
        {isOwner && (
          <Pressable
            onPress={() => setIsRemoveProductDialogVisible(true)}
            style={styles.removeButton}
            disabled={isRemovingRecipe}
          >
            {isRemovingRecipe ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Icon name="trash-2" size={18} color="#FFF" />
            )}
          </Pressable>
        )}
      </View>
      <Dialog visible={isRemoveProductDialogVisible} setVisible={setIsRemoveProductDialogVisible}>
        <DialogContent style={styles.DialogContent}>
          <Text style={styles.DialogContentText}>Are you sure you want to remove this Recipe?</Text>
          <View style={styles.DialogContentButtonsWrapper}>
            <Pressable
              onPress={handleRemove}
              style={[
                styles.DialogContentButton,
                { backgroundColor: '#CD5C5C', flexDirection: 'row', justifyContent: 'center', gap: 5 }
              ]}
            >
              <Text style={{ color: colors.primary }}>Yes</Text>
              <Icon name="trash-2" size={14} color={colors.primary} />
            </Pressable>
            <Pressable style={styles.DialogContentButton} onPress={() => setIsRemoveProductDialogVisible(false)}>
              <Text>No</Text>
            </Pressable>
          </View>
        </DialogContent>
      </Dialog>
    </Animated.View>
  )
}

export default memo(RecipeItemList)

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
      justifyContent: 'space-between',
      gap: 10
    },
    likeButton: {
      marginRight: 10
    },
    removeButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#CD5C5C',
      padding: 12,
      borderRadius: 4
    },
    DialogContent: {
      flexDirection: 'column',
      gap: 24
    },
    DialogContentText: {
      color: colors.neutral.text,
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '600'
    },
    DialogContentButtonsWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    DialogContentButton: {
      borderWidth: 1,
      borderColor: colors.neutral.border,
      borderRadius: 4,
      padding: 10,
      width: 100,
      justifyContent: 'center',
      alignItems: 'center'
    }
  })
