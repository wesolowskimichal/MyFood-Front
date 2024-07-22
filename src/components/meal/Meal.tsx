import { memo, useMemo, useState } from 'react'
import { Meal as IMeal, ThemeColors } from '../../types/Types'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import Collapsible, { CollapsibleContent, CollapsibleHeader } from '../collapsible/Collapsible'

type MealProps = {
  meal: IMeal
}

const Meal = ({ meal }: MealProps) => {
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
            <Text style={styles.MealName}>{meal.name}</Text>
            <View style={styles.NutrientTable}>
              <View style={styles.NutrientRow}>
                <Text style={styles.NutrientLabel}></Text>
                <Text style={styles.NutrientHeader}>P</Text>
                <Text style={styles.NutrientHeader}>C</Text>
                <Text style={styles.NutrientHeader}>F</Text>
              </View>
              {meal.target_carbons !== null && meal.target_fat !== null && meal.target_proteins !== null && (
                <View style={styles.NutrientRow}>
                  <Text style={styles.NutrientLabel}>T:</Text>
                  <Text style={styles.NutrientValue}>{meal.target_proteins ?? '-'}</Text>
                  <Text style={styles.NutrientValue}>{meal.target_proteins ?? '-'}</Text>
                  <Text style={styles.NutrientValue}>{meal.target_fat ?? '-'}</Text>
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
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>
          <Text style={styles.MealDetail}>Order: {meal.order}</Text>

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
