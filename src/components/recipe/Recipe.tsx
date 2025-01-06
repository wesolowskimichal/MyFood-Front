import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native'
import { Recipe as IRecipe, ThemeColors, Nutrients, RootStackParamList } from '../../types/Types'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import Icon from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import { CountKcal } from '../../helpers/CountKcal'
import { NavigationProp } from '@react-navigation/native'
import Dialog, { DialogContent, DialogTrigger } from '../dialog/Dialog'

type RecipeProps = {
  navigation: NavigationProp<RootStackParamList>
  recipe: IRecipe
  defaultServings: number
  onNutrientsChange: (
    carbsDiff: number,
    proteinsDiff: number,
    fatsDiff: number,
    servings: number,
    object: IRecipe
  ) => void
  onRecipeRemove: (recipe: IRecipe) => void
  destructor: (recipe: IRecipe, servings: number) => void
}

const Recipe = ({
  navigation,
  recipe,
  defaultServings,
  onNutrientsChange,
  onRecipeRemove,
  destructor
}: RecipeProps) => {
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
      destructor(recipe, servingsRef.current)
    }
  }, [])

  useEffect(() => {
    servingsRef.current = servings
  }, [servings])

  useEffect(() => {
    updateNutrients(getScaledNutrients(recipe, servings / recipe.servings))
  }, [recipe])

  const updateNutrients = useCallback((nutrients: Nutrients) => {
    setProteins(Math.floor(nutrients.proteins))
    setCarbs(Math.floor(nutrients.carbs))
    setFats(Math.floor(nutrients.fats))
  }, [])

  const handleOnProductInfoClick = useCallback(() => {
    navigation.navigate('Recipe', { recipe: recipe })
  }, [])

  const handleOnRecipeRemove = useCallback(async () => {
    onRecipeRemove(recipe)
  }, [onRecipeRemove])

  const handleServingsChange = useCallback(
    (text: string) => {
      const numericValue = parseFloat(text)
      setServings(prev => {
        if (isNaN(numericValue) || numericValue <= 0) {
          if (shouldDecrease) {
            const nutrientsNew = getScaledNutrients(recipe, prev / recipe.servings)
            const nutrients_ = { proteins: 0, fats: 0, carbs: 0 }
            updateNutrients(nutrients_)
            onNutrientsChange(
              Math.floor(nutrientsNew.carbs),
              Math.floor(nutrientsNew.proteins),
              Math.floor(nutrientsNew.fats),
              0,
              recipe
            )
            setShouldDecrease(false)
          }
          return 0
        }
        setShouldDecrease(true)
        const amount = numericValue
        const nutrientsNew = getScaledNutrients(recipe, amount / recipe.servings)
        const proteinsDiff = proteins - nutrientsNew.proteins
        const carbsDiff = carbs - nutrientsNew.carbs
        const fatsDiff = fats - nutrientsNew.fats
        updateNutrients(nutrientsNew)
        onNutrientsChange(carbsDiff, proteinsDiff, fatsDiff, amount, recipe)
        return amount
      })
    },
    [onNutrientsChange, proteins, carbs, fats, servings, recipe, shouldDecrease, updateNutrients]
  )

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
                onPress={handleOnRecipeRemove}
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
      </View>
      <View style={styles.Row}>
        <Text style={styles.ProductName}>{recipe.name}</Text>
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
