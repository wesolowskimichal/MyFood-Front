import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native'
import { ProductDetails, Unit, ThemeColors, Nutrients, RootStackParamList } from '../../types/Types'
import { UnitAmountConverter, UnitProductConverter } from '../../helpers/UnitAmountConverter'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import Icon from 'react-native-vector-icons/Feather'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import { NutrientsCounter } from '../../helpers/NutrientsCounter'
import { CountKcal } from '../../helpers/CountKcal'
import { NavigationProp } from '@react-navigation/native'
import UnitSelector from '../unitSelector/Unitselector'
import Dialog, { DialogContent, DialogTrigger } from '../dialog/Dialog'

type ProductProps = {
  navigation: NavigationProp<RootStackParamList>
  product: ProductDetails
  defaultAmount: number
  onNutrientsChange: (
    carbsDiff: number,
    proteinsDiff: number,
    fatsDiff: number,
    amount: number,
    object: ProductDetails
  ) => void
  onProductRemove: (product: ProductDetails) => void
  destructor: (product: ProductDetails, amount: number, unit: Unit) => void
}

const Product = ({
  navigation,
  product,
  defaultAmount,
  onNutrientsChange,
  onProductRemove,
  destructor
}: ProductProps) => {
  const [unit, setUnit] = useState<Unit>(product.unit)
  const [amount, setAmount] = useState<number>(defaultAmount)
  const [shouldDecrease, setShouldDecrease] = useState(true)
  const [isRemoveProductDialogVisible, setIsRemoveProductDialogVisible] = useState(false)
  const amountRef = useRef(amount)

  const [proteins, setProteins] = useState(0)
  const [fats, setFats] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const kcal = useMemo(() => CountKcal({ proteins: proteins, fats: fats, carbs: carbs }), [fats, carbs, proteins])

  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])
  const avaibleUnits = useMemo((): Unit[] => {
    if (product.unit === 'g' || product.unit === 'kg') {
      return ['g', 'kg']
    }
    return ['ml', 'l']
  }, [product.unit])

  useEffect(() => {
    return () => {
      destructor(product, amountRef.current, unit)
    }
  }, [])

  useEffect(() => {
    amountRef.current = amount
  }, [amount])

  useEffect(() => {
    const convertedData = UnitAmountConverter(defaultAmount, product.unit)
    setUnit(convertedData.unit)
    setAmount(convertedData.amount)
    const nutrients = NutrientsCounter(convertedData.amount, convertedData.unit, product)

    updateNutrients(nutrients)
  }, [defaultAmount, product])

  const updateNutrients = useCallback((nutrients: Nutrients) => {
    setProteins(Math.floor(nutrients.proteins))
    setCarbs(Math.floor(nutrients.carbs))
    setFats(Math.floor(nutrients.fats))
  }, [])

  const handleOnProductInfoClick = useCallback(() => {
    navigation.navigate('ProductInfo', { product: product })
  }, [])

  const handleOnProductRemove = useCallback(async () => {
    onProductRemove(product)
  }, [onProductRemove])

  const handleAmountChange = useCallback(
    (text: string) => {
      const numericValue = parseFloat(text)
      setAmount(prev => {
        if (isNaN(numericValue) || numericValue <= 0) {
          if (shouldDecrease) {
            const nutrientsNew = NutrientsCounter(prev, unit, product)
            const nutrients_ = { proteins: 0, fats: 0, carbs: 0 }
            updateNutrients(nutrients_)
            onNutrientsChange(
              Math.floor(nutrientsNew.carbs),
              Math.floor(nutrientsNew.proteins),
              Math.floor(nutrientsNew.fats),
              0,
              product
            )
            setShouldDecrease(false)
          }
          return 0
        }
        setShouldDecrease(true)
        const amount = numericValue
        const nutrientsNew = NutrientsCounter(amount, unit, product)
        const proteinsDiff = proteins - nutrientsNew.proteins
        const carbsDiff = carbs - nutrientsNew.carbs
        const fatsDiff = fats - nutrientsNew.fats
        updateNutrients(nutrientsNew)
        onNutrientsChange(carbsDiff, proteinsDiff, fatsDiff, UnitProductConverter(amount, unit, product), product)
        return amount
      })
    },
    [onNutrientsChange, proteins, carbs, fats, unit, product, shouldDecrease, updateNutrients]
  )

  const handleUnitChange = useCallback(
    (newUnit: Unit) => {
      setUnit(newUnit)

      const nutrientsNew = NutrientsCounter(amount, newUnit, product)
      const proteinsDiff = proteins - nutrientsNew.proteins
      const carbsDiff = carbs - nutrientsNew.carbs
      const fatsDiff = fats - nutrientsNew.fats

      updateNutrients(nutrientsNew)
      onNutrientsChange(carbsDiff, proteinsDiff, fatsDiff, UnitProductConverter(amount, newUnit, product), product)
    },
    [amount, proteins, carbs, fats, product, onNutrientsChange, updateNutrients]
  )

  return (
    <View style={styles.Product}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable onPress={handleOnProductInfoClick}>
          <Icon name="info" size={14} color={colors.accent} />
        </Pressable>
        <Dialog visible={isRemoveProductDialogVisible} setVisible={setIsRemoveProductDialogVisible}>
          <DialogTrigger style={styles.DialogTrigger}>
            <EntypoIcon name="cross" size={14} color={colors.complementary.danger} />
          </DialogTrigger>
          <DialogContent style={styles.DialogContent}>
            <Text style={styles.DialogContentText}>Are you sure you want to remove this item from Journal?</Text>
            <View style={styles.DialogContentButtonsWrapper}>
              <Pressable
                onPress={handleOnProductRemove}
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
      </View>
      <View style={styles.Row}>
        <Text style={styles.ProductName}>{product.name}</Text>
        <TextInput
          style={styles.AmountInput}
          value={amount?.toString() ?? 0}
          keyboardType="numeric"
          onChangeText={handleAmountChange}
        />
        <UnitSelector unit={unit} avaibleUnits={avaibleUnits} setUnit={handleUnitChange} />
      </View>
      <View style={styles.Row}>
        <Text style={styles.NutrientValue}>{kcal}</Text>
        <Text style={styles.NutrientValue}>{proteins}</Text>
        <Text style={styles.NutrientValue}>{carbs}</Text>
        <Text style={styles.NutrientValue}>{fats}</Text>
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
    },
    DialogTrigger: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.complementary.danger,
      borderRadius: 888
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

export default memo(Product)
