import { ActivityIndicator, Button, FlatList, StyleSheet, Text, View } from 'react-native'
import { useGetJournalsByDateQuery } from '../../redux/api/slices/JournalApiSlice'
import DateTimePicker from '@react-native-community/datetimepicker'
import { JournalScreenProps, ThemeColors } from '../../types/Types'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../redux/Store'
import { useDispatch } from 'react-redux'
import { toggleTheme } from '../../redux/slices/ThemeSlice'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'

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

  if (isLoading) return <ActivityIndicator size={'large'} />
  if (error) return <Text>Error fetching data</Text>

  return (
    <ScreenWrapper>
      <View style={styles.Wrapper}>
        <Button onPress={() => setShow(true)} title="Select Date" />
        <Button onPress={() => dispatch(toggleTheme())} title="Toggle Theme" />
        {show && (
          <DateTimePicker testID="dateTimePicker" value={date} mode={'date'} display="default" onChange={onChange} />
        )}
        <FlatList
          data={data?.results}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View>
              <Text>{item.id}</Text>
              <Text>{JSON.stringify(item.object)}</Text>
            </View>
          )}
          ListHeaderComponent={() => (
            <View>
              <Text>Total Journals: {data?.count}</Text>
            </View>
          )}
        />
      </View>
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
