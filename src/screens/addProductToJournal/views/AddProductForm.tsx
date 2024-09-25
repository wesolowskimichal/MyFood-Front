import { useCallback, useMemo, useState } from 'react'
import { ProductDetails, ThemeColors, Unit } from '../../../types/Types'
import { NutrientsCounter } from '../../../helpers/NutrientsCounter'
import { Button, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Table from '../../../components/table/Table'
import { useSelector } from 'react-redux'
import { RootState } from '../../../redux/Store'
import UnitSelector from '../../../components/unitSelector/Unitselector'
import { Image } from 'expo-image'
import { CountKcal } from '../../../helpers/CountKcal'

type AddProductFormProps = {
  product: ProductDetails
  onSubmit: (amount: number, unit: Unit) => Promise<void>
}
type AmountType = 'small' | 'big'

const AddProductForm = ({ product, onSubmit }: AddProductFormProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const [amount, setAmount] = useState<number>(0)
  const [unit, setUnit] = useState<Unit>(product.unit)

  const avaibleUnits = useMemo((): Unit[] => {
    if (product.unit === 'g' || product.unit === 'kg') {
      return ['g', 'kg']
    }
    return ['ml', 'l']
  }, [product.unit])

  const handleAmountChange = useCallback((value: string) => {
    const amount = parseFloat(value)
    setAmount(isNaN(amount) ? 0 : amount)
  }, [])

  const tableVals: { amount: number; type: AmountType }[] = [
    { amount, type: unit === 'g' || unit === 'ml' ? 'small' : 'big' },
    { amount: 100, type: 'small' },
    { amount: 250, type: 'small' },
    { amount: 1, type: 'big' }
  ]

  const createProductTable = useMemo(() => {
    const amountConv: { [type in AmountType]: Unit } = {
      small: product.unit === 'g' || product.unit === 'kg' ? 'g' : 'ml',
      big: product.unit === 'g' || product.unit === 'kg' ? 'kg' : 'l'
    }

    return tableVals.map(curr => {
      const nutrients = NutrientsCounter(curr.amount, amountConv[curr.type], product, true)
      return {
        amount: `${curr.amount} ${amountConv[curr.type]}`,
        unit: amountConv[curr.type],
        nutrients: { ...nutrients, kcal: CountKcal(nutrients) }
      }
    })
  }, [product, amount, unit])

  return (
    <View style={styles.form}>
      <Image source={{ uri: product.picture }} style={styles.image} />

      <View style={styles.doubleInputWrapper}>
        <TextInput
          style={styles.doubleInput}
          placeholder="Amount"
          value={amount?.toString() || ''}
          keyboardType="numeric"
          onChangeText={handleAmountChange}
          placeholderTextColor={colors.neutral.border}
        />
        <UnitSelector unit={unit} avaibleUnits={avaibleUnits} setUnit={(unit: Unit) => setUnit(unit)} />
      </View>
      <Pressable style={styles.submit} onPress={() => onSubmit(amount, unit)}>
        <Text>Add To Journal</Text>
      </Pressable>
      <Table data={createProductTable} showKcal />
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    form: {
      padding: 16,
      flex: 1,
      gap: 32
    },
    image: {
      aspectRatio: 1,
      width: '100%',
      borderRadius: 16,
      marginBottom: 16
    },
    doubleInputWrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10
    },
    doubleInput: {
      flex: 1,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.neutral.border,
      borderRadius: 8,
      color: colors.neutral.text,
      backgroundColor: colors.neutral.surface
    },
    submit: {
      padding: 16,
      backgroundColor: colors.neutral.surface,
      borderWidth: 1,
      borderColor: colors.neutral.border,
      borderRadius: 8,
      alignItems: 'center'
    }
  })

export default AddProductForm
