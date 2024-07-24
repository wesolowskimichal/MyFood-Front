import { StyleSheet, Text, View } from 'react-native'
import { Nutrients, ThemeColors } from '../../types/Types'
import { memo, useMemo } from 'react'
import { RootState } from '../../redux/Store'
import { useSelector } from 'react-redux'
import ProgressBar from '../progressBar/ProgressBar'

type NutrientsBarProps = Nutrients

const NutrientsBar = ({ proteins, fats, carbs }: NutrientsBarProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])
  return (
    <View style={styles.BarWrapper}>
      <View style={styles.InfoWrapper}>
        <Text style={styles.InfoText}>kcal</Text>
        <Text style={styles.InfoText}>123</Text>
      </View>
      <View style={styles.InfoWrapper}>
        <Text style={styles.InfoText}>P</Text>
        <Text style={styles.InfoText}>{proteins}</Text>
        <ProgressBar end={1000} current={proteins} height={5} width={'50%'} borderRadius={10} />
      </View>
      <View style={styles.InfoWrapper}>
        <Text style={styles.InfoText}>C</Text>
        <Text style={styles.InfoText}>{carbs}</Text>
      </View>
      <View style={styles.InfoWrapper}>
        <Text style={styles.InfoText}>F</Text>
        <Text style={styles.InfoText}>{fats}</Text>
      </View>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    BarWrapper: {
      height: 60,
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.accent
      //   borderTopLeftRadius: 24,
      //   borderTopRightRadius: 24
    },
    InfoWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    InfoText: {
      color: colors.primary
    }
  })

export default memo(NutrientsBar)
