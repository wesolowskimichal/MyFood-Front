import { DimensionValue, Pressable, StyleSheet, Text } from 'react-native'
import Dialog, { DialogContent, DialogTrigger } from '../dialog/Dialog'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { useMemo } from 'react'
import { ThemeColors, Unit } from '../../types/Types'

type UnitSelectorProps = {
  unit: Unit
  avaibleUnits: Unit[] | '__all__'
  setUnit: (unit: Unit) => void
  width?: DimensionValue
}

const UnitSelector = ({ unit, avaibleUnits, setUnit, width }: UnitSelectorProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors, width), [colors, width])

  const _avaibleUnits: Unit[] = avaibleUnits === '__all__' ? ['g', 'kg', 'ml', 'l'] : avaibleUnits

  return (
    <Dialog style={styles.DialogContainer}>
      <DialogTrigger style={styles.DialogTrigger}>
        <Text style={styles.UnitText}>{unit}</Text>
      </DialogTrigger>
      <DialogContent style={styles.DialogContent}>
        {_avaibleUnits.map((avaibleUnit, index) => (
          <Pressable
            key={`${avaibleUnit}-${index}`}
            style={[
              styles.DialogContentButton,
              unit === avaibleUnit ? { backgroundColor: colors.neutral.surface } : {}
            ]}
            onPress={() => setUnit(avaibleUnit)}
          >
            <Text>{avaibleUnit}</Text>
          </Pressable>
        ))}
        <Pressable></Pressable>
      </DialogContent>
    </Dialog>
  )
}

const createStyles = (colors: ThemeColors, width?: DimensionValue) =>
  StyleSheet.create({
    DialogContainer: {
      justifyContent: 'flex-end'
    },
    DialogTrigger: {
      borderColor: colors.neutral.text,
      borderWidth: 1,
      borderRadius: 4,
      width: width ?? 60,
      height: 40,
      textAlign: 'center',
      color: colors.neutral.text,
      alignItems: 'center',
      justifyContent: 'center'
    },
    UnitText: {
      color: colors.neutral.text,
      textAlign: 'center'
    },
    DialogContent: {
      width: 250,
      height: 'auto',
      justifyContent: 'space-between',
      gap: 10
    },
    DialogContentButton: {
      borderWidth: 1,
      borderColor: colors.neutral.border,
      borderRadius: 4,
      padding: 10
    }
  })

export default UnitSelector
