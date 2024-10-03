import React, { useCallback, useMemo, useState } from 'react'
import { FlatList, StyleSheet, Text, View, TextInput, Pressable } from 'react-native'
import { Fridge as IFridge, FridgeScreenProps, ThemeColors } from '../../types/Types'
import { useGetFridgesQuery } from '../../redux/api/slices/FridgeApiSlice'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import ListItemSkeleton from '../../components/listItemSkeleton/ListItemSkeleton'
import FridgeProduct from '../../components/fridgeProduct/FridgeProduct'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import Icon from 'react-native-vector-icons/Feather'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import EmbeddedSwitch from '../../components/embeddedSwitch/EmbeddedSwitch'
import Loader from '../../components/loader/Loader'
import UpperLoader from '../../components/upperLoader/UpperLoader'

const Fridge = ({ navigation }: FridgeScreenProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const [filters, setFilters] = useState<Record<string, any>>({
    'is-on-shopping-list': false,
    'show-below-threshold': false,
    'product-name': undefined
  })

  const [viewType, setViewType] = useState<'tile' | 'list'>('tile')
  const [page, setPage] = useState(1)

  const {
    data: { fridgeProducts, isFinished } = { fridgeProducts: [], isFinished: true },
    isLoading,
    isFetching
  } = useGetFridgesQuery({ page, filters })

  const handleLoadMoreProducts = useCallback(() => {
    if (!isFetching && !isFinished) {
      setPage(prevPage => prevPage + 1)
    }
  }, [isFetching, fridgeProducts])

  const renderItem = ({ item }: { item: IFridge }) => (
    <FridgeProduct fridgeProduct={item} type={viewType} style={styles.productItem} />
  )

  const handleSwitchToggle = useCallback(() => {
    setViewType(prevType => (prevType === 'tile' ? 'list' : 'tile'))
  }, [])

  const handleOnAddProductClick = useCallback(() => {
    navigation.navigate('AddProductToComponent', { fridge: true })
  }, [navigation])

  const areFiltersEmpty = useMemo(
    () => Object.values(filters).every(value => (value === undefined ? true : value === '' || !value)),
    [filters]
  )

  if (isLoading && page === 1) {
    return <Loader />
  }

  return (
    <ScreenWrapper>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={filters['product-name']}
          onChangeText={text => setFilters({ ...filters, 'product-name': text })}
          placeholder="Search product"
          placeholderTextColor={colors.neutral.text}
        />
        <EmbeddedSwitch
          leftOption={
            <Icon name="grid" size={20} color={viewType === 'tile' ? colors.accent : colors.neutral.border} />
          }
          rightOption={
            <Icon name="list" size={20} color={viewType === 'list' ? colors.accent : colors.neutral.border} />
          }
          onSwitchToggle={handleSwitchToggle}
        />
      </View>
      {isFetching && <UpperLoader />}
      {!isFetching && !isLoading && fridgeProducts.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
            height: '100%',
            width: '100%'
          }}
        >
          <MaterialIcon name="error-outline" size={100} color="#CD5C5C" />
          <View
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10
            }}
          >
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#CD5C5C', fontWeight: '700', fontSize: 20 }}>No products found</Text>
              {areFiltersEmpty ? (
                <Text style={{ color: '#CD5C5C', fontWeight: '500', fontSize: 14 }}>Add products to your fridge</Text>
              ) : (
                <Text style={{ color: '#CD5C5C', fontWeight: '500', fontSize: 14 }}>Try changing your filters</Text>
              )}
            </View>
            <Pressable
              onPress={handleOnAddProductClick}
              style={{
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 10,
                borderWidth: 1,
                borderColor: '#CD5C5C',
                padding: 8,
                borderRadius: 8
              }}
            >
              <MaterialIcon name="add" size={24} color="#CD5C5C" />
              <Text style={{ color: '#CD5C5C', fontWeight: '700', fontSize: 16 }}>Add product</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          key={viewType}
          data={fridgeProducts}
          numColumns={viewType === 'tile' ? 2 : 1}
          style={{ paddingHorizontal: 5 }}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onEndReached={handleLoadMoreProducts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFinished ? null : <ListItemSkeleton width="100%" height={100} borderRadius={10} />}
        />
      )}
      <Pressable style={styles.addProductButton} onPress={handleOnAddProductClick}>
        <MaterialIcon name="add" size={32} color={colors.accent} />
      </Pressable>
    </ScreenWrapper>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
      paddingHorizontal: 5
    },
    input: {
      flex: 1,
      borderColor: colors.neutral.border,
      color: colors.neutral.text,
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      marginRight: 10
    },
    productItem: {
      flex: 1,
      margin: 5
    },
    addProductButton: {
      position: 'absolute',
      bottom: 16,
      right: 16,
      borderColor: colors.accent,
      borderWidth: 1,
      padding: 4,
      borderRadius: 10
    }
  })

export default Fridge
