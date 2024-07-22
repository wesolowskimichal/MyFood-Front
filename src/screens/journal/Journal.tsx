import { ActivityIndicator, Button, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useGetJournalsByDateQuery } from '../../redux/api/slices/JournalApiSlice'
import DateTimePicker from '@react-native-community/datetimepicker'
import { JournalScreenProps, ThemeColors } from '../../types/Types'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../redux/Store'
import { useDispatch } from 'react-redux'
import { toggleTheme } from '../../redux/slices/ThemeSlice'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import { useGetMealsQuery } from '../../redux/api/slices/UserMealSlice'
import Meal from '../../components/meal/Meal'

const Journal = ({ navigation, route }: JournalScreenProps) => {
  const [date, setDate] = useState<Date>(new Date())
  const [show, setShow] = useState<boolean>(false)

  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])
  const dispatch = useDispatch<AppDispatch>()

  const onChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date
    setShow(false)
    setDate(currentDate)
  }

  const { data, error, isLoading } = useGetJournalsByDateQuery({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  })

  const { data: meals, error: mealsError, isLoading: areMealsLoading } = useGetMealsQuery()

  if (isLoading || areMealsLoading) return <ActivityIndicator size={'large'} />
  if (error) return <Text>Error fetching data</Text>

  return (
    <ScreenWrapper>
      <ScrollView style={styles.Wrapper} nestedScrollEnabled>
        <Button onPress={() => dispatch(toggleTheme())} title="Toggle Theme" />
        {/* <Button onPress={() => setShow(true)} title="Select Date" />
        {show && (
          <DateTimePicker testID="dateTimePicker" value={date} mode={'date'} display="default" onChange={onChange} />
        )} */}
        {meals?.results.map(meal => (
          <Meal key={meal.id} meal={meal} />
        ))}
        {/* <Text>{JSON.stringify(data?.results)}</Text> */}
        {/* <FlatList
          data={data?.results}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View>
              <Text>{item.id}</Text>
              <Text>{JSON.stringify(item.object)}</Text>
              <Text>{JSON.stringify(item.object)}</Text>
            </View>
          )}
          ListHeaderComponent={() => (
            <View>
              <Text>Total Journals: {data?.count}</Text>
            </View>
          )}
        /> */}
      </ScrollView>
    </ScreenWrapper>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    Wrapper: {
      flex: 1,
      backgroundColor: colors.primary
      // justifyContent: 'flex-start'
    }
  })

export default Journal
