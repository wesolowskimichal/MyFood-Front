import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Recipe as IRecipe,
  JournalEntity,
  JournalEntry,
  Nutrients,
  ProductDetails,
  RootStackParamList,
  ThemeColors,
  Unit
} from '../../types/Types'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import Collapsible, { CollapsibleContent, CollapsibleHeader } from '../collapsible/Collapsible'
import Icon from 'react-native-vector-icons/Ionicons'
import Product from '../product/Product'
import { NutrientsCounterMap } from '../../helpers/NutrientsCounter'
import { CountKcal } from '../../helpers/CountKcal'
import { UnitProductConverter } from '../../helpers/UnitAmountConverter'
import { NavigationProp } from '@react-navigation/native'
import Recipe from '../recipe/Recipe'

type MealProps = {
  navigation: NavigationProp<RootStackParamList>
  journalEntry: JournalEntry
  onNutrientsChange: (carbsDiff: number, proteinsDiff: number, fatsDiff: number) => void
}

const Meal = ({ navigation, journalEntry, onNutrientsChange }: MealProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const [proteins, setProteins] = useState(0)
  const [fats, setFats] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const kcal = useMemo(() => CountKcal({ proteins: proteins, fats: fats, carbs: carbs }), [fats, carbs, proteins])

  const [amounts, setAmounts] = useState<{ [id: string]: number }>({})

  const updateNutrients = useCallback((nutrients: Nutrients) => {
    setProteins(Math.floor(nutrients.proteins))
    setCarbs(Math.floor(nutrients.carbs))
    setFats(Math.floor(nutrients.fats))
  }, [])

  useEffect(() => {
    const nutrients = NutrientsCounterMap(journalEntry)
    const amounts = journalEntry.journal_entities.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.object.amount }), {})
    setAmounts(amounts)
    updateNutrients(nutrients)
  }, [journalEntry])

  const productDestructor = useCallback((product: ProductDetails, amount: number, unit: Unit) => {
    const newAmount = UnitProductConverter(amount, unit, product)
    setAmounts(prev => ({ ...prev, [product.id]: newAmount }))
  }, [])

  const recipeDestructor = useCallback((recipe: IRecipe, servings: number) => {
    setAmounts(prev => ({ ...prev, [recipe.id]: servings }))
  }, [])

  const handleOnNutrientsChange = useCallback(
    (carbsDiff: number, proteinsDiff: number, fatsDiff: number) => {
      setProteins(prev => Math.floor(prev - proteinsDiff))
      setFats(prev => Math.floor(prev - fatsDiff))
      setCarbs(prev => Math.floor(prev - carbsDiff))
      onNutrientsChange(carbsDiff, proteinsDiff, fatsDiff)
    },
    [onNutrientsChange]
  )

  const handleOnAddProductClick = useCallback(() => {
    navigation.navigate('AddProductToComponent', { meal: journalEntry.meal })
  }, [navigation, journalEntry])

  return (
    <Collapsible collapsibleStyle={styles.Meal}>
      <CollapsibleHeader>
        <View style={styles.HeaderContainer}>
          <View style={styles.MealInfo}>
            <View style={styles.MealHeader}>
              <Text style={styles.MealName}>{journalEntry.meal.name}</Text>
              <Pressable onPress={handleOnAddProductClick}>
                <Icon name="add-circle-outline" size={23} color={colors.accent} />
              </Pressable>
            </View>
            <View style={styles.NutrientTable}>
              <View style={styles.NutrientRow}>
                <Text style={styles.NutrientLabel}></Text>
                <Text style={styles.NutrientHeader}>kcal</Text>
                <Text style={styles.NutrientHeader}>P</Text>
                <Text style={styles.NutrientHeader}>C</Text>
                <Text style={styles.NutrientHeader}>F</Text>
              </View>
              {journalEntry.meal.target_carbons !== null &&
                journalEntry.meal.target_fat !== null &&
                journalEntry.meal.target_proteins !== null && (
                  <View style={styles.NutrientRow}>
                    <Text style={styles.NutrientLabel}>T:</Text>
                    <Text style={styles.NutrientValue}>
                      {CountKcal({
                        proteins: journalEntry.meal.target_proteins,
                        fats: journalEntry.meal.target_fat,
                        carbs: journalEntry.meal.target_carbons
                      })}
                    </Text>
                    <Text style={styles.NutrientValue}>{journalEntry.meal.target_proteins ?? '-'}</Text>
                    <Text style={styles.NutrientValue}>{journalEntry.meal.target_proteins ?? '-'}</Text>
                    <Text style={styles.NutrientValue}>{journalEntry.meal.target_fat ?? '-'}</Text>
                  </View>
                )}

              <View style={styles.NutrientRow}>
                <Text style={styles.NutrientLabel}></Text>
                <Text style={styles.NutrientValue}>{kcal}</Text>
                <Text style={styles.NutrientValue}>{proteins}</Text>
                <Text style={styles.NutrientValue}>{carbs}</Text>
                <Text style={styles.NutrientValue}>{fats}</Text>
              </View>
            </View>
          </View>
        </View>
      </CollapsibleHeader>
      <CollapsibleContent itemStyle={styles.CollapsibleContent}>
        <View style={styles.MealDetails}>
          {journalEntry.journal_entities.map((journalEntity, index) =>
            journalEntity.object.type === 'product' ? (
              <Product
                key={`${journalEntity.object.entry.id}-${index}`}
                navigation={navigation}
                productEntity={journalEntity as JournalEntity<ProductDetails>}
                defaultAmount={journalEntity.object.amount}
                onNutrientsChange={handleOnNutrientsChange}
                destructor={productDestructor}
              />
            ) : (
              <Recipe
                key={`${journalEntity.object.entry.id}-${index}`}
                navigation={navigation}
                recipeEntity={journalEntity as JournalEntity<IRecipe>}
                defaultServings={journalEntity.object.amount}
                onNutrientsChange={handleOnNutrientsChange}
                destructor={recipeDestructor}
              />
            )
          )}
        </View>
      </CollapsibleContent>
    </Collapsible>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    Meal: {
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 4,
      backgroundColor: colors.neutral.surface,
      shadowColor: colors.neutral.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    HeaderContainer: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    MealInfo: {
      flex: 1
    },
    MealHeader: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    MealName: {
      color: colors.neutral.text,
      fontWeight: 'bold',
      fontSize: 18
    },
    NutrientTable: {
      marginTop: 10,
      flexDirection: 'column'
    },
    NutrientRow: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    NutrientLabel: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: 'bold',
      width: 30
    },
    NutrientHeader: {
      color: colors.complementary.info,
      fontSize: 14,
      fontWeight: 'bold',
      width: 40,
      textAlign: 'center'
    },
    NutrientValue: {
      color: colors.neutral.text,
      fontSize: 14,
      width: 40,
      textAlign: 'center'
    },
    CollapsibleContent: {
      maxHeight: 300
    },
    MealDetails: {
      marginTop: 10
    },
    MealDetail: {
      fontSize: 16,
      marginVertical: 2
    }
  })

export default memo(Meal)
