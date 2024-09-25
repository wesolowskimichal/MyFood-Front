import { useCallback } from 'react'
import BarcodeScanner from '../../components/barcodeScanner/BarcodeScanner'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import { AddProductToJournalScreenProps, ProductDetails, Unit } from '../../types/Types'
import { useLazyGetProductQuery } from '../../redux/api/slices/ProductApiSlice'
import { BarcodeScanningResult } from 'expo-camera'
import Loader from '../../components/loader/Loader'
import AddProductForm from './views/AddProductForm'
import { usePostJournalMutation } from '../../redux/api/slices/JournalApiSlice'
import { UnitAmountConverter, UnitProductConverter } from '../../helpers/UnitAmountConverter'

const AddProductToJournal = ({ navigation, route }: AddProductToJournalScreenProps) => {
  const [getProduct, { isLoading: isProductLoading }] = useLazyGetProductQuery()
  const [addProductToJournal, { isLoading: isAddingProductToJournal, error: addProductToJournalError }] =
    usePostJournalMutation()
  const navProduct = route.params?.product ?? null
  const navMeal = route.params.meal

  const handleProductScan = useCallback(
    async (barcode: BarcodeScanningResult) => {
      try {
        const response = await getProduct(barcode.data, true).unwrap()
        // post product to journal and go to journal
        navigation.navigate('AddProductToJournal', { product: response, meal: navMeal })
      } catch (error) {
        navigation.navigate('ProductNotFound', { barcode: barcode.data, meal: navMeal })
      }
    },
    [getProduct, navigation]
  )

  const handleOnSubmit = useCallback(
    async (amount: number, unit: Unit) => {
      if (!navProduct || !navMeal) return
      try {
        await addProductToJournal({
          object: navProduct,
          object_amount: UnitProductConverter(amount, unit, navProduct),
          object_type: 'product',
          date: new Date(),
          meal: navMeal
        })
        navigation.navigate('Journal')
      } catch (error) {
        console.error(error)
      }
    },
    [navProduct, navMeal]
  )

  if (isProductLoading || isAddingProductToJournal) {
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

export default AddProductToJournal
