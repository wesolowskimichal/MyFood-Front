import React, { memo, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Meal, ProductDetails, ThemeColors } from '../../types/Types'
import Icon from 'react-native-vector-icons/Feather'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { NavigationProp } from '@react-navigation/native'

type ProductInfoBarProps = {
  navigation: NavigationProp<any>
  product: ProductDetails
  meal?: Meal
  fridge?: boolean
}

const ProductInfoBar = ({ navigation, product, meal, fridge }: ProductInfoBarProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const handleProductSelect = useCallback(() => {
    navigation.navigate('AddProductToComponent', { product: product, meal: meal, fridge: fridge })
  }, [])

  const handleOnProductInfoClick = useCallback(() => {
    navigation.navigate('ProductInfo', { product: product })
  }, [])

  return (
    <Pressable style={styles.ProductInfoBar} onPress={handleProductSelect}>
      <View style={styles.Row}>
        <Text style={styles.ProductName}>{product.name}</Text>
        <Pressable onPress={handleOnProductInfoClick}>
          <Icon name="info" size={14} color={colors.accent} />
        </Pressable>
      </View>
      <View style={styles.Row}>
        <Text style={styles.NutrientValue}>Proteins: {Math.floor(product.protein)}g</Text>
        <Text style={styles.NutrientValue}>Carbs: {Math.floor(product.carbons)}g</Text>
        <Text style={styles.NutrientValue}>Fats: {Math.floor(product.fat)}g</Text>
      </View>
    </Pressable>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    ProductInfoBar: {
      padding: 16,
      marginVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.neutral.surface,
      shadowColor: colors.neutral.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    Row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 4
    },
    ProductName: {
      color: colors.neutral.text,
      fontWeight: '500',
      fontSize: 16,
      flex: 2
    },
    NutrientValue: {
      color: colors.complementary.info,
      fontSize: 12,
      flex: 1,
      textAlign: 'center'
    }
  })

export default memo(ProductInfoBar)
