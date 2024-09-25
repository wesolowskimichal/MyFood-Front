import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Loader from '../loader/Loader'
import { Pressable, StyleSheet, Text, View, Animated, Easing } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { ThemeColors } from '../../types/Types'
import Icon from 'react-native-vector-icons/Ionicons'

type BarcodeScannerProps = {
  onBarcodeScanned: (barcode: BarcodeScanningResult) => Promise<void>
}

const BarcodeScanner = ({ onBarcodeScanned }: BarcodeScannerProps) => {
  const [facing, setFacing] = useState<'front' | 'back'>('back')
  const [cameraFlash, setCameraFlash] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const [animation] = useState(new Animated.Value(0))
  const [scanning, setScanning] = useState(false)

  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const handleFlashToggle = useCallback(() => {
    setCameraFlash(prev => !prev)
  }, [])

  const handleFacingToggle = useCallback(() => {
    setFacing(prev => (prev === 'back' ? 'front' : 'back'))
  }, [])

  useEffect(() => {
    return () => setCameraFlash(false)
  }, [])

  const startAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ])
    ).start()
  }, [animation])

  const handleBarcodeScanned = useCallback(
    async (barcode: BarcodeScanningResult) => {
      if (!scanning) {
        setScanning(true)
        await onBarcodeScanned(barcode)
        setTimeout(() => setScanning(false), 1000)
      }
    },
    [onBarcodeScanned, scanning]
  )

  if (!permission) {
    return <Loader />
  }

  if (!permission.granted) {
    return (
      <View style={[styles.wrapper, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.infoText}>We need your permission to show the camera</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    )
  }

  startAnimation()

  const animatedStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 200]
        })
      }
    ]
  }

  return (
    <View style={styles.wrapper}>
      <CameraView
        facing={facing}
        style={styles.camera}
        enableTorch={cameraFlash}
        onBarcodeScanned={handleBarcodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayCenter}>
            <View style={styles.overlaySide} />
            <View style={styles.scannerFrame}>
              <Animated.View style={[styles.scanLine, animatedStyle]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />
        </View>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.flashButton} onPress={handleFlashToggle}>
            <Icon name={cameraFlash ? 'flash-off-outline' : 'flash-outline'} size={24} color={colors.neutral.text} />
          </Pressable>
          <Pressable style={styles.switchButton} onPress={handleFacingToggle}>
            <Icon name="camera-reverse-outline" size={24} color={colors.neutral.text} />
          </Pressable>
        </View>
      </CameraView>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      flex: 1
    },
    infoText: {
      color: colors.complementary.info,
      fontSize: 16,
      marginBottom: 16
    },
    permissionButton: {
      backgroundColor: colors.accent,
      padding: 10,
      borderRadius: 5
    },
    permissionButtonText: {
      color: colors.neutral.text,
      fontSize: 16
    },
    camera: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'column'
    },
    overlayTop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    overlayCenter: {
      flexDirection: 'row'
    },
    overlaySide: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    overlayBottom: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    scannerFrame: {
      width: 250,
      height: 250,
      borderColor: colors.accent,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center'
    },
    scanLine: {
      width: '100%',
      height: 2,
      backgroundColor: colors.accent
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 20,
      width: '100%'
    },
    flashButton: {
      backgroundColor: colors.neutral.surface,
      padding: 10,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center'
    },
    switchButton: {
      backgroundColor: colors.neutral.surface,
      padding: 10,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center'
    }
  })

export default BarcodeScanner
