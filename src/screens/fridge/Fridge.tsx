import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, StyleSheet, Text, View, TextInput, Pressable, Dimensions } from 'react-native'
import { Fridge as IFridge, FridgeScreenProps, ThemeColors } from '../../types/Types'
import { useLazyGetFridgesQuery } from '../../redux/api/slices/FridgeApiSlice'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import ListItemSkeleton from '../../components/listItemSkeleton/ListItemSkeleton'
import FridgeProduct from '../../components/fridgeProduct/FridgeProduct'
import { debounce } from 'lodash'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import Icon from 'react-native-vector-icons/Feather'

const Fridge = ({ navigation, route }: FridgeScreenProps) => {
  const [getFridgeProducts, { isLoading: isFridgeLoading }] = useLazyGetFridgesQuery()

  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const [filters, setFilters] = useState<Record<string, any>>({
    'is-on-shopping-list': false,
    'show-below-threshold': false,
    'product-name': undefined
  })
  const [fridgeProducts, setFridgeProducts] = useState<IFridge[]>([])
  const [isFinished, setIsFinished] = useState(false)
  const [page, setPage] = useState(1)
  const [viewType, setViewType] = useState<'tile' | 'list'>('tile')

  useEffect(() => {
    getFridgeProducts({ page: 1 })
  }, [])

  const fetchFridgeProducts = useCallback(
    async (replace = false) => {
      try {
        const result = await getFridgeProducts({ page, filters })
        if (result.data) {
          setIsFinished(!result.data.next)
          setFridgeProducts(prevProducts =>
            replace ? result.data!.results : [...prevProducts, ...result.data!.results]
          )
        }
      } catch (error) {
        console.error(error)
      }
    },
    [page, filters, getFridgeProducts]
  )

  const handleLoadMoreProducts = useCallback(() => {
    if (!isFridgeLoading && !isFinished) {
      setPage(prevPage => prevPage + 1)
    }
  }, [isFridgeLoading, isFinished])

  const renderItem = ({ item }: { item: IFridge }) => (
    <FridgeProduct fridgeProduct={item} type={viewType} style={styles.productItem} />
  )

  useEffect(() => {
    const debouncedFetch = debounce(fetchFridgeProducts, 300)
    debouncedFetch()
    return () => {
      debouncedFetch.cancel()
    }
  }, [fetchFridgeProducts])

  // Custom animated switch
  const switchPosition = useSharedValue(0)

  const handleSwitchToggle = useCallback(() => {
    setViewType(prevType => (prevType === 'tile' ? 'list' : 'tile'))
    switchPosition.value = withSpring(viewType === 'tile' ? 24 : 0, { damping: 20 })
  }, [viewType, switchPosition])

  const switchStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: switchPosition.value }]
  }))

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
        <Pressable onPress={handleSwitchToggle} style={styles.switchContainer}>
          <Icon name="grid" size={20} color={viewType === 'tile' ? colors.accent : colors.neutral.border} />
          <View style={styles.switchTrack}>
            <Animated.View style={[styles.switchThumb, switchStyle]} />
          </View>
          <Icon name="list" size={20} color={viewType === 'list' ? colors.accent : colors.neutral.border} />
        </Pressable>
      </View>

      <FlatList
        key={viewType} // Force re-render when viewType changes
        data={fridgeProducts}
        numColumns={viewType === 'tile' ? 2 : 1}
        style={{ paddingHorizontal: 5 }}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onEndReached={handleLoadMoreProducts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFinished ? null : <ListItemSkeleton width="100%" height={100} borderRadius={10} />}
      />
    </ScreenWrapper>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10
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
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    switchTrack: {
      width: 48,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.neutral.border,
      justifyContent: 'center',
      marginRight: 8
    },
    switchThumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary
    },
    productItem: {
      flex: 1,
      margin: 5
    }
  })

export default Fridge
