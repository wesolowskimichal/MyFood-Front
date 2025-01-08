import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native'
import {
  ProductDetails as IProduct,
  ThemeColors,
  Nutrients,
  RootStackParamList,
  JournalEntity,
  Unit
} from '../../types/Types'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import Icon from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import { CountKcal } from '../../helpers/CountKcal'
import { NavigationProp } from '@react-navigation/native'
import Dialog, { DialogContent, DialogTrigger } from '../dialog/Dialog'
import { useDeleteJournalMutation, usePatchJournalMutation } from '../../redux/api/slices/JournalApiSlice'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import { NutrientsCounter } from '../../helpers/NutrientsCounter'
import { UnitAmountConverter, UnitProductConverter } from '../../helpers/UnitAmountConverter'
import UnitSelector from '../unitSelector/Unitselector'

type ProductProps = {
  navigation: NavigationProp<RootStackParamList>
  productEntity: JournalEntity<IProduct>
  defaultAmount: number
  onNutrientsChange: (
    carbsDiff: number,
    proteinsDiff: number,
    fatsDiff: number,
    amount: number,
    object: IProduct
  ) => void
  destructor: (product: IProduct, amount: number, unit: Unit) => void
}

const Product = ({ navigation, productEntity, defaultAmount, onNutrientsChange, destructor }: ProductProps) => {
  const [patchProductEntity] = usePatchJournalMutation()
  const [
    removeProductEntity,
    {
      isLoading: isRemoveProductEntityLoading,
      isError: isRemoveProductEntityError,
      isSuccess: isRemoveProductEntitySuccess
    }
  ] = useDeleteJournalMutation()

  const [unit, setUnit] = useState<Unit>(productEntity.object.entry.unit)
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
    if (productEntity.object.entry.unit === 'g' || productEntity.object.entry.unit === 'kg') {
      return ['g', 'kg']
    }
    return ['ml', 'l']
  }, [productEntity.object.entry.unit])

  useEffect(() => {
    return () => {
      destructor(productEntity.object.entry, amountRef.current, unit)
    }
  }, [])

  useEffect(() => {
    amountRef.current = amount
  }, [amount])

  useEffect(() => {
    const convertedData = UnitAmountConverter(defaultAmount, productEntity.object.entry.unit)
    setUnit(convertedData.unit)
    setAmount(convertedData.amount)
    const nutrients = NutrientsCounter(convertedData.amount, convertedData.unit, productEntity.object.entry)

    updateNutrients(nutrients)
  }, [defaultAmount, productEntity.object.entry])

  const updateNutrients = useCallback((nutrients: Nutrients) => {
    setProteins(Math.floor(nutrients.proteins))
    setCarbs(Math.floor(nutrients.carbs))
    setFats(Math.floor(nutrients.fats))
  }, [])

  const handleOnProductInfoClick = useCallback(() => {
    navigation.navigate('ProductInfo', { product: productEntity.object.entry })
  }, [])

  const handleOnProductEntityRemove = useCallback(async () => {
    removeProductEntity(productEntity.id)
  }, [productEntity.id])

  const handleAmountChange = useCallback(
    (text: string) => {
      const numericValue = parseFloat(text)
      setAmount(prev => {
        if (isNaN(numericValue) || numericValue <= 0) {
          if (shouldDecrease) {
            const nutrientsNew = NutrientsCounter(prev, unit, productEntity.object.entry)
            const nutrients_ = { proteins: 0, fats: 0, carbs: 0 }
            updateNutrients(nutrients_)
            onNutrientsChange(
              Math.floor(nutrientsNew.carbs),
              Math.floor(nutrientsNew.proteins),
              Math.floor(nutrientsNew.fats),
              0,
              productEntity.object.entry
            )
            setShouldDecrease(false)
          }
          patchProductEntity({
            journalId: productEntity.id,
            body: {
              object_type: 'product',
              object: productEntity.object.entry,
              object_amount: 0,
              meal: productEntity.object.meal
            }
          })
          return 0
        }
        setShouldDecrease(true)
        const amount = numericValue
        const nutrientsNew = NutrientsCounter(amount, unit, productEntity.object.entry)
        const proteinsDiff = proteins - nutrientsNew.proteins
        const carbsDiff = carbs - nutrientsNew.carbs
        const fatsDiff = fats - nutrientsNew.fats
        updateNutrients(nutrientsNew)
        onNutrientsChange(
          carbsDiff,
          proteinsDiff,
          fatsDiff,
          UnitProductConverter(amount, unit, productEntity.object.entry),
          productEntity.object.entry
        )
        patchProductEntity({
          journalId: productEntity.id,
          body: {
            object_type: 'product',
            object: productEntity.object.entry,
            object_amount: amount,
            meal: productEntity.object.meal
          }
        })
        return amount
      })
    },
    [
      onNutrientsChange,
      proteins,
      carbs,
      fats,
      unit,
      amount,
      productEntity.object.entry,
      shouldDecrease,
      updateNutrients
    ]
  )

  const handleUnitChange = useCallback(
    (newUnit: Unit) => {
      setUnit(newUnit)

      const nutrientsNew = NutrientsCounter(amount, newUnit, productEntity.object.entry)
      const proteinsDiff = proteins - nutrientsNew.proteins
      const carbsDiff = carbs - nutrientsNew.carbs
      const fatsDiff = fats - nutrientsNew.fats

      updateNutrients(nutrientsNew)
      onNutrientsChange(
        carbsDiff,
        proteinsDiff,
        fatsDiff,
        UnitProductConverter(amount, newUnit, productEntity.object.entry),
        productEntity.object.entry
      )
      patchProductEntity({
        journalId: productEntity.id,
        body: {
          object_type: 'product',
          object: productEntity.object.entry,
          object_amount: amount,
          meal: productEntity.object.meal
        }
      })
    },
    [amount, proteins, carbs, fats, productEntity.object.entry, onNutrientsChange, updateNutrients]
  )

  useEffect(() => {
    if (isRemoveProductEntitySuccess) {
      setIsRemoveProductDialogVisible(false)
    }
  }, [isRemoveProductEntitySuccess])

  return (
    <View style={styles.Product}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable
          onPress={handleOnProductInfoClick}
          style={{
            borderRadius: 4,
            borderWidth: 1,
            borderColor: colors.accent,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 1
          }}
        >
          <Ionicons name="information" size={14} color={colors.accent} />
        </Pressable>
        <Dialog visible={isRemoveProductDialogVisible} setVisible={setIsRemoveProductDialogVisible}>
          <DialogTrigger style={styles.DialogTrigger}>
            <EntypoIcon name="cross" size={14} color={colors.complementary.danger} />
          </DialogTrigger>
          <DialogContent style={styles.DialogContent}>
            <Text style={styles.DialogContentText}>Are you sure you want to remove this item from Journal?</Text>
            <View style={styles.DialogContentButtonsWrapper}>
              <Pressable
                onPress={handleOnProductEntityRemove}
                disabled={isRemoveProductEntityLoading}
                style={[
                  styles.DialogContentButton,
                  { backgroundColor: '#CD5C5C', flexDirection: 'row', justifyContent: 'center', gap: 5 }
                ]}
              >
                <Text style={{ color: colors.primary }}>Yes</Text>
                {!isRemoveProductEntityLoading && !isRemoveProductEntityError && !isRemoveProductEntitySuccess && (
                  <Icon name="trash-2" size={14} color={colors.primary} />
                )}
                {isRemoveProductEntityLoading && <ActivityIndicator color={colors.primary} />}
                {isRemoveProductEntityError && <AntDesignIcon name="close" size={24} color={colors.primary} />}
                {isRemoveProductEntitySuccess && <AntDesignIcon name="check" size={24} color={colors.primary} />}
              </Pressable>
              <Pressable style={styles.DialogContentButton} onPress={() => setIsRemoveProductDialogVisible(false)}>
                <Text>No</Text>
              </Pressable>
            </View>
          </DialogContent>
        </Dialog>
      </View>
      <View style={styles.Row}>
        <Text style={styles.ProductName}>{productEntity.object.entry.name}</Text>
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
    Product: {
      marginVertical: 8,
      borderRadius: 4,
      padding: 8,
      backgroundColor: colors.neutral.surface,
      elevation: 4
    },
    Row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 4,
      gap: 16
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
      width: 42,
      height: 36,
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
      borderRadius: 4
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
