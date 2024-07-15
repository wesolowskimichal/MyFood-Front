import { ActivityIndicator, Button, FlatList, Text, View } from 'react-native'
import { useGetJournalsByDateQuery } from '../../redux/api/slices/JournalApiSlice'
import DateTimePicker from '@react-native-community/datetimepicker'

import { JournalScreenProps } from '../../types/Types'
import { useState } from 'react'

const Journal = ({ navigation, route }: JournalScreenProps) => {
  const [date, setDate] = useState<Date>(new Date())
  const [show, setShow] = useState<boolean>(false)

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
    <View style={{ flex: 1, padding: 16 }}>
      <Button onPress={() => setShow(true)} title="Select Date" />
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
  )
}

export default Journal
