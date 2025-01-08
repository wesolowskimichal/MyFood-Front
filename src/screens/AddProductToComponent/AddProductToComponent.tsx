import { useCallback, useEffect } from 'react'
import BarcodeScanner from '../../components/barcodeScanner/BarcodeScanner'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import { useLazyGetProductQuery } from '../../redux/api/slices/ProductApiSlice'
import { BarcodeScanningResult } from 'expo-camera'
import Loader from '../../components/loader/Loader'
import { usePostJournalMutation } from '../../redux/api/slices/JournalApiSlice'
import { UnitProductConverter } from '../../helpers/UnitAmountConverter'
import AddProductForm from '../../forms/AddProductForm'
import { AddProductToComponentScreenProps, Meal, Recipe, Unit } from '../../types/Types'
import { useAddFridgeProductMutation } from '../../redux/api/slices/FridgeApiSlice'
import { useDataQuery } from '../../redux/slices/dataStore/hooks/useDataQuery'

const AddProductToComponent = ({ navigation, route }: AddProductToComponentScreenProps) => {
  const [getProduct, { isLoading: isProductLoading, isFetching: isProductFetching }] = useLazyGetProductQuery()
  const [addProductToJournal, { isLoading: isAddingProductToJournal }] = usePostJournalMutation()
  const [addProductToFridge, { isLoading: isAddingProductToFridge }] = useAddFridgeProductMutation()
  const navProduct = route.params?.product ?? null
  const navMeal = route.params.meal
  const journalRecipe = route.params.journalRecipe
  const navFridge = route.params.fridge
  const navRecipe = route.params.recipe
  const storeName = navMeal ? 'Journal' : navFridge ? 'Fridge' : 'ProductInsert'
  const { addItem } = useDataQuery({
    storeName
  })

  const handleProductScan = useCallback(
    async (barcode: BarcodeScanningResult) => {
      try {
        if (barcode.type === 'recipe') {
          navigation.navigate('RecipesList', { meal: navMeal })
          return
        }
        const response = await getProduct(barcode.data, true).unwrap()
        navigation.navigate('AddProductToComponent', {
          product: response,
          meal: navMeal,
          fridge: navFridge,
          recipe: navRecipe
        })
      } catch (error) {
        navigation.navigate('ProductNotFound', {
          barcode: barcode.data,
          meal: navMeal,
          fridge: navFridge,
          recipe: navRecipe
        })
      }
    },
    [getProduct, navigation, navMeal, navFridge, navRecipe]
  )

  const handleOnSubmit = useCallback(
    async (amount: number, unit: Unit) => {
      console.log({ navMeal, navFridge, navRecipe })
      if (!navProduct || !(navMeal || navFridge || navRecipe)) return
      try {
        if (navMeal) {
          if (journalRecipe) {
            await addProductToJournal({
              object: journalRecipe,
              object_amount: journalRecipe.servings,
              object_type: 'product',
              meal: navMeal
            })
          }
          await addProductToJournal({
            object: navProduct,
            object_amount: UnitProductConverter(amount, unit, navProduct),
            object_type: 'product',
            meal: navMeal
          })
          navigation.navigate('Journal')
        } else if (navFridge) {
          const { id } = await addProductToFridge({
            product: navProduct,
            current_amount: UnitProductConverter(amount, unit, navProduct)
          }).unwrap()
          addItem(
            {
              id,
              product: navProduct,
              current_amount: UnitProductConverter(amount, unit, navProduct),
              threshold: 0,
              is_on_shopping_list: false
            },
            id
          )
          navigation.navigate('Fridge')
        } else if (navRecipe) {
          addItem(
            {
              product: navProduct,
              amount_needed: UnitProductConverter(amount, unit, navProduct)
            },
            navProduct.id
          )
          if (navRecipe.add) {
            navigation.navigate('AddRecipe')
          } else if (navRecipe.edit) {
            navigation.navigate('EditRecipe', { recipe: navRecipe.edit })
          }
        }
      } catch (error) {
        console.error(error)
      }
    },
    [navigation, navProduct, navMeal, navRecipe]
  )

  useEffect(() => {
    const addRecipeToJournal = async (recipe: Recipe, meal: Meal) => {
      await addProductToJournal({
        object: recipe,
        object_amount: recipe.servings,
        object_type: 'recipe',
        meal: meal
      })
    }
    if (journalRecipe && navMeal) {
      addRecipeToJournal(journalRecipe, navMeal)
      navigation.navigate('Journal')
    }
  }, [journalRecipe, navMeal])

  if (isProductLoading || isAddingProductToJournal || isAddingProductToFridge || isProductFetching) {
    return <Loader />
  }

  return (
    <ScreenWrapper>
      {navProduct ? (
        <AddProductForm product={navProduct} onSubmit={handleOnSubmit} />
      ) : (
        <BarcodeScanner onBarcodeScanned={handleProductScan} journalAdd={navMeal} />
      )}
    </ScreenWrapper>
  )
}

export default AddProductToComponent
