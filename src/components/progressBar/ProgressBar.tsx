import { useEffect, useMemo, useState } from 'react'
import { AnimatableNumericValue, Animated, ColorValue, DimensionValue, View } from 'react-native'

type ProgressBarProps = {
  start?: number
  end?: number
  current: number
  frontColor?: ColorValue
  backColor?: ColorValue
  overFlowColor?: ColorValue
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
  overFlowColor = '#f00',
  width = '100%',
  height = 20,
  borderRadius = 0
}: ProgressBarProps) => {
  console.log('progress bar rerender')
  const [color, setColor] = useState<ColorValue>(frontColor)
  const [animatedWidth, _setAnimatedWidth] = useState(new Animated.Value(0))

  useEffect(() => {
    let width = Math.floor(((current - start) / (end - start)) * 100)
    if (current > end) {
      setColor(overFlowColor)
      width = Math.floor(((current - start - end) / (end - start)) * 100)
    }
    console.log(width)

    Animated.timing(animatedWidth, {
      toValue: width,
      duration: 500,
      useNativeDriver: false
    }).start()
  }, [current])

  const frontWidth = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  })
  return (
    <View style={{ backgroundColor: backColor, width: width, height: height, borderRadius: borderRadius }}>
      <Animated.View
        style={{ backgroundColor: color, width: frontWidth, height: '100%', borderRadius: borderRadius }}
      ></Animated.View>
    </View>
  )
}

export default ProgressBar
