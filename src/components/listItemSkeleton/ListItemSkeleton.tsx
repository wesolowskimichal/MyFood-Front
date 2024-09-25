import React, { useEffect, useMemo, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { ThemeColors } from '../../types/Types'

interface ListItemSkeletonProps {
  width?: number | 'auto' | `${number}%`
  height?: number | 'auto' | `${number}%`
  borderRadius?: number
}

const ListItemSkeleton = ({ width, height, borderRadius = 8 }: ListItemSkeletonProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  useEffect(() => {
    const loopAnimation = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true
        })
      ]).start(() => loopAnimation())
    }

    loopAnimation()
  }, [fadeAnim])

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width,
          height: height,
          borderRadius: borderRadius,
          backgroundColor: colors.neutral.surface,
          opacity: fadeAnim,
          marginVertical: 8,
          shadowColor: colors.neutral.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2
        }
      ]}
    />
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    skeleton: {
      marginVertical: 8
    }
  })

export default ListItemSkeleton
