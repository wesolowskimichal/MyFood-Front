import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native'
import { RootState } from '../../redux/Store'
import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import { ThemeColors } from '../../types/Types'

const Loader = () => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])
  return (
    <Modal animationType="fade">
      <View style={styles.Wrapper}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    </Modal>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    Wrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary,
      flex: 1
    }
  })

export default Loader
