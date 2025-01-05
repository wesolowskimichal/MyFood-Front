import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { ProductDetails, RootStackParamList, Unit } from '../../types/Types'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { LinearTransition, SlideInLeft, SlideOutRight } from 'react-native-reanimated'
import { NavigationProp } from '@react-navigation/native'
import { useDataQuery } from '../../redux/slices/dataStore/hooks/useDataQuery'
import { Image } from 'expo-image'
import UnitSelector from '../unitSelector/Unitselector'
import { UnitAmountConverter, UnitProductConverter } from '../../helpers/UnitAmountConverter'
import Dialog, { DialogContent, DialogTrigger } from '../dialog/Dialog'
import Icon from 'react-native-vector-icons/Feather'
import { useGetProductbyIdQuery } from '../../redux/api/slices/ProductApiSlice'
import ProductView from '../product/ProductView'

export type ProductInsert = {
  product: ProductDetails
  amount_needed: number
}

type ProductInserterProps = {
  type: 'view' | 'add'
  setData?: (
    data: {
      product_id: string
      amount_needed: number
    }[]
  ) => void
  data?: {
    product_id: string
    amount_needed: number
  }[]
  navigation: NavigationProp<RootStackParamList>
}

const ProductInserter = ({ type, setData, data, navigation }: ProductInserterProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)

  const { added, edited, deleted, addItem, editItem, deleteItem, isEdited, isDeleted, getEdited } = useDataQuery<
    ProductInsert,
    number
  >({
    storeName: 'ProductInsert'
  })

  const products = useMemo(() => {
    const productMap = new Map()
    added.forEach(productInsert => {
      if (isEdited(productInsert.product.id)) {
        productInsert = {
          ...productInsert,
          amount_needed: getEdited(productInsert.product.id) ?? productInsert.amount_needed
        }
      }
      if (!isDeleted(productInsert.product.id) && productInsert.product) {
        productMap.set(productInsert.product.id, productInsert)
      }
    })

    return Array.from(productMap.values())
  }, [added, edited, deleted, isEdited, getEdited, isDeleted])

  const updateProduct = useCallback(
    (id: string, amount: number) => {
      editItem(id, amount)
    },
    [products]
  )

  const addProduct = useCallback(() => {
    navigation.navigate('AddProductToComponent', { recipe: true })
  }, [navigation])

  const removeProduct = useCallback((id: string) => {
    deleteItem(id)
  }, [])

  useEffect(() => {
    if (setData) {
      setData(products.map(({ product, amount_needed }) => ({ product_id: product.id, amount_needed })))
    }
  }, [products])

  return (
    <View style={{ flex: 1, paddingHorizontal: 2, maxHeight: 400 }}>
      <ScrollView nestedScrollEnabled>
        {type === 'add' || !data
          ? products.map(({ product, amount_needed }) => (
              <Animated.View
                key={product.id}
                layout={LinearTransition.springify()}
                entering={SlideInLeft}
                exiting={SlideOutRight}
                style={{
                  maxHeight: 100,
                  width: '100%'
                }}
              >
                <ProductElement
                  product={product}
                  defaultAmount={amount_needed}
                  onAmountChange={amount => editItem(product.id, amount)}
                  onProductRemove={() => removeProduct(product.id)}
                />
              </Animated.View>
            ))
          : data.map(({ product_id, amount_needed }, index) => (
              <Animated.View
                key={index}
                layout={LinearTransition.springify()}
                entering={SlideInLeft}
                exiting={SlideOutRight}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 2
                }}
              >
                <IdProduct
                  navigation={navigation}
                  product_id={product_id}
                  amount_needed={amount_needed}
                  updateProduct={updateProduct}
                  removeProduct={removeProduct}
                />
              </Animated.View>
            ))}
      </ScrollView>

      {type === 'add' && (
        <Pressable
          onPress={addProduct}
          style={{
            backgroundColor: colors.neutral.text,
            borderRadius: 4
          }}
        >
          <Text
            style={{
              color: colors.primary,
              padding: 8,
              textAlign: 'center',
              fontSize: 16,
              fontWeight: '600'
            }}
          >
            ADD PRODUCT
          </Text>
        </Pressable>
      )}
    </View>
  )
}

type IdProductProps = {
  navigation: NavigationProp<RootStackParamList>
  product_id: string
  amount_needed: number
  updateProduct: (product_id: string, amount: number) => void
  removeProduct: (id: string) => void
}

const IdProduct = ({ navigation, product_id, amount_needed, updateProduct, removeProduct }: IdProductProps) => {
  const { data: product, error } = useGetProductbyIdQuery(product_id)
  const colors = useSelector((state: RootState) => state.theme.colors)

  if (error) {
    return <Text>{error.toString()}</Text>
  }

  if (!product) {
    return <ActivityIndicator size="small" color={colors.accent} />
  }

  return <ProductView navigation={navigation} product={product} amount={amount_needed} unit={product.unit} />
}

type ProductElementProps = {
  product: ProductDetails
  defaultAmount: number
  onAmountChange: (amount: number) => void
  onProductRemove: () => void
}
const _ProductElement = ({ product, defaultAmount, onAmountChange, onProductRemove }: ProductElementProps) => {
  const [amount, setAmount] = useState(UnitAmountConverter(defaultAmount, product.unit).amount)
  const [unit, setUnit] = useState(UnitAmountConverter(defaultAmount, product.unit).unit)
  const [shouldDecrease, setShouldDecrease] = useState(true)
  const [isRemoveProductDialogVisible, setIsRemoveProductDialogVisible] = useState(false)
  const colors = useSelector((state: RootState) => state.theme.colors)

  const avaibleUnits = useMemo((): Unit[] => {
    if (product.unit === 'g' || product.unit === 'kg') {
      return ['g', 'kg']
    }
    return ['ml', 'l']
  }, [product.unit])

  const handleUnitChange = useCallback(
    (newUnit: Unit) => {
      setUnit(newUnit)
      onAmountChange(UnitProductConverter(amount, newUnit, product))
    },
    [amount, product, onAmountChange]
  )

  const handleAmountChange = useCallback(
    (text: string) => {
      const numericValue = parseFloat(text)
      setAmount(prev => {
        if (isNaN(numericValue) || numericValue <= 0) {
          if (shouldDecrease) {
            setShouldDecrease(false)
          }
          onAmountChange(0)
          return 0
        }
        setShouldDecrease(true)
        const amount = numericValue
        onAmountChange(amount)
        return amount
      })
    },
    [onAmountChange, unit, product, shouldDecrease]
  )

  useEffect(() => {
    onAmountChange(amount)
  }, [amount])

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        borderWidth: 1,
        paddingLeft: 4,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 16
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          overflow: 'hidden',
          flex: 1
        }}
      >
        <Image
          source={{ uri: product.picture }}
          style={{ aspectRatio: 1, width: 42, borderRadius: 4, borderWidth: 1, borderColor: colors.neutral.border }}
        />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            fontWeight: '700',
            fontSize: 14
          }}
        >
          {product.name}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4
        }}
      >
        <TextInput
          style={{
            borderColor: colors.neutral.text,
            borderWidth: 1,
            borderRadius: 4,
            width: 42,
            height: 36,
            textAlign: 'center',
            color: colors.neutral.text
          }}
          value={amount?.toString() ?? 0}
          keyboardType="numeric"
          onChangeText={handleAmountChange}
        />
        <UnitSelector unit={unit} avaibleUnits={avaibleUnits} setUnit={handleUnitChange} />
        <Dialog visible={isRemoveProductDialogVisible} setVisible={setIsRemoveProductDialogVisible}>
          <DialogTrigger
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            <Icon name="trash-2" size={24} color={colors.complementary.danger} style={{ padding: 4 }} />
          </DialogTrigger>
          <DialogContent style={{ flexDirection: 'column', gap: 24 }}>
            <Text style={{ color: colors.neutral.text, fontSize: 16, textAlign: 'center', fontWeight: '600' }}>
              Are you sure you want to remove this product from Recipe?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Pressable
                onPress={onProductRemove}
                style={{
                  borderWidth: 1,
                  borderColor: colors.neutral.border,
                  borderRadius: 4,
                  padding: 10,
                  width: 100,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#CD5C5C',
                  flexDirection: 'row',
                  gap: 5
                }}
              >
                <Text style={{ color: colors.primary }}>Yes</Text>
                <Icon name="trash-2" size={14} color={colors.primary} />
              </Pressable>
              <Pressable
                style={{
                  borderWidth: 1,
                  borderColor: colors.neutral.border,
                  borderRadius: 4,
                  padding: 10,
                  width: 100,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onPress={() => setIsRemoveProductDialogVisible(false)}
              >
                <Text>No</Text>
              </Pressable>
            </View>
          </DialogContent>
        </Dialog>
      </View>
    </Animated.View>
  )
}

export const ProductElement = memo(_ProductElement)

export default ProductInserter
