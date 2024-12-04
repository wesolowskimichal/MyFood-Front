import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { ThemeColors, Unit } from '../../types/Types'
import UnitSelector from '../unitSelector/Unitselector'
import Animated, {
  SlideInLeft,
  SlideOutRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  LinearTransition
} from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/Feather'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'

type _FridgeProductListProps = {
  amount: number
  unit: Unit
  avaibleUnits: Unit[]
  picture: string
  name: string
  onAmountChange: (text: string) => void
  onUnitChange: (unit: Unit) => void
  onProductRemove: () => void
}

const _FridgeProductList = ({
  amount,
  unit,
  avaibleUnits,
  picture,
  name,
  onAmountChange,
  onUnitChange,
  onProductRemove
}: _FridgeProductListProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])
  const [isRemoving, setIsRemoving] = useState(false)

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
    <Animated.View
      style={styles.productItem}
      layout={LinearTransition.springify()}
      entering={SlideInLeft}
      exiting={SlideOutRight}
    >
      <Image source={{ uri: picture }} style={styles.productImage} />
      <View style={styles.productInfo}>
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
      </View>
      <Pressable
        onPress={onProductRemove}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.removeButton}
      >
        <Animated.View style={removeButtonStyle}>
          <Icon name="trash-2" size={18} color="#FFF" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    productItem: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 4,
      alignSelf: 'center',
      paddingHorizontal: 6
    },
    productImage: {
      width: 60,
      height: 60,
      borderRadius: 4,
      marginRight: 12
    },
    productInfo: {
      flex: 1,
      justifyContent: 'center'
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.neutral.text,
      marginBottom: 8
    },
    amountWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10
    },
    amountInput: {
      borderColor: colors.neutral.text,
      borderWidth: 1,
      borderRadius: 4,
      width: 42,
      height: 36,
      textAlign: 'center',
      color: colors.neutral.text,
      backgroundColor: colors.neutral.surface
    },
    removeButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#CD5C5C',
      padding: 12,
      borderRadius: 4
    }
  })

export default _FridgeProductList
