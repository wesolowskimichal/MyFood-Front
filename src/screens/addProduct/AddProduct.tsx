import { useSelector } from 'react-redux'
import { AddProductScreenProps, ProductDetails, ThemeColors, Unit } from '../../types/Types'
import { RootState } from '../../redux/Store'
import { memo, useCallback, useLayoutEffect, useMemo, useState } from 'react'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import IonIcon from 'react-native-vector-icons/Ionicons'
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons'
import { NutrientsCounter } from '../../helpers/NutrientsCounter'
import Table from '../../components/table/Table'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { useAddProductMutation } from '../../redux/api/slices/ProductApiSlice'
import Loader from '../../components/loader/Loader'
import { CountKcal } from '../../helpers/CountKcal'
import { BarcodeScanningResult } from 'expo-camera'
import BarcodeScanner from '../../components/barcodeScanner/BarcodeScanner'
import UnitSelector from '../../components/unitSelector/Unitselector'

type AmountType = 'small' | 'big'

const tableVals: { amount: number; type: AmountType }[] = [
  { amount: 100, type: 'small' },
  { amount: 250, type: 'small' },
  { amount: 1, type: 'big' }
]

const AddProduct = ({ navigation, route }: AddProductScreenProps) => {
  const navBarcode = route.params.barcode ?? null
  const navMeal = route.params.meal
  const navFridge = route.params.fridge
  const [addProduct, { isLoading: isAddingProduct }] = useAddProductMutation()

  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const [barcode, setBarcode] = useState(navBarcode)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState<number | null>(null)
  const [unit, setUnit] = useState<Unit>('g')
  const [picture, setPicture] = useState<string | null>(null)
  const [carbons, setCarbons] = useState<number | null>(null)
  const [fat, setFat] = useState<number | null>(null)
  const [protein, setProtein] = useState<number | null>(null)
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string | null }>({})
  const [scanningBarcode, setScanningBarcode] = useState(false)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.neutral.text as string,
      headerStyle: { backgroundColor: colors.neutral.border as string }
    })
  }, [navigation, colors])

  const handleNumberchange = useCallback((value: string, key: string) => {
    const amount = parseFloat(value)
    if (isNaN(amount) || amount <= 0) {
      if (key == 'protein') setProtein(0)
      if (key == 'carbons') setCarbons(0)
      if (key == 'fat') setFat(0)
      if (key == 'amount') setAmount(0)
      return
    }
    if (key == 'protein') setProtein(amount)
    if (key == 'carbons') setCarbons(amount)
    if (key == 'fat') setFat(amount)
    if (key == 'amount') setAmount(amount)
  }, [])

  const createProductTable = useMemo(() => {
    const amountConv: { [type in AmountType]: Unit } = {
      small: unit === 'g' || unit === 'kg' ? 'g' : 'ml',
      big: unit === 'g' || unit === 'kg' ? 'kg' : 'l'
    }

    const product = {
      protein: protein || 0,
      fat: fat || 0,
      carbons: carbons || 0,
      amount: amount || 0,
      unit
    }

    return tableVals.map(curr => ({
      amount: `${curr.amount} ${amountConv[curr.type]}`,
      unit: amountConv[curr.type],
      nutrients: NutrientsCounter(curr.amount, amountConv[curr.type], product, true)
    }))
  }, [unit, protein, fat, carbons, amount])

  const handleProductScan = useCallback(
    async (barcode: BarcodeScanningResult) => {
      setBarcode(barcode.data)
      setScanningBarcode(false)
    },
    [navigation]
  )

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    })

    if (result.canceled) {
      return
    }

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      )
      setPicture(manipResult.uri)
    }
  }, [])

  const handleSaveProduct = async () => {
    try {
      const errors: Record<string, string> = {}
      if (!barcode || barcode.length === 0) {
        errors.barcode = 'Barcode is required'
      }
      if (!name || name.length === 0) {
        errors.name = 'Name is required'
      }
      if (amount == null || amount === 0) {
        errors.amount = 'Amount is required'
      }
      if (carbons == null || fat == null || protein == null) {
        errors.macro = 'All macros are required'
      }
      if (Object.keys(errors).length > 0) {
        setInputErrors(errors)
        return
      }

      const formData = new FormData()
      formData.append('name', name)
      formData.append('barcode', barcode!)
      formData.append('amount', amount!.toString())
      formData.append('unit', unit)
      formData.append('carbons', carbons!.toString())
      formData.append('fat', fat!.toString())
      formData.append('protein', protein!.toString())

      if (picture) {
        formData.append('picture', {
          uri: picture,
          type: 'image/jpeg',
          name: 'product_picture.jpg'
        } as any)
      }

      const result = await addProduct(formData).unwrap()
      if (navMeal || navFridge) {
        navigation.navigate('AddProductToComponent', { product: result, meal: navMeal, fridge: navFridge })
      } else {
        navigation.navigate('Journal')
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  if (isAddingProduct) {
    return <Loader />
  }

  return (
    <ScreenWrapper>
      {scanningBarcode ? (
        <View
          style={{
            position: 'static',
            marginTop: -30,
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'red'
          }}
        >
          <BarcodeScanner onBarcodeScanned={handleProductScan} />
        </View>
      ) : (
        <ScrollView>
          <View style={styles.wrapper}>
            <View style={styles.formWrapper}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, inputErrors.name ? styles.inputError : {}]}
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={colors.neutral.border}
                />
                <View style={styles.doubleInputWrapper}>
                  <TextInput
                    style={[styles.input, styles.doubleInput, inputErrors.barcode ? styles.inputError : {}]}
                    placeholder="Barcode"
                    value={barcode || ''}
                    onChangeText={setBarcode}
                    placeholderTextColor={colors.neutral.border}
                  />
                  <Pressable onPress={() => setScanningBarcode(true)}>
                    <IonIcon name="camera-outline" size={24} color={colors.neutral.text} />
                  </Pressable>
                </View>
                <View style={styles.doubleInputWrapper}>
                  <TextInput
                    style={[styles.input, styles.doubleInput, inputErrors.amount ? styles.inputError : {}]}
                    placeholder="Amount"
                    value={amount?.toString() || ''}
                    keyboardType="numeric"
                    onChangeText={(value: string) => handleNumberchange(value, 'amount')}
                    placeholderTextColor={colors.neutral.border}
                  />
                  <UnitSelector unit={unit} avaibleUnits={'__all__'} setUnit={(unit: Unit) => setUnit(unit)} />
                </View>
                <View style={styles.macroWrapper}>
                  <TextInput
                    style={[styles.input, { flex: 1 }, inputErrors.macro ? styles.inputError : {}]}
                    placeholder="P"
                    value={protein?.toString() || ''}
                    keyboardType="numeric"
                    onChangeText={(value: string) => handleNumberchange(value, 'protein')}
                    placeholderTextColor={colors.neutral.border}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }, inputErrors.macro ? styles.inputError : {}]}
                    placeholder="C"
                    value={carbons?.toString() || ''}
                    keyboardType="numeric"
                    onChangeText={(value: string) => handleNumberchange(value, 'carbons')}
                    placeholderTextColor={colors.neutral.border}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }, inputErrors.macro ? styles.inputError : {}]}
                    placeholder="F"
                    value={fat?.toString() || ''}
                    keyboardType="numeric"
                    onChangeText={(value: string) => handleNumberchange(value, 'fat')}
                    placeholderTextColor={colors.neutral.border}
                  />
                </View>
              </View>
              <View style={styles.imageWrapper}>
                <Image
                  source={picture ? { uri: picture } : require('../../assets/images/product-default.png')}
                  style={styles.imagePreview}
                />
                <Pressable onPress={handlePickImage} style={styles.changeImageButton}>
                  <SimpleLineIcon name="picture" size={24} color={colors.neutral.text} />
                  <Text style={styles.changeImageText}>Change Image</Text>
                </Pressable>
              </View>
            </View>
            {Object.keys(inputErrors).length > 0 && (
              <View
                style={{
                  padding: 16,
                  borderColor: colors.complementary.danger,
                  borderWidth: 1,
                  borderRadius: 8,
                  marginBottom: 16
                }}
              >
                {Object.values(inputErrors).map((error, index) => (
                  <Text key={index} style={{ color: colors.complementary.danger }}>
                    {error}
                  </Text>
                ))}
              </View>
            )}
            <View style={styles.buttonWrapper}>
              <Pressable style={styles.bigButton} onPress={handleSaveProduct}>
                <Text style={styles.bigButtonText}>Submit</Text>
              </Pressable>
            </View>
            <View style={styles.tableWrapper}>
              <Table data={createProductTable} style={styles.table} />
            </View>
          </View>
        </ScrollView>
      )}
    </ScreenWrapper>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      flexDirection: 'column',
      padding: 16
    },
    formWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20
    },
    inputWrapper: {
      flex: 1,
      marginRight: 16,
      gap: 10
    },
    imageWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16
    },
    input: {
      width: '100%',
      padding: 10,
      borderWidth: 1,
      borderColor: colors.neutral.border,
      borderRadius: 8,
      color: colors.neutral.text,
      backgroundColor: colors.neutral.surface
    },
    inputError: {
      borderColor: colors.complementary.danger
    },
    doubleInputWrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10
    },
    doubleInput: {
      flex: 1
    },
    imagePreview: {
      width: 150,
      height: 150,
      borderWidth: 1,
      borderColor: colors.neutral.border,
      marginBottom: 10
    },
    changeImageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.neutral.border,
      borderRadius: 8,
      padding: 8
    },
    changeImageText: {
      marginLeft: 8,
      color: colors.neutral.text
    },
    buttonWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 20
    },
    bigButton: {
      backgroundColor: colors.accent,
      padding: 16,
      borderRadius: 8,
      paddingLeft: 32,
      paddingRight: 32
    },
    bigButtonText: {
      color: colors.neutral.surface,
      fontWeight: 'bold'
    },
    macroWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 5
    },
    tableWrapper: {
      padding: 16
    },
    table: {
      padding: 16
    }
  })

export default memo(AddProduct)
