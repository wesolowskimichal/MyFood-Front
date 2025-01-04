import { ScrollView } from 'react-native'
import { RecipeScreenProps } from '../../types/Types'

const Recipe = ({ route, navigation }: RecipeScreenProps) => {
  const { recipe } = route.params
  
  return <ScrollView></ScrollView>
}

export default Recipe
