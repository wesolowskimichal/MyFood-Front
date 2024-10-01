import { useEffect,  useState } from 'react'
import { AnimatableNumericValue, Animated, ColorValue, DimensionValue, View } from 'react-native'

type ProgressBarProps = {
  start?: number
  end?: number
  current: number
  frontColor?: ColorValue
  backColor?: ColorValue
  overFlowColor?: ColorValue | ColorValue[]
  width?: DimensionValue
  height?: DimensionValue
  borderRadius?: AnimatableNumericValue
}

const ProgressBar = ({
  start = 0,
  end = 100,
  current,
  frontColor = '#000',
  backColor = '#fff',
  overFlowColor = ['#000', '#f00', '#8B0000'],
  width = '100%',
  height = 20,
  borderRadius = 0
}: ProgressBarProps) => {
  const [color, setColor] = useState<ColorValue>(frontColor)
  const [colorB, setColorB] = useState<ColorValue>(backColor)
  const [animatedWidth, _setAnimatedWidth] = useState(new Animated.Value(0))

  const calculateColors = (current: number) => {
    let width = Math.floor(((current - start) / (end - start)) * 100)
    if (current > end) {
      if (Array.isArray(overFlowColor)) {
        const state = Math.floor(width / 100) - 1
        setColor(overFlowColor[state >= overFlowColor.length ? overFlowColor.length - 1 : state])

        if (state > 0 && overFlowColor.length >= 2) {
          setColorB(overFlowColor[state >= overFlowColor.length ? overFlowColor.length - 2 : state - 1])
        } else {
          setColorB(frontColor)
        }
      } else {
        setColor(overFlowColor)
        setColorB(backColor)
      }
      width %= 100
    } else {
      setColor(frontColor)
      setColorB(backColor)
    }

    Animated.timing(animatedWidth, {
      toValue: width,
      duration: 500,
      useNativeDriver: false
    }).start()
  }

  useEffect(() => {
    calculateColors(current)
  }, [frontColor, backColor])

  useEffect(() => {
    calculateColors(current)
  }, [current])

  const frontWidth = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  })
  return (
    <View style={{ backgroundColor: colorB, width: width, height: height, borderRadius: borderRadius }}>
      <Animated.View
        style={{ backgroundColor: color, width: frontWidth, height: '100%', borderRadius: borderRadius }}
      ></Animated.View>
    </View>
  )
}

export default ProgressBar
