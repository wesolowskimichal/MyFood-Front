import { ActivityIndicator, Button, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useGetJournalsByDateQuery } from '../../redux/api/slices/JournalApiSlice'
import DateTimePicker from '@react-native-community/datetimepicker'
import { JournalMeal, JournalScreenProps, ThemeColors } from '../../types/Types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../redux/Store'
import { useDispatch } from 'react-redux'
import { toggleTheme } from '../../redux/slices/ThemeSlice'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import { useGetMealsQuery } from '../../redux/api/slices/UserMealSlice'
import Meal from '../../components/meal/Meal'

const Journal = ({ navigation, route }: JournalScreenProps) => {
  const [date, setDate] = useState<Date>(new Date())
  const [journalMeals, setJournalMeals] = useState<JournalMeal[]>([])
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])
  const dispatch = useDispatch<AppDispatch>()

  const {
    data: journalEntries,
    error: journalEntriesError,
    isLoading: journalEntriesLoading
  } = useGetJournalsByDateQuery({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  })

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

      setJournalMeals(Array.from(journalMealsMap.values()))
    }
  }, [journalEntries, meals])

  const handleMealChange = useCallback(() => {
    
  }, [setJournalMeals])

  if (journalEntriesLoading || mealsLoading) return <ActivityIndicator size={'large'} />
  if (journalEntriesError) return <Text>Fetching Journal Entries Error</Text>
  if (mealsError) return <Text>Fetching Meals Error</Text>

  return (
    <ScreenWrapper>
      <ScrollView style={styles.Wrapper} nestedScrollEnabled>
        <Button onPress={() => dispatch(toggleTheme())} title="Toggle Theme" />
        {journalMeals.map(journalMeal => (
          <Meal key={journalMeal.meal.id} journalMeal={journalMeal} />
        ))}
      </ScrollView>
    </ScreenWrapper>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    Wrapper: {
      flex: 1,
      backgroundColor: colors.primary
    }
  })

export default Journal
