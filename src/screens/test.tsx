import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { useGetFridgesQuery } from '../redux/api/FridgeApiSlice'

const FridgeList = () => {
  const { data, error, isLoading } = useGetFridgesQuery()

  if (isLoading) return <ActivityIndicator />
  if (error) return <Text>Error fetching data</Text>

  return (
    <FlatList
      data={data?.results}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.product.name}</Text>
          <Text>{item.current_amount}</Text>
          <Text>{item.threshold}</Text>
        </View>
      )}
      ListHeaderComponent={() => (
        <View>
          <Text>Total Fridges: {data?.count}</Text>
        </View>
      )}
    />
  )
}

export default FridgeList
