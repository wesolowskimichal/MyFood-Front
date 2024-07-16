import { ReactNode, useMemo } from 'react'
import { RootStackParamList, ThemeColors } from '../../types/Types'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { SafeAreaView } from 'react-native-safe-area-context'

type ScreenWrapperProps = {
  children: ReactNode
}

const ScreenWrapper = ({ children }: ScreenWrapperProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  return <SafeAreaView style={styles.root}>{children}</SafeAreaView>
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.primary
    }
  })

export default ScreenWrapper
