import React, { useMemo, useEffect, useState } from 'react'
import { View, Text, TextInput, Button, Switch, StyleSheet, Pressable } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated'
import { z } from 'zod'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { AddRecipeScreenProps, ThemeColors } from '../../types/Types'
import StepCreator from '../../components/stepCreator/StepCreator'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import ProductInserter from '../../components/productInserter/ProductInserter'
import { useAddRecipeMutation } from '../../redux/api/slices/RecipeApiSlice'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { Image } from 'expo-image'
import * as FileSystem from 'expo-file-system'

const recipeSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  shared: z.boolean(),
  products: z.array(
    z.object({
      product_id: z.string(),
      amount_needed: z.number().min(1, { message: 'Amount needed must be greater than 0' })
    })
  ),
  preparation: z.string(),
  time: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard'], { message: 'Difficulty must be set' }),
  servings: z.number().min(1, { message: 'Servings must be greater than 0' }),
  picture: z.string().optional()
})

type recipeType = z.infer<typeof recipeSchema>

const AddRecipe = ({ navigation }: AddRecipeScreenProps) => {
  const [addRecipe, { isLoading: isAddRecipeLoading, isError: isAddRecipeError }] = useAddRecipeMutation()
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      description: '',
      shared: false,
      products: [],
      preparation: '',
      time: '',
      difficulty: '',
      servings: 1,
      picture: ''
    }
  })

  const [isTimePickerVisible, setTimePickerVisibility] = useState(false)

  const showTimePicker = () => {
    setTimePickerVisibility(true)
  }

  const hideTimePicker = () => {
    setTimePickerVisibility(false)
  }

  const selectedDifficulty = useSharedValue(-1)
  const slideValue = useSharedValue(-300)

  const customColors = {
    easy: { background: '#A5D6A7', border: '#388E3C' },
    medium: { background: '#FBC02D', border: '#FFF59D' },
    hard: { background: '#EF9A9A', border: '#D32F2F' },
    defaultBackground: colors.neutral.surface as string,
    defaultBorder: colors.neutral.border as string
  }

  useEffect(() => {
    slideValue.value = 0
  }, [])

  const getAnimatedDifficultyStyles = (levelIndex: number) => {
    return useAnimatedStyle(() => {
      const isSelected = levelIndex === selectedDifficulty.value

      return {
        backgroundColor: withTiming(
          isSelected
            ? levelIndex === 0
              ? customColors.easy.background
              : levelIndex === 1
              ? customColors.medium.background
              : customColors.hard.background
            : customColors.defaultBackground,
          { duration: 300 }
        ),
        borderColor: withTiming(
          isSelected
            ? levelIndex === 0
              ? customColors.easy.border
              : levelIndex === 1
              ? customColors.medium.border
              : customColors.hard.border
            : customColors.defaultBorder,
          { duration: 300 }
        ),
        borderWidth: withTiming(isSelected ? 2 : 1, { duration: 300 })
      }
    })
  }

  const pickImage = async (onChange: (uri: string) => void) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    })

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      )
      onChange(manipResult.uri)
    }
  }

  const onSubmit = async (data: any) => {
    const payload: recipeType = { ...data }

    if (data.picture) {
      const base64Image = await FileSystem.readAsStringAsync(data.picture, { encoding: 'base64' })
      payload.picture = `data:image/jpeg;base64,${base64Image}`
    } else {
      delete payload.picture
    }
    console.log(payload)
    try {
      await addRecipe(payload).unwrap()
      navigation.goBack()
    } catch (error) {
      console.error('Error adding recipe:', error)
    }
  }

  return (
    <Animated.ScrollView contentContainerStyle={styles.formContainer}>
      <Animated.View style={styles.section}>
        <Text style={styles.sectionHeader}>General Information</Text>
        <Controller
          name="picture"
          control={control}
          render={({ field: { onChange, value } }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
              <Image
                source={value ? { uri: value } : require('../../assets/images/recipe-default.jpg')}
                style={{ width: 100, height: 100, borderRadius: 4, marginBottom: 12 }}
              />
              <Pressable
                onPress={() => pickImage(onChange)}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 16,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: colors.accent,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Text
                  style={{
                    color: colors.accent
                  }}
                >
                  Select Image
                </Text>
              </Pressable>
            </View>
          )}
        />

        <View style={{ padding: 8 }}>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Text style={[styles.label, errors.name && { color: colors.complementary.danger }]}>Recipe Name</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name.message as string}</Text>}
              </>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Text style={styles.label}>Description</Text>
                <TextInput style={[styles.input, { minHeight: 64 }]} onChangeText={onChange} value={value} multiline />
              </>
            )}
          />

          <Controller
            name="shared"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View style={styles.toggleWrapper}>
                <Text style={styles.label}>Shared</Text>
                <Switch
                  trackColor={{ false: colors.neutral.border, true: colors.complementary.info }}
                  thumbColor={value ? colors.accent : colors.neutral.text}
                  onValueChange={onChange}
                  value={value}
                />
              </View>
            )}
          />

          <Controller
            name="difficulty"
            control={control}
            render={({ field: { onChange, value: _value } }) => (
              <>
                <Text style={[styles.label, errors.difficulty && { color: colors.complementary.danger }]}>
                  Difficulty
                </Text>
                <View style={styles.difficultyContainer}>
                  {['easy', 'medium', 'hard'].map((level, index) => {
                    const animatedStyles = getAnimatedDifficultyStyles(index)
                    return (
                      <Animated.View key={level} style={[styles.difficultyButton, animatedStyles]}>
                        <Pressable
                          onPress={() => {
                            onChange(level)
                            selectedDifficulty.value = index
                          }}
                        >
                          <Text style={styles.difficultyText}>{level}</Text>
                        </Pressable>
                      </Animated.View>
                    )
                  })}
                </View>
                {errors.difficulty && <Text style={styles.errorText}>{errors.difficulty.message as string}</Text>}
              </>
            )}
          />

          <Controller
            name="servings"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <View style={[styles.toggleWrapper, { marginBottom: 0 }]}>
                  <Text style={[styles.label, errors.servings && { color: colors.complementary.danger }]}>
                    Servings
                  </Text>
                  <TextInput
                    style={[styles.input, { textAlign: 'center' }, errors.servings && styles.inputError]}
                    keyboardType="numeric"
                    onChangeText={text => {
                      const numberValue = parseInt(text, 10)
                      onChange(isNaN(numberValue) ? undefined : numberValue)
                    }}
                    value={value?.toString()}
                  />
                </View>
                {errors.servings && <Text style={styles.errorText}>{errors.servings.message as string}</Text>}
              </>
            )}
          />
        </View>
      </Animated.View>
      <Animated.View style={styles.section}>
        <Text style={styles.sectionHeader}>Preparation</Text>
        <View style={{ padding: 8 }}>
          <Controller
            name="time"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Text style={[styles.label, errors.time && { color: colors.complementary.danger }]}>Cooking Time</Text>
                <Pressable onPress={showTimePicker}>
                  <View style={[styles.input, errors.time && styles.inputError]}>
                    <Text style={styles.timeText}>{value || 'Select Time'}</Text>
                  </View>
                </Pressable>
                {errors.time && <Text style={styles.errorText}>{errors.time.message as string}</Text>}
                <DateTimePickerModal
                  isVisible={isTimePickerVisible}
                  mode="time"
                  date={new Date(new Date().setHours(0, 0, 0, 0))}
                  onConfirm={data => {
                    const formattedTime = `${data.getHours().toString().padStart(2, '0')}:${data
                      .getMinutes()
                      .toString()
                      .padStart(2, '0')}`
                    onChange(formattedTime)
                    hideTimePicker()
                  }}
                  onCancel={hideTimePicker}
                />
              </>
            )}
          />
          <Text style={[styles.label, errors.time && { color: colors.complementary.danger }]}>Preparation steps</Text>
          <Controller
            name="preparation"
            control={control}
            render={({ field: { onChange } }) => <StepCreator type="edit" setData={onChange} />}
          />
        </View>
      </Animated.View>
      <Animated.View style={styles.section}>
        <Text style={styles.sectionHeader}>Products</Text>
        <View style={{ padding: 8 }}>
          <Controller
            name="products"
            control={control}
            render={({ field: { onChange } }) => (
              <ProductInserter type="add" setData={onChange} navigation={navigation} />
            )}
          />
        </View>
      </Animated.View>
      <Pressable
        onPress={handleSubmit(onSubmit)}
        style={{
          backgroundColor: colors.accent
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
          ADD RECIPE
        </Text>
      </Pressable>
    </Animated.ScrollView>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    formContainer: {
      padding: 16,
      backgroundColor: colors.primary
    },
    timeText: {
      color: colors.neutral.text,
      fontSize: 16
    },
    section: {
      marginBottom: 20
    },
    sectionHeader: {
      fontSize: 16,
      color: colors.neutral.text,
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.accent,
      paddingHorizontal: 5
    },
    label: {
      fontSize: 16,
      color: colors.neutral.text,
      marginBottom: 8
    },
    input: {
      borderWidth: 1,
      borderColor: colors.neutral.border,
      borderRadius: 4,
      padding: 4,
      paddingHorizontal: 8,
      marginBottom: 16,
      backgroundColor: colors.neutral.surface,
      color: colors.neutral.text
    },
    inputError: {
      borderColor: colors.complementary.danger
    },
    errorText: {
      color: colors.complementary.danger,
      marginBottom: 16
    },
    toggleWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16
    },
    difficultyContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 10
    },
    difficultyButton: {
      padding: 8,
      borderRadius: 4,
      width: '30%',
      alignItems: 'center'
    },
    difficultyText: {
      color: colors.neutral.text
    }
  })

export default AddRecipe
