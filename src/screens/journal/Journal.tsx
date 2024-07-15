import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { useGetJournalQuery } from '../../redux/api/slices/JournalApiSlice'
import { JournalScreenProps } from '../../types/Types'

const Journal = ({ navigation, route }: JournalScreenProps) => {
  const { data, error, isLoading } = useGetJournalQuery()

  if (isLoading) return <ActivityIndicator size={'large'} />
  if (error) return <Text>Error fetching data</Text>

  return (
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
  )
}

export default Journal
