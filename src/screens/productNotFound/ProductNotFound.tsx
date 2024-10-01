import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react'
import { FlatList, TextInput, StyleSheet, Pressable, Text } from 'react-native'
import { ProductDetails, ProductNotFoundScreenProps } from '../../types/Types'
import { useLazyGetProductsQuery } from '../../redux/api/slices/ProductApiSlice'
import { useSelector } from 'react-redux'
import Loader from '../../components/loader/Loader'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import ProductInfoBar from '../../components/productInfoBar/ProductInfoBar'
import ListItemSkeleton from '../../components/listItemSkeleton/ListItemSkeleton'
import debounce from 'lodash.debounce'
import { RootState } from '../../redux/Store'
import IonIcon from 'react-native-vector-icons/Ionicons'

const ProductNotFound = ({ navigation, route }: ProductNotFoundScreenProps) => {
  const { barcode, meal } = route.params
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(barcode)
  const [isFinished, setIsFinished] = useState(true)
  const [searchType, setSearchType] = useState<'by_name' | 'by_barcode'>('by_barcode')
  const [accumulatedProducts, setAccumulatedProducts] = useState<ProductDetails[]>([])

  const [trigger, { isLoading }] = useLazyGetProductsQuery()
  const colors = useSelector((state: RootState) => state.theme.colors)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.neutral.text as string,
      headerStyle: { backgroundColor: colors.neutral.border as string }
    })
  }, [navigation, colors])

  const determineSearchType = (text: string) => {
    return /^\d+$/.test(text) ? 'by_barcode' : 'by_name'
  }

  const fetchProducts = useCallback(
    async (filters: Record<string, string>, replace = false) => {
      try {
        const result = await trigger({ page, filters })
        if (result.data) {
          setIsFinished(!result.data.next)
          setAccumulatedProducts(prevProducts =>
            replace ? result.data!.results : [...prevProducts, ...result.data!.results]
          )
        }
      } catch (error) {
        console.error(error)
      }
    },
    [page, trigger]
  )

  const fetchWithType = useCallback(() => {
    const filters: Record<string, string> = searchType === 'by_barcode' ? { barcode: search } : { name: search }
    fetchProducts(filters, page === 1)
  }, [search, searchType, page, fetchProducts])

  useEffect(() => {
    const debouncedFetch = debounce(fetchWithType, 300)
    debouncedFetch()
    return () => {
      debouncedFetch.cancel()
    }
  }, [fetchWithType])

  const handleSearchInput = useCallback((text: string) => {
    const type = determineSearchType(text)
    setSearchType(type)
    setSearch(text)
    setPage(1)
    setAccumulatedProducts([])
  }, [])

  const handleLoadMoreProducts = useCallback(() => {
    if (!isLoading && !isFinished) {
      setPage(prevPage => prevPage + 1)
    }
  }, [isLoading, isFinished])

  const renderItem = ({ item }: { item: ProductDetails }) => (
    <ProductInfoBar product={item} navigation={navigation} meal={meal} />
  )

  if (isLoading && page === 1) {
    return <Loader />
  }

  return (
    <ScreenWrapper>
      <TextInput
        value={search}
        onChangeText={handleSearchInput}
        style={[styles.input, { borderColor: colors.neutral.border, color: colors.neutral.text }]}
        placeholder="Search..."
        placeholderTextColor={colors.neutral.text}
      />
      <Pressable
        onPress={() => navigation.navigate('AddProduct', { barcode, meal })}
        style={{
          backgroundColor: colors.neutral.surface,
          padding: 16,
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
          borderRadius: 8
        }}
      >
        <IonIcon name="add-outline" size={24} color={colors.neutral.text} />
        <Text style={{ color: colors.neutral.text, fontSize: 16, fontWeight: '600' }}>Add product</Text>
      </Pressable>
      <FlatList
        data={accumulatedProducts}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onEndReached={handleLoadMoreProducts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFinished ? null : <ListItemSkeleton width="100%" height={100} borderRadius={10} />}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  }
})

export default ProductNotFound
