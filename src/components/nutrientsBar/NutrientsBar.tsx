import { StyleSheet, Text, View } from 'react-native'
import { Nutrients, ThemeColors } from '../../types/Types'
import { memo, useMemo } from 'react'
import { RootState } from '../../redux/Store'
import { useSelector } from 'react-redux'
import ProgressBar from '../progressBar/ProgressBar'
import { CountKcal } from '../../helpers/CountKcal'

type NutrientsBarProps = Nutrients

const NutrientsBar = ({ proteins, fats, carbs }: NutrientsBarProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])
  const kcal = useMemo(() => CountKcal({ proteins: proteins, fats: fats, carbs: carbs }), [fats, carbs, proteins])
  return (
    <View style={styles.BarWrapper}>
      <View style={styles.InfoWrapper}>
        <Text style={styles.InfoText}>kcal</Text>
        <Text style={styles.InfoValue}>{kcal}</Text>
        <ProgressBar
          end={1000}
          current={kcal}
          height={5}
          width={'50%'}
          borderRadius={10}
          frontColor={colors.neutral.text}
          backColor={colors.primary}
          overFlowColor={['#f00', '#8B0000']}
        />
      </View>
      <View style={styles.InfoWrapper}>
        <Text style={styles.InfoText}>P</Text>
        <Text style={styles.InfoValue}>{proteins}</Text>
        <ProgressBar
          end={1000}
          current={proteins}
          height={5}
          width={'50%'}
          borderRadius={10}
          frontColor={colors.neutral.text}
          backColor={colors.primary}
          overFlowColor={['#f00', '#8B0000']}
        />
      </View>
      <View style={styles.InfoWrapper}>
        <Text style={styles.InfoText}>C</Text>
        <Text style={styles.InfoValue}>{carbs}</Text>
        <ProgressBar
          end={1000}
          current={carbs}
          height={5}
          width={'50%'}
          borderRadius={10}
          frontColor={colors.neutral.text}
          backColor={colors.primary}
          overFlowColor={['#f00', '#8B0000']}
        />
      </View>
      <View style={styles.InfoWrapper}>
        <Text style={styles.InfoText}>F</Text>
        <Text style={styles.InfoValue}>{fats}</Text>
        <ProgressBar
          end={1000}
          current={fats}
          height={5}
          width={'50%'}
          borderRadius={10}
          frontColor={colors.neutral.text}
          backColor={colors.primary}
          overFlowColor={['#f00', '#8B0000']}
        />
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
    },
    InfoWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    InfoText: {
      color: colors.primary,
      fontWeight: '600'
    },
    InfoValue: {
      color: colors.primary
    }
  })

export default memo(NutrientsBar)
