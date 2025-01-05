import React, { useMemo } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { memo } from 'react'
import { ProductDetails, Unit, ThemeColors, RootStackParamList } from '../../types/Types'
import { CountKcal } from '../../helpers/CountKcal'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { NavigationProp } from '@react-navigation/native'
import { NutrientsCounter } from '../../helpers/NutrientsCounter'
import { Image } from 'expo-image'

type ProductViewProps = {
  navigation: NavigationProp<RootStackParamList>
  product: ProductDetails
  amount: number
  unit: Unit
  scale?: number
}

const ProductView = ({ navigation, product, amount, unit, scale = 1 }: ProductViewProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)

  const nutrients = useMemo(() => {
    const calculated = NutrientsCounter(amount * scale, unit, product)
    return {
      proteins: Math.floor(calculated.proteins),
      fats: Math.floor(calculated.fats),
      carbs: Math.floor(calculated.carbs),
      kcal: CountKcal(calculated)
    }
  }, [amount, unit, product])

  const handleOnProductInfoClick = () => {
    navigation.navigate('ProductInfo', { product })
  }

  return (
    <Pressable
      onPress={handleOnProductInfoClick}
      style={{
        width: '100%',
        marginVertical: 2,
        padding: 12,
        borderRadius: 8,
        backgroundColor: colors.neutral.surface,
        shadowColor: colors.neutral.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.neutral.border
        }}
      >
        <Text
          style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '600', color: colors.neutral.text }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {product.name}
        </Text>
        <Ionicons name="information" size={16} color={colors.accent} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <Image source={{ uri: product.picture }} style={{ flex: 1, aspectRatio: 1, borderRadius: 4, marginRight: 4 }} />
        <View style={{ flex: 4 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              marginBottom: 8
            }}
          >
            <Text style={{ color: colors.neutral.text, fontWeight: '500', fontSize: 13 }}>Amount: </Text>
            <Text style={{ color: colors.neutral.text, fontWeight: '500', fontSize: 13 }}>{`${amount} ${unit}`}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 8,
              justifyContent: 'space-between'
            }}
          >
            <Text
              style={{ color: colors.neutral.text, flex: 1, fontSize: 12, textAlign: 'center' }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {`P: ${nutrients.proteins}g`}
            </Text>
            <Text
              style={{ color: colors.neutral.text, flex: 1, fontSize: 12, textAlign: 'center' }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >{`C: ${nutrients.carbs}g`}</Text>
            <Text
              style={{ color: colors.neutral.text, flex: 1, fontSize: 12, textAlign: 'center' }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >{`F: ${nutrients.fats}g`}</Text>
          </View>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: colors.neutral.text, fontSize: 12, textAlign: 'center' }}
          >{`Kcal: ${nutrients.kcal}`}</Text>
        </View>
      </View>
    </Pressable>
  )
}

export default memo(ProductView)
