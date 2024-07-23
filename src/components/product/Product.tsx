import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native'
import { ProductDetails, Unit, ThemeColors } from '../../types/Types'
import { UnitAmountConverter } from '../../helpers/UnitAmountConverter'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import RNPickerSelect from 'react-native-picker-select'
import Dialog, { DialogContent, DialogTrigger } from '../dialog/Dialog'

type ProductProps = {
  product: ProductDetails
  defaultAmount: number
}

const Product = ({ product, defaultAmount }: ProductProps) => {
  console.log(`${product.name}: ${defaultAmount}`)

  const [unit, setUnit] = useState<Unit>(product.unit)
  const [amount, setAmount] = useState<number>(defaultAmount)
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])
  const avaibleUnits = useMemo((): Unit[] => {
    if (product.unit === 'g' || product.unit === 'kg') {
      return ['g', 'kg']
    }
    return ['ml', 'l']
  }, [product.unit])

  useEffect(() => {
    const convertedData = UnitAmountConverter(defaultAmount, product.unit)
    setUnit(convertedData.unit)
    setAmount(convertedData.amount)
  }, [defaultAmount, product.unit])

  const handleAmountChange = useCallback((text: string) => {
    const numericValue = parseFloat(text)
    setAmount(isNaN(numericValue) ? 0 : numericValue)
  }, [])

  return (
    <View style={styles.Product}>
      <View style={styles.Row}>
        <Text style={styles.ProductName}>{product.name}</Text>
        <TextInput
          style={styles.AmountInput}
          value={amount.toString()}
          keyboardType="numeric"
          onChangeText={handleAmountChange}
        />
        <Dialog style={styles.DialogContainer}>
          <DialogTrigger style={styles.DialogTrigger}>
            <Text style={styles.UnitText}>{unit}</Text>
          </DialogTrigger>
          <DialogContent style={styles.DialogContent}>
            {avaibleUnits.map((avaibleUnit, index) => (
              <Pressable key={`${avaibleUnit}-${index}`} style={styles.DialogContentButton}>
                <Text>{avaibleUnit}</Text>
              </Pressable>
            ))}
            <Pressable></Pressable>
          </DialogContent>
        </Dialog>
      </View>
      <View style={styles.Row}>
        <Text style={styles.NutrientValue}>{product.protein}</Text>
        <Text style={styles.NutrientValue}>{product.carbons}</Text>
        <Text style={styles.NutrientValue}>{product.fat}</Text>
      </View>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    ItemStyle: {
      backgroundColor: 'red',
      color: 'red'
    },
    Product: {
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
      marginVertical: 4,
      gap: 20
    },
    DialogContainer: {
      justifyContent: 'flex-end'
    },
    DialogTrigger: {
      borderColor: colors.neutral.text,
      borderWidth: 1,
      borderRadius: 4,
      width: 60,
      height: 40,
      textAlign: 'center',
      color: colors.neutral.text,
      alignItems: 'center',
      justifyContent: 'center'
    },
    UnitText: {
      color: colors.neutral.text,
      textAlign: 'center'
    },
    DialogContent: {
      width: 250,
      height: 250
    },
    DialogContentButton: {
      backgroundColor: 'red'
    },
    ProductName: {
      color: colors.neutral.text,
      fontWeight: '500',
      fontSize: 16,
      flex: 2
    },
    AmountInput: {
      borderColor: colors.neutral.text,
      borderWidth: 1,
      borderRadius: 4,
      width: 60,
      height: 40,
      textAlign: 'center',
      color: colors.neutral.text
    },

    NutrientValue: {
      color: colors.complementary.info,
      fontSize: 12,
      flex: 1,
      textAlign: 'center'
    },
    ModalViewBottom: {
      backgroundColor: 'black'
    },
    ModalViewMiddle: {
      backgroundColor: 'black'
    },
    ModalViewTop: {
      backgroundColor: 'black'
    }
  })

export default Product
