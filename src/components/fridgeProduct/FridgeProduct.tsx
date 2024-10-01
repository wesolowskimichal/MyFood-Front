import { memo, useCallback, useMemo, useState } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Fridge, ThemeColors, Unit } from '../../types/Types'
import _FridgeProductList from './_FridgeProductList'
import _FridgeProductTile from './_FridgeProductTile'
import { UnitAmountConverter, UnitProductConverter } from '../../helpers/UnitAmountConverter'
import { debounce } from 'lodash'
import { usePatchFridgeProductMutation } from '../../redux/api/slices/FridgeApiSlice'
import UpperLoader from '../upperLoader/UpperLoader'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'

type FridgeProductProps = {
  fridgeProduct: Fridge
  type?: 'tile' | 'list'
  style?: StyleProp<ViewStyle>
}

const FridgeProduct = ({ fridgeProduct, style, type = 'tile' }: FridgeProductProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const [patchFridgeProduct, { isLoading: isPatchingPoduct }] = usePatchFridgeProductMutation()

  const amount_unit = useMemo(
    () => UnitAmountConverter(fridgeProduct.current_amount, fridgeProduct.product.unit),
    [fridgeProduct]
  )
  const avaibleUnits = useMemo((): Unit[] => {
    if (fridgeProduct.product.unit === 'g' || fridgeProduct.product.unit === 'kg') {
      return ['g', 'kg']
    }
    return ['ml', 'l']
  }, [fridgeProduct])

  const [amount, setAmount] = useState(amount_unit.amount)
  const [unit, setUnit] = useState(amount_unit.unit)

  const handleOnProductRemove = useCallback(() => {
    console.log('removing product')
  }, [])

  const debouncedPatchFridgeProduct = useCallback(
    debounce((amount: number, unit: Unit) => {
      if (amount === fridgeProduct.current_amount && unit === fridgeProduct.product.unit) return
      const _amount = UnitProductConverter(amount, unit, fridgeProduct.product)
      console.log({ amount, _amount })
      patchFridgeProduct({
        id: fridgeProduct.id,
        body: {
          current_amount: _amount
        }
      })
    }, 1000),
    [fridgeProduct, patchFridgeProduct]
  )

  const handleOnAmountChange = (text: string) => {
    const value = parseInt(text) || 0
    setAmount(value)
    debouncedPatchFridgeProduct(value, unit)
  }

  const handleOnUnitChange = useCallback((unit: Unit) => {
    setUnit(unit)
    debouncedPatchFridgeProduct(amount, unit)
  }, [])

  const productViewProps = {
    amount,
    unit,
    avaibleUnits,
    picture: fridgeProduct.product.picture,
    name: fridgeProduct.product.name,
    onAmountChange: handleOnAmountChange,
    onUnitChange: handleOnUnitChange,
    onProductRemove: handleOnProductRemove
  }

  return (
    <View style={[styles.productTile, style]}>
      {isPatchingPoduct && <UpperLoader />}
      {type === 'tile' ? <_FridgeProductTile {...productViewProps} /> : <_FridgeProductList {...productViewProps} />}
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    productTile: {
      position: 'relative',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      height: 'auto',
      borderWidth: 1,
      borderRadius: 15,
      borderColor: colors.neutral.border,
      backgroundColor: colors.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      justifyContent: 'space-between',
      overflow: 'hidden',
      padding: 5
    }
  })

export default memo(FridgeProduct)
