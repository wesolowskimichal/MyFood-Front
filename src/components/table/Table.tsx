import React, { useMemo } from 'react'
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { Nutrients, ThemeColors } from '../../types/Types'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'

type Data = {
  amount: string
  nutrients: Nutrients
  unit: string
}

type TableProps<T> = {
  data: T[]
  style?: StyleProp<ViewStyle>
  showKcal?: boolean
}

const transformData = (data: Data[], nutrients: string[] = ['proteins', 'fats', 'carbs']) => {
  const headers = data.map(item => item.amount)

  const rows = nutrients.map(nutrient => ({
    nutrient,
    values: data.map(item => item.nutrients[nutrient as keyof Nutrients])
  }))

  return { headers, rows }
}

const Table = <T,>({ data, style, showKcal = false }: TableProps<T>) => {
  const nutrients = showKcal ? ['kcal', 'proteins', 'fats', 'carbs'] : ['proteins', 'fats', 'carbs']
  const { headers, rows } = transformData(data as unknown as Data[], nutrients)
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <View style={style}>
      <View style={styles.headerRow}>
        <Text style={styles.cell}></Text>
        {headers.map((header, index) => (
          <Text style={styles.headerCell} key={index}>
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View style={styles.row} key={rowIndex}>
          <Text style={styles.infoCell}>{row.nutrient.charAt(0).toUpperCase() + row.nutrient.slice(1)}</Text>
          {row.values.map((value, index) => (
            <Text style={styles.cell} key={index}>
              {isNaN(value) ? '-' : value}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.accent
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.accent,
      borderLeftWidth: 1,
      borderLeftColor: colors.accent
    },
    headerCell: {
      flex: 1,
      padding: 5,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.neutral.text,
      borderTopWidth: 1,
      borderTopColor: colors.accent,
      borderRightWidth: 1,
      borderRightColor: colors.accent
    },
    infoCell: {
      flex: 1,
      padding: 5,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.neutral.text,
      borderRightWidth: 1,
      borderRightColor: colors.accent
    },
    cell: {
      flex: 1,
      padding: 5,
      textAlign: 'center',
      borderRightWidth: 1,
      color: colors.neutral.text,
      borderRightColor: colors.accent
    }
  })

export default Table
