import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, View, Pressable, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { Unit } from '../../types/Types'
import UnitSelector from '../unitSelector/Unitselector'
import Animated, {
  SlideInLeft,
  SlideOutRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/Feather'

const { width } = Dimensions.get('window')

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

  const handleRemoveProduct = () => {
    // Trigger removal animation and then call the remove function
    setIsRemoving(true)
  }

  const onRemoveAnimationEnd = () => {
    // This function will be called when the animation completes
    runOnJS(onProductRemove)()
  }

  return (
    <Animated.View
      style={styles.productItem}
      entering={SlideInLeft}
      exiting={isRemoving ? SlideOutRight.withCallback(onRemoveAnimationEnd) : undefined}
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
        onPress={handleRemoveProduct}
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

const styles = StyleSheet.create({
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    alignSelf: 'center',
    paddingHorizontal: 6
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  amountInput: {
    borderColor: '#e6e6e6',
    borderWidth: 1,
    borderRadius: 8,
    height: 40,
    width: 60,
    textAlign: 'center',
    color: '#333',
    backgroundColor: '#f9f9f9'
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CD5C5C',
    padding: 12,
    borderRadius: 8
  }
})

export default _FridgeProductList
