import { ReactNode, useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { ThemeColors } from '../../types/Types'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

type EmbeddedSwitchProps = {
  leftOption: ReactNode
  rightOption: ReactNode
  onSwitchToggle?: () => void
}

const EmbeddedSwitch = ({ leftOption, rightOption, onSwitchToggle }: EmbeddedSwitchProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const [_checked, setChecked] = useState(false)
  const switchPosition = useSharedValue(0)

  const switchStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: switchPosition.value }]
  }))

  const handleSwitchToggle = useCallback(() => {
    setChecked(prevChecked => {
      const newChecked = !prevChecked
      switchPosition.value = withSpring(newChecked ? 24 : 0, { damping: 20 })
      return newChecked
    })
    onSwitchToggle && onSwitchToggle()
  }, [onSwitchToggle, switchPosition])

  return (
    <Pressable onPress={handleSwitchToggle} style={styles.switchContainer}>
      {leftOption}
      <View style={styles.switchTrack}>
        <Animated.View style={[styles.switchThumb, switchStyle]} />
      </View>
      {rightOption}
    </Pressable>
  )
}

export default EmbeddedSwitch

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    switchTrack: {
      width: 48,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.neutral.border,
      justifyContent: 'center',
      marginRight: 8
    },
    switchThumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.accent
    }
  })
