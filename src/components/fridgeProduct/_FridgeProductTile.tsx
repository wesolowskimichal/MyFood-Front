import React, { useEffect, useMemo } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { ThemeColors, Unit } from '../../types/Types'
import { RootState } from '../../redux/Store'
import { useSelector } from 'react-redux'
import { Image } from 'expo-image'
import UnitSelector from '../unitSelector/Unitselector'
import Icon from 'react-native-vector-icons/Feather'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated'

type _FridgeProductTileProps = {
  amount: number
  unit: Unit
  avaibleUnits: Unit[]
  picture: string
  name: string
  onAmountChange: (text: string) => void
  onUnitChange: (unit: Unit) => void
  onProductRemove: () => void
}

const _FridgeProductTile = ({
  amount,
  unit,
  avaibleUnits,
  picture,
  name,
  onAmountChange,
  onUnitChange,
  onProductRemove
}: _FridgeProductTileProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const scale = useSharedValue(0.8)
  const opacity = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(1)
    opacity.value = withTiming(1, { duration: 500 })
  }, [])

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }))

  const removeButtonScale = useSharedValue(1)

  const removeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: removeButtonScale.value }]
  }))

  const handlePressIn = () => {
    removeButtonScale.value = withSpring(0.95)
  }

  const handlePressOut = () => {
    removeButtonScale.value = withSpring(1)
  }

  return (
    <Animated.View style={[imageStyle, { width: '100%' }]}>
      <Image source={{ uri: picture }} style={styles.productImage} />
      <Text style={styles.productName}>{name}</Text>
      <View style={styles.amountWrapper}>
        <TextInput
          style={styles.amountInput}
          value={amount.toString()}
          keyboardType="numeric"
          onChangeText={onAmountChange}
        />
        <UnitSelector unit={unit} avaibleUnits={avaibleUnits} setUnit={onUnitChange} />
      </View>
      <Pressable
        onPress={onProductRemove}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.removeButton}
      >
        <Animated.View style={[removeButtonStyle, styles.removeButton]}>
          <Icon name="trash-2" size={18} color={colors.primary} />
          <Text style={styles.removeButtonText}>Remove</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    productImage: {
      width: '100%',
      height: 120,
      borderRadius: 10,
      marginBottom: 8
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.neutral.text,
      marginBottom: 12,
      textAlign: 'center'
    },
    amountWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 10
    },
    amountInput: {
      borderColor: colors.neutral.border,
      borderWidth: 1,
      borderRadius: 8,
      height: 40,
      width: 60,
      textAlign: 'center',
      color: colors.neutral.text,
      backgroundColor: colors.neutral.surface
    },
    removeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#CD5C5C',
      padding: 8,
      borderRadius: 8,
      width: '90%'
    },
    removeButtonText: {
      color: colors.primary,
      fontWeight: '600',
      marginLeft: 8
    }
  })

export default _FridgeProductTile
