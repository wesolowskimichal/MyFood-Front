import React, { useEffect, useMemo } from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { ThemeColors } from '../../types/Types'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated'

type UpperLoaderProps = {
  top?: number
}

const UpperLoader = ({ top = 0 }: UpperLoaderProps) => {
  const translateX = useSharedValue(-Dimensions.get('window').width) // Start the animation off-screen
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors, top), [colors, top])

  const screenWidth = Dimensions.get('window').width

  useEffect(() => {
    // Start the loop animation
    translateX.value = withRepeat(
      withTiming(screenWidth, {
        duration: 1000,
        easing: Easing.linear
      }),
      -1, // Infinite loop
      false // No reverse
    )
  }, [translateX, screenWidth])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }))

  return (
    <View style={styles.loaderWrapper}>
      <Animated.View style={[styles.loaderLine, animatedStyle]} />
    </View>
  )
}

const createStyles = (colors: ThemeColors, top: number) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: top,
      flex: 1,
      width: '100%' // Ensures the container takes the full width
    },
    loaderWrapper: {
      height: 4,
      width: '100%', // Ensures the loader wrapper takes the full width of the parent
      overflow: 'hidden',
      position: 'relative'
    },
    loaderLine: {
      height: '100%',
      width: 100, // The width of the animated line
      backgroundColor: colors.accent
    }
  })

export default UpperLoader
