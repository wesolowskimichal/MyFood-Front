import { useSelector } from 'react-redux'
import { ProductInfoScreenProps, ThemeColors, Unit } from '../../types/Types'
import { RootState } from '../../redux/Store'
import { StyleSheet, Text, View } from 'react-native'
import { useLayoutEffect, useMemo } from 'react'
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper'
import { Image } from 'expo-image'
import { NutrientsCounter } from '../../helpers/NutrientsCounter'
import Table from '../../components/table/Table'

// type - small(ml / g), big(l / kg)

type AmountType = 'small' | 'big'

const tableVals: { amount: number; type: AmountType }[] = [
  { amount: 100, type: 'small' },
  { amount: 250, type: 'small' },
  { amount: 1, type: 'big' }
]

const ProductInfo = ({ navigation, route }: ProductInfoScreenProps) => {
  const { product } = route.params
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const createProductTable = useMemo(() => {
    const amountConv: { [type in AmountType]: Unit } = {
      small: product.unit === 'g' || product.unit === 'kg' ? 'g' : 'ml',
      big: product.unit === 'g' || product.unit === 'kg' ? 'kg' : 'l'
    }

    return tableVals.map(curr => ({
      amount: `${curr.amount} ${amountConv[curr.type]}`,
      unit: amountConv[curr.type],
      nutrients: NutrientsCounter(curr.amount, amountConv[curr.type], product)
    }))
  }, [route, product])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: product.name,
      headerTintColor: colors.neutral.text as string,
      headerStyle: { backgroundColor: colors.neutral.border as string }
    })
  }, [navigation, product.name])
  console.log(createProductTable)

  return (
    <ScreenWrapper>
      <View style={styles.Wrapper}>
        <Image source={{ uri: product.picture }} style={styles.Image} />
        <View style={styles.TableWrapper}>
          <Table data={createProductTable} style={styles.Table} />
        </View>
      </View>
    </ScreenWrapper>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    Wrapper: {
      flex: 1,
      backgroundColor: colors.primary,
      padding: 16
    },
    Image: {
      aspectRatio: 1,
      width: '100%',
      borderRadius: 16,
      marginBottom: 16
    },
    TableWrapper: {
      flex: 1,
      backgroundColor: colors.primary,
      padding: 16
    },
    Table: {
      padding: 16
    }
  })

export default ProductInfo
