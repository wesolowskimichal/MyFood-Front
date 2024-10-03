import { useCallback } from 'react'
import BarcodeScanner from '../../components/barcodeScanner/BarcodeScanner'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import { useLazyGetProductQuery } from '../../redux/api/slices/ProductApiSlice'
import { BarcodeScanningResult } from 'expo-camera'
import Loader from '../../components/loader/Loader'
import { usePostJournalMutation } from '../../redux/api/slices/JournalApiSlice'
import { UnitProductConverter } from '../../helpers/UnitAmountConverter'
import AddProductForm from '../../forms/AddProductForm'
import { AddProductToComponentScreenProps, Unit } from '../../types/Types'
import { useAddFridgeProductMutation } from '../../redux/api/slices/FridgeApiSlice'

const AddProductToComponent = ({ navigation, route }: AddProductToComponentScreenProps) => {
  const [getProduct, { isLoading: isProductLoading }] = useLazyGetProductQuery()
  const [addProductToJournal, { isLoading: isAddingProductToJournal }] = usePostJournalMutation()
  const [addProductToFridge, { isLoading: isAddingProductToFridge }] = useAddFridgeProductMutation()
  const navProduct = route.params?.product ?? null
  const navMeal = route.params.meal
  const navFridge = route.params.fridge

  const handleProductScan = useCallback(
    async (barcode: BarcodeScanningResult) => {
      try {
        const response = await getProduct(barcode.data, true).unwrap()
        navigation.navigate('AddProductToComponent', { product: response, meal: navMeal, fridge: navFridge })
      } catch (error) {
        navigation.navigate('ProductNotFound', { barcode: barcode.data, meal: navMeal, fridge: navFridge })
      }
    },
    [getProduct, navigation]
  )

  const handleOnSubmit = useCallback(
    async (amount: number, unit: Unit) => {
      if (!navProduct || !(navMeal || navFridge)) return
      try {
        if (navMeal) {
          await addProductToJournal({
            object: navProduct,
            object_amount: UnitProductConverter(amount, unit, navProduct),
            object_type: 'product',
            date: new Date(),
            meal: navMeal
          })
          navigation.navigate('Journal')
        } else if (navFridge) {
          await addProductToFridge({
            product: navProduct,
            current_amount: UnitProductConverter(amount, unit, navProduct)
          })
          navigation.navigate('Fridge')
        }
      } catch (error) {
        console.error(error)
      }
    },
    [navProduct, navMeal]
  )

  if (isProductLoading || isAddingProductToJournal || isAddingProductToFridge) {
    return <Loader />
  }

  return (
    <ScreenWrapper>
      {navProduct ? (
        <AddProductForm product={navProduct} onSubmit={handleOnSubmit} />
      ) : (
        <BarcodeScanner onBarcodeScanned={handleProductScan} />
      )}
    </ScreenWrapper>
  )
}

export default AddProductToComponent
