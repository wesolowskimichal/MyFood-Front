import { Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useGetJournalsByDateQuery } from '../../redux/api/slices/JournalApiSlice'
import { JournalMeal, JournalScreenProps, Nutrients, ThemeColors } from '../../types/Types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../redux/Store'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import { useGetMealsQuery } from '../../redux/api/slices/UserMealSlice'
import Meal from '../../components/meal/Meal'
import NutrientsBar from '../../components/nutrientsBar/NutrientsBar'
import { NutrientsCounterMap } from '../../helpers/NutrientsCounter'
import Loader from '../../components/loader/Loader'
import { getDate } from '../../helpers/GetDate'
import DateTimePicker from '@react-native-community/datetimepicker'
import FeatherIcon from 'react-native-vector-icons/Feather'
import { toggleTheme } from '../../redux/slices/ThemeSlice'

const Journal = ({ navigation, route }: JournalScreenProps) => {
  // for theme tests only
  const dispatch = useDispatch<AppDispatch>()

  const [date, setDate] = useState<Date>(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [journalMeals, setJournalMeals] = useState<JournalMeal[]>([])

  const [proteins, setProteins] = useState(0)
  const [fats, setFats] = useState(0)
  const [carbs, setCarbs] = useState(0)

  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const {
    data: journalEntries,
    error: journalEntriesError,
    isLoading: journalEntriesLoading
  } = useGetJournalsByDateQuery(getDate(date))

  const { data: meals, error: mealsError, isLoading: mealsLoading } = useGetMealsQuery()

  useEffect(() => {
    if (journalEntries && meals) {
      const journalMealsMap = meals.results.reduce((acc, meal) => {
        acc.set(meal.id, { meal, elements: [] })
        return acc
      }, new Map<string, JournalMeal>())

      if (Array.isArray(journalEntries)) {
        journalEntries.reduce((acc, entry) => {
          const mealId = entry.object.meal.id
          if (!acc.has(mealId)) {
            acc.set(mealId, { meal: entry.object.meal, elements: [] })
          }
          acc.get(mealId)!.elements.push({
            obj: entry.object.entry,
            amount: entry.object.amount
          })
          return acc
        }, journalMealsMap)
      }

      const journalMeals = Array.from(journalMealsMap.values()).map(journalMeal => {
        return {
          ...journalMeal,
          journalId: journalEntries.find(entry => entry.object.meal.id === journalMeal.meal.id)?.id
        }
      })
      console.log(journalMeals)
      setJournalMeals(journalMeals)
      const nutrients: Nutrients = journalMeals.reduce(
        (acc, curr) => {
          const nutrients = NutrientsCounterMap(curr)
          return {
            proteins: acc.proteins + nutrients.proteins,
            fats: acc.fats + nutrients.fats,
            carbs: acc.carbs + nutrients.carbs
          }
        },
        { proteins: 0, carbs: 0, fats: 0 }
      )
      updateNutrients(nutrients)
    }
  }, [journalEntries, meals])

  const updateNutrients = useCallback((nutrients: Nutrients) => {
    setProteins(Math.floor(nutrients.proteins))
    setCarbs(Math.floor(nutrients.carbs))
    setFats(Math.floor(nutrients.fats))
  }, [])

  const handleOnNutrientsChange = useCallback((carbsDiff: number, proteinsDiff: number, fatsDiff: number) => {
    setProteins(prev => Math.floor(prev - proteinsDiff))
    setFats(prev => Math.floor(prev - fatsDiff))
    setCarbs(prev => Math.floor(prev - carbsDiff))
  }, [])

  const onDateChange = useCallback((_event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setDate(selectedDate)
    }
  }, [])

  if (journalEntriesLoading || mealsLoading) return <Loader />
  if (journalEntriesError) return <Text>Fetching Journal Entries Error</Text>
  if (mealsError) return <Text>Fetching Meals Error</Text>

  const dateStruct = getDate(date)

  return (
    <ScreenWrapper>
      {/* // for theme tests only */}
      <Button onPress={() => dispatch(toggleTheme())} title="Toggle Theme" />
      <ScrollView style={styles.wrapper} nestedScrollEnabled>
        <View style={styles.dateWrapper}>
          <Pressable onPress={() => setShowDatePicker(true)} style={styles.date}>
            <Text style={{ color: colors.neutral.text, fontWeight: 500 }}>
              {dateStruct.day.toString().padStart(2, '0')}/{dateStruct.month.toString().padStart(2, '0')}/
              {dateStruct.year}
            </Text>
            <FeatherIcon name="calendar" size={24} color={colors.accent} />
          </Pressable>
        </View>
        {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />}
        {journalMeals.map((journalMeal, index) => (
          <Meal
            key={`${journalMeal.meal.id}-${index}`}
            journalMeal={journalMeal}
            onNutrientsChange={handleOnNutrientsChange}
            navigation={navigation}
          />
        ))}
      </ScrollView>
      <NutrientsBar proteins={proteins} fats={fats} carbs={carbs} />
    </ScreenWrapper>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: colors.primary
    },
    dateWrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: colors.neutral.surface
    },
    date: {
      paddingVertical: 8,
      paddingHorizontal: 24,
      flexBasis: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: colors.neutral.border,
      borderRadius: 8
    }
  })

export default Journal
