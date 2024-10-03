import { StyleSheet, Text } from 'react-native'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import { RecipesScreenProps, ThemeColors } from '../../types/Types'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { useMemo } from 'react'

const Recipes = ({ navigation }: RecipesScreenProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <ScreenWrapper>
      <Text>Recipes</Text>
    </ScreenWrapper>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral.background
    }
  })

export default Recipes
