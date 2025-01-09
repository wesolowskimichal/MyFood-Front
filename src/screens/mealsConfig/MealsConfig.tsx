import { useSelector } from 'react-redux'
import { MealsConfigScreenProps } from '../../types/Types'
import { RootState } from '../../redux/Store'
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native'
import { MealView } from '../../components/meal/MealView'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import { useGetMealsQuery } from '../../redux/api/slices/UserMealSlice'
import { useState } from 'react'

const MealsConfig = ({ navigation }: MealsConfigScreenProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)

  const [isAddingMeal, setIsAddingMeal] = useState(false)

  const { data: meals, isLoading, isFetching } = useGetMealsQuery()

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary, padding: 8 }}>
      {isFetching || isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <View style={{ rowGap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            {isAddingMeal ? (
              <Pressable
                onPress={() => setIsAddingMeal(false)}
                style={{
                  backgroundColor: colors.accent,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 4,
                  gap: 6
                }}
              >
                <MaterialIcon name="do-not-disturb" size={24} color={colors.primary} />
                <Text style={{ color: colors.primary }}>Stop Adding Meal</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => setIsAddingMeal(true)}
                style={{
                  backgroundColor: colors.accent,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 4,
                  gap: 6
                }}
              >
                <MaterialIcon name="add" size={24} color={colors.primary} />
                <Text style={{ color: colors.primary }}>Add Meal</Text>
              </Pressable>
            )}
          </View>

          <ScrollView style={{ marginBottom: 30 }}>
            {isAddingMeal && <MealView onSave={() => setIsAddingMeal(false)} />}
            {/* <FlatList data={meals} keyExtractor={item => item.id} renderItem={({ item }) => <MealView meal={item} />} /> */}
            {meals?.map(meal => (
              <MealView key={meal.id} meal={meal} />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

export default MealsConfig
