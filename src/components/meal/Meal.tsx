import { memo, useMemo, useState } from 'react'
import { Meal as IMeal, JournalMeal, ThemeColors } from '../../types/Types'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import Collapsible, { CollapsibleContent, CollapsibleHeader } from '../collapsible/Collapsible'
import Icon from 'react-native-vector-icons/Ionicons'
import Product from '../product/Product'

type MealProps = {
  journalMeal: JournalMeal
}

const Meal = ({ journalMeal }: MealProps) => {
  console.log(journalMeal.elements)

  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const [currentProteins, setCurrentProteins] = useState(0)
  const [currentFats, setCurrentFats] = useState(0)
  const [currentCarbs, setCurrentCarbs] = useState(0)

  return (
    <Collapsible collapsibleStyle={styles.Meal}>
      <CollapsibleHeader>
        <View style={styles.HeaderContainer}>
          <View style={styles.MealInfo}>
            <View style={styles.MealHeader}>
              <Text style={styles.MealName}>{journalMeal.meal.name}</Text>
              <Pressable>
                <Icon name="add-circle-outline" size={23} color={colors.accent} />
              </Pressable>
            </View>
            <View style={styles.NutrientTable}>
              <View style={styles.NutrientRow}>
                <Text style={styles.NutrientLabel}></Text>
                <Text style={styles.NutrientHeader}>P</Text>
                <Text style={styles.NutrientHeader}>C</Text>
                <Text style={styles.NutrientHeader}>F</Text>
              </View>
              {journalMeal.meal.target_carbons !== null &&
                journalMeal.meal.target_fat !== null &&
                journalMeal.meal.target_proteins !== null && (
                  <View style={styles.NutrientRow}>
                    <Text style={styles.NutrientLabel}>T:</Text>
                    <Text style={styles.NutrientValue}>{journalMeal.meal.target_proteins ?? '-'}</Text>
                    <Text style={styles.NutrientValue}>{journalMeal.meal.target_proteins ?? '-'}</Text>
                    <Text style={styles.NutrientValue}>{journalMeal.meal.target_fat ?? '-'}</Text>
                  </View>
                )}

              <View style={styles.NutrientRow}>
                <Text style={styles.NutrientLabel}></Text>
                <Text style={styles.NutrientValue}>{currentProteins}</Text>
                <Text style={styles.NutrientValue}>{currentCarbs}</Text>
                <Text style={styles.NutrientValue}>{currentFats}</Text>
              </View>
            </View>
          </View>
        </View>
      </CollapsibleHeader>
      <CollapsibleContent itemStyle={styles.CollapsibleContent}>
        <View style={styles.MealDetails}>
          {journalMeal.elements.map(element => (
            <Product key={element.obj.id} product={element.obj} defaultAmount={element.amount} />
          ))}

          {/* other details */}
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
      borderRadius: 10,
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
