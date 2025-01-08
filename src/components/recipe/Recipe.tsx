import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native'
import { Recipe as IRecipe, ThemeColors, Nutrients, RootStackParamList, JournalEntity } from '../../types/Types'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import Icon from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import { CountKcal } from '../../helpers/CountKcal'
import { NavigationProp } from '@react-navigation/native'
import Dialog, { DialogContent, DialogTrigger } from '../dialog/Dialog'
import { useDeleteJournalMutation, usePatchJournalMutation } from '../../redux/api/slices/JournalApiSlice'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'

type RecipeProps = {
  navigation: NavigationProp<RootStackParamList>
  recipeEntity: JournalEntity<IRecipe>
  defaultServings: number
  onNutrientsChange: (
    carbsDiff: number,
    proteinsDiff: number,
    fatsDiff: number,
    servings: number,
    object: IRecipe
  ) => void
  destructor: (recipe: IRecipe, servings: number) => void
}

const Recipe = ({ navigation, recipeEntity, defaultServings, onNutrientsChange, destructor }: RecipeProps) => {
  const [patchRecipeEntity] = usePatchJournalMutation()
  const [
    removeRecipeEntity,
    {
      isLoading: isRemoveRecipeEntityLoading,
      isError: isRemoveRecipeEntityError,
      isSuccess: isRemoveRecipeEntitySuccess
    }
  ] = useDeleteJournalMutation()

  const [servings, setServings] = useState<number>(defaultServings)
  const [shouldDecrease, setShouldDecrease] = useState(true)
  const [isRemoveProductDialogVisible, setIsRemoveProductDialogVisible] = useState(false)
  const servingsRef = useRef(servings)

  const [proteins, setProteins] = useState(0)
  const [fats, setFats] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const kcal = useMemo(() => CountKcal({ proteins: proteins, fats: fats, carbs: carbs }), [fats, carbs, proteins])

  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const getScaledNutrients = useCallback(
    (recipe: IRecipe, scale: number) => ({
      proteins: recipe.protein * scale,
      carbs: recipe.carbons * scale,
      fats: recipe.fat * scale
    }),
    []
  )

  useEffect(() => {
    return () => {
      destructor(recipeEntity.object.entry, servingsRef.current)
    }
  }, [])

  useEffect(() => {
    servingsRef.current = servings
  }, [servings])

  useEffect(() => {
    setServings(defaultServings)
    updateNutrients(getScaledNutrients(recipeEntity.object.entry, defaultServings / recipeEntity.object.entry.servings))
  }, [defaultServings, recipeEntity.object.entry])

  const updateNutrients = useCallback((nutrients: Nutrients) => {
    setProteins(Math.floor(nutrients.proteins))
    setCarbs(Math.floor(nutrients.carbs))
    setFats(Math.floor(nutrients.fats))
  }, [])

  const handleOnProductInfoClick = useCallback(() => {
    navigation.navigate('Recipe', { recipe: recipeEntity.object.entry })
  }, [recipeEntity.object.entry])

  const handleOnRecipeEntityRemove = useCallback(async () => {
    removeRecipeEntity(recipeEntity.id)
  }, [recipeEntity.id])

  const handleServingsChange = useCallback(
    (text: string) => {
      const numericValue = parseFloat(text)
      setServings(prev => {
        if (isNaN(numericValue) || numericValue <= 0) {
          if (shouldDecrease) {
            const nutrientsNew = getScaledNutrients(
              recipeEntity.object.entry,
              prev / recipeEntity.object.entry.servings
            )
            const nutrients_ = { proteins: 0, fats: 0, carbs: 0 }
            updateNutrients(nutrients_)
            onNutrientsChange(
              Math.floor(nutrientsNew.carbs),
              Math.floor(nutrientsNew.proteins),
              Math.floor(nutrientsNew.fats),
              0,
              recipeEntity.object.entry
            )
            setShouldDecrease(false)
          }
          patchRecipeEntity({
            journalId: recipeEntity.id,
            body: {
              object_type: 'recipe',
              object: recipeEntity.object.entry,
              object_amount: 0,
              meal: recipeEntity.object.meal
            }
          })
          return 0
        }
        setShouldDecrease(true)
        const amount = numericValue
        const nutrientsNew = getScaledNutrients(recipeEntity.object.entry, amount / recipeEntity.object.entry.servings)
        const proteinsDiff = proteins - nutrientsNew.proteins
        const carbsDiff = carbs - nutrientsNew.carbs
        const fatsDiff = fats - nutrientsNew.fats
        updateNutrients(nutrientsNew)
        onNutrientsChange(carbsDiff, proteinsDiff, fatsDiff, amount, recipeEntity.object.entry)
        patchRecipeEntity({
          journalId: recipeEntity.id,
          body: {
            object_type: 'recipe',
            object: recipeEntity.object.entry,
            object_amount: amount,
            meal: recipeEntity.object.meal
          }
        })
        return amount
      })
    },
    [onNutrientsChange, proteins, carbs, fats, servings, recipeEntity.object.entry, shouldDecrease, updateNutrients]
  )

  useEffect(() => {
    if (isRemoveRecipeEntitySuccess) {
      setIsRemoveProductDialogVisible(false)
    }
  }, [isRemoveRecipeEntitySuccess])

  return (
    <View style={styles.Product}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable
          onPress={handleOnProductInfoClick}
          style={{
            borderRadius: 4,
            borderWidth: 1,
            borderColor: colors.accent,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 1
          }}
        >
          <Ionicons name="information" size={14} color={colors.accent} />
        </Pressable>
        <Dialog visible={isRemoveProductDialogVisible} setVisible={setIsRemoveProductDialogVisible}>
          <DialogTrigger style={styles.DialogTrigger}>
            <EntypoIcon name="cross" size={14} color={colors.complementary.danger} />
          </DialogTrigger>
          <DialogContent style={styles.DialogContent}>
            <Text style={styles.DialogContentText}>Are you sure you want to remove this item from Journal?</Text>
            <View style={styles.DialogContentButtonsWrapper}>
              <Pressable
                onPress={handleOnRecipeEntityRemove}
                disabled={isRemoveRecipeEntityLoading}
                style={[
                  styles.DialogContentButton,
                  { backgroundColor: '#CD5C5C', flexDirection: 'row', justifyContent: 'center', gap: 5 }
                ]}
              >
                <Text style={{ color: colors.primary }}>Yes</Text>
                {!isRemoveRecipeEntityLoading && !isRemoveRecipeEntityError && !isRemoveRecipeEntitySuccess && (
                  <Icon name="trash-2" size={14} color={colors.primary} />
                )}
                {isRemoveRecipeEntityLoading && <ActivityIndicator color={colors.primary} />}
                {isRemoveRecipeEntityError && <AntDesignIcon name="close" size={24} color={colors.primary} />}
                {isRemoveRecipeEntitySuccess && <AntDesignIcon name="check" size={24} color={colors.primary} />}
              </Pressable>
              <Pressable style={styles.DialogContentButton} onPress={() => setIsRemoveProductDialogVisible(false)}>
                <Text>No</Text>
              </Pressable>
            </View>
          </DialogContent>
        </Dialog>
      </View>
      <View style={styles.Row}>
        <Text style={styles.ProductName}>{recipeEntity.object.entry.name}</Text>
        <TextInput
          style={styles.AmountInput}
          value={servings?.toString() ?? 0}
          keyboardType="numeric"
          onChangeText={handleServingsChange}
        />
      </View>
      <View style={styles.Row}>
        <Text style={styles.NutrientValue}>{kcal}</Text>
        <Text style={styles.NutrientValue}>{proteins}</Text>
        <Text style={styles.NutrientValue}>{carbs}</Text>
        <Text style={styles.NutrientValue}>{fats}</Text>
      </View>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    Product: {
      marginVertical: 8,
      borderRadius: 4,
      padding: 8,
      backgroundColor: colors.neutral.surface,
      elevation: 4
    },
    Row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 4,
      gap: 16
    },
    ProductName: {
      color: colors.neutral.text,
      fontWeight: '500',
      fontSize: 16,
      flex: 2
    },
    AmountInput: {
      borderColor: colors.neutral.text,
      borderWidth: 1,
      borderRadius: 4,
      width: 42,
      height: 36,
      textAlign: 'center',
      color: colors.neutral.text
    },

    NutrientValue: {
      color: colors.complementary.info,
      fontSize: 12,
      flex: 1,
      textAlign: 'center'
    },
    ModalViewBottom: {
      backgroundColor: 'black'
    },
    ModalViewMiddle: {
      backgroundColor: 'black'
    },
    ModalViewTop: {
      backgroundColor: 'black'
    },
    DialogTrigger: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.complementary.danger,
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

export default memo(Recipe)
