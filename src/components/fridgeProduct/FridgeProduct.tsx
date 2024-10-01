import { memo, useCallback, useMemo, useState } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle, Text, Pressable } from 'react-native'
import { Fridge, ThemeColors, Unit } from '../../types/Types'
import _FridgeProductList from './_FridgeProductList'
import _FridgeProductTile from './_FridgeProductTile'
import { UnitAmountConverter, UnitProductConverter } from '../../helpers/UnitAmountConverter'
import { debounce } from 'lodash'
import { usePatchFridgeProductMutation, useRemoveFridgeProductMutation } from '../../redux/api/slices/FridgeApiSlice'
import UpperLoader from '../upperLoader/UpperLoader'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import Dialog, { DialogContent } from '../dialog/Dialog'
import Icon from 'react-native-vector-icons/Feather'

type FridgeProductProps = {
  fridgeProduct: Fridge
  type?: 'tile' | 'list'
  style?: StyleProp<ViewStyle>
  onAmountChange: (id: string, amount: number) => void
  onProductRemove: (id: string) => void
}

const FridgeProduct = ({
  fridgeProduct,
  style,
  type = 'tile',
  onAmountChange,
  onProductRemove
}: FridgeProductProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const [patchFridgeProduct, { isLoading: isPatchingPoduct }] = usePatchFridgeProductMutation()
  const [removeFridgeProduct, { isLoading: isRemovingFridgeProduct }] = useRemoveFridgeProductMutation()

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
  const [isRemoveProductDialogVisible, setIsRemoveProductDialogVisible] = useState(false)

  const handleOnProductRemove = useCallback(() => {
    setIsRemoveProductDialogVisible(true)
  }, [])

  const handleRemove = useCallback(async () => {
    try {
      await removeFridgeProduct(fridgeProduct.id)
      onProductRemove(fridgeProduct.id)
      setIsRemoveProductDialogVisible(false)
    } catch (error) {
      console.error(error)
    }
  }, [])

  const debouncedPatchFridgeProduct = useCallback(
    debounce((amount: number, unit: Unit) => {
      if (amount === fridgeProduct.current_amount && unit === fridgeProduct.product.unit) return
      const _amount = UnitProductConverter(amount, unit, fridgeProduct.product)
      onAmountChange(fridgeProduct.id, _amount)
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
      {(isPatchingPoduct || isRemovingFridgeProduct) && <UpperLoader />}
      {type === 'tile' ? <_FridgeProductTile {...productViewProps} /> : <_FridgeProductList {...productViewProps} />}
      {isRemoveProductDialogVisible && (
        <Dialog visible={isRemoveProductDialogVisible} setVisible={setIsRemoveProductDialogVisible}>
          <DialogContent style={styles.DialogContent}>
            <Text style={styles.DialogContentText}>Are you sure you want to remove this Product from Fridge?</Text>
            <View style={styles.DialogContentButtonsWrapper}>
              <Pressable
                onPress={handleRemove}
                style={[
                  styles.DialogContentButton,
                  { backgroundColor: '#CD5C5C', flexDirection: 'row', justifyContent: 'center', gap: 5 }
                ]}
              >
                <Text style={{ color: colors.primary }}>Yes</Text>
                <Icon name="trash-2" size={14} color={colors.primary} />
              </Pressable>
              <Pressable style={styles.DialogContentButton} onPress={() => setIsRemoveProductDialogVisible(false)}>
                <Text>No</Text>
              </Pressable>
            </View>
          </DialogContent>
        </Dialog>
      )}
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
      backgroundColor: colors.neutral.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      justifyContent: 'space-between',
      overflow: 'hidden',
      padding: 5
    },
    DialogContent: {
      flexDirection: 'column',
      gap: 24
    },
    DialogContentText: {
      color: colors.neutral.text,
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '600'
    },
    DialogContentButtonsWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    DialogContentButton: {
      borderWidth: 1,
      borderColor: colors.neutral.border,
      borderRadius: 4,
      padding: 10,
      width: 100,
      justifyContent: 'center',
      alignItems: 'center'
    }
  })

export default memo(FridgeProduct)
