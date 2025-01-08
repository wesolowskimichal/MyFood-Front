import { ActivityIndicator, Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useGetJournalsByDateQuery } from '../../redux/api/slices/JournalApiSlice'
import { JournalEntry, JournalEntity, JournalScreenProps, Nutrients, ThemeColors } from '../../types/Types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../redux/Store'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import Meal from '../../components/meal/Meal'
import NutrientsBar from '../../components/nutrientsBar/NutrientsBar'
import { getDate } from '../../helpers/GetDate'
import DateTimePicker from 'react-native-modal-datetime-picker'
import FeatherIcon from 'react-native-vector-icons/Feather'
import { toggleTheme } from '../../redux/slices/ThemeSlice'
import { NutrientsCounterMap } from '../../helpers/NutrientsCounter'

const Journal = ({ navigation }: JournalScreenProps) => {
  const dispatch = useDispatch<AppDispatch>()

  const [date, setDate] = useState<Date>(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [proteins, setProteins] = useState(0)
  const [fats, setFats] = useState(0)
  const [carbs, setCarbs] = useState(0)

  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const {
    data: journal,
    error: isJournalError,
    isLoading: isJournalLoading,
    isFetching: isJournalFetching
  } = useGetJournalsByDateQuery(getDate(date))

  const handleOnNutrientsChange = useCallback((carbsDiff: number, proteinsDiff: number, fatsDiff: number) => {
    setProteins(prev => Math.floor(prev - proteinsDiff))
    setFats(prev => Math.floor(prev - fatsDiff))
    setCarbs(prev => Math.floor(prev - carbsDiff))
  }, [])

  const onDateChange = useCallback((selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setDate(selectedDate)
    }
  }, [])

  useEffect(() => {
    const nutrients: Nutrients = journal?.reduce(
      (acc, curr) => {
        const nutrients = NutrientsCounterMap(curr)
        return {
          proteins: acc.proteins + nutrients.proteins,
          fats: acc.fats + nutrients.fats,
          carbs: acc.carbs + nutrients.carbs
        }
      },
      { proteins: 0, carbs: 0, fats: 0 }
    ) ?? { proteins: 0, carbs: 0, fats: 0 }

    setProteins(Math.floor(nutrients.proteins))
    setCarbs(Math.floor(nutrients.carbs))
    setFats(Math.floor(nutrients.fats))
  }, [journal])

  if (isJournalError) return <Text>Fetching Journal Entries Error</Text>

  const dateStruct = getDate(date)

  return (
    <ScreenWrapper>
      {/* // for theme tests only */}
      <Button onPress={() => dispatch(toggleTheme())} title="Toggle Theme" />
      {isJournalLoading || isJournalFetching ? (
        <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator animating={true} color={colors.accent} size="large" />
        </View>
      ) : (
        <ScrollView style={styles.wrapper} nestedScrollEnabled>
          <View style={styles.dateWrapper}>
            <Pressable onPress={() => setShowDatePicker(true)} style={styles.date}>
              <Text style={{ color: colors.neutral.text, fontWeight: '500' }}>
                {dateStruct.day.toString().padStart(2, '0')}/{dateStruct.month.toString().padStart(2, '0')}/
                {dateStruct.year}
              </Text>
              <FeatherIcon name="calendar" size={24} color={colors.accent} />
            </Pressable>
          </View>
          <DateTimePicker
            isVisible={showDatePicker}
            mode="date"
            date={new Date(new Date().setHours(0, 0, 0, 0))}
            onConfirm={onDateChange}
            onCancel={() => setShowDatePicker(false)}
          />

          {journal?.map((journalEntry, index) => (
            <Meal
              key={`${journalEntry.meal.id}-${index}`}
              journalEntry={journalEntry}
              onNutrientsChange={handleOnNutrientsChange}
              navigation={navigation}
            />
          ))}
        </ScrollView>
      )}
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
      borderRadius: 4
    }
  })

export default Journal
