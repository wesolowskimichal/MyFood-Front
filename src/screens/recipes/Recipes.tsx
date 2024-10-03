import { Text } from 'react-native'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import { RecipesScreenProps } from '../../types/Types'

const Recipes = ({ navigation }: RecipesScreenProps) => {
  return (
    <ScreenWrapper>
      <Text>Recipes</Text>
    </ScreenWrapper>
  )
}

export default Recipes
