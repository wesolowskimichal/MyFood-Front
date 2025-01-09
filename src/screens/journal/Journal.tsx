import { ActivityIndicator, Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useGetJournalsByDateQuery } from '../../redux/api/slices/JournalApiSlice'
import { JournalScreenProps, Nutrients, ThemeColors } from '../../types/Types'
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
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import { setJournalRefetch } from '../../redux/slices/JournalSlice'

const Journal = ({ navigation }: JournalScreenProps) => {
  const dispatch = useDispatch<AppDispatch>()

  const [date, setDate] = useState<Date>(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [proteins, setProteins] = useState(0)
  const [fats, setFats] = useState(0)
  const [carbs, setCarbs] = useState(0)

  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const journalRefetch = useSelector((state: RootState) => state.journalRefetch.journalRefetch)

  const {
    data: journal,
    error: isJournalError,
    isLoading: isJournalLoading,
    isFetching: isJournalFetching,
    refetch
  } = useGetJournalsByDateQuery(getDate(date))

  useEffect(() => {
    if (journalRefetch) {
      console.log('refetching')
      refetch()
      dispatch(setJournalRefetch(false))
    }
  }, [journalRefetch])

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

  const handleOnAddMealClick = useCallback(() => {
    navigation.navigate('MealsConfig')
  }, [navigation])

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
      <Button onPress={handleOnAddMealClick} title="Add Meal" />
      {isJournalLoading || isJournalFetching ? (
        <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator animating={true} color={colors.accent} size="large" />
        </View>
      ) : !isJournalLoading && !isJournalFetching && journal?.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
            height: '100%',
            width: '100%'
          }}
        >
          <MaterialIcon name="error-outline" size={100} color="#CD5C5C" />
          <View
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10
            }}
          >
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#CD5C5C', fontWeight: '700', fontSize: 20 }}>No meals found</Text>
              <Text style={{ color: '#CD5C5C', fontWeight: '500', fontSize: 14 }}>Add meals to your journal</Text>
            </View>
            <Pressable
              onPress={handleOnAddMealClick}
              style={{
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 10,
                borderWidth: 1,
                borderColor: '#CD5C5C',
                padding: 8,
                borderRadius: 4
              }}
            >
              <MaterialIcon name="add" size={24} color="#CD5C5C" />
              <Text style={{ color: '#CD5C5C', fontWeight: '700', fontSize: 16 }}>Add meal</Text>
            </Pressable>
          </View>
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
