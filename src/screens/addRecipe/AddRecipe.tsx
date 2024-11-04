import React, { useMemo, useEffect } from 'react'
import { View, Text, TextInput, Button, Switch, StyleSheet, Pressable } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated'
import { z } from 'zod'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { ThemeColors } from '../../types/Types'
import StepCreator from '../../components/stepCreator/StepCreator'

const recipeSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
  shared: z.boolean(),
  products: z.array(
    z.object({
      product_id: z.string(),
      amount_needed: z.number().min(1, { message: 'Amount needed must be greater than 0' })
    })
  ),
  preparation: z.string().optional(),
  time: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard'], { message: 'Difficulty must be set' }),
  servings: z.number().min(1, { message: 'Servings must be greater than 0' }),
  picture: z.string().optional()
})

const AddRecipe = () => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(recipeSchema)
  })

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

  const onSubmit = (data: any) => {
    console.log('Form Data:', data)
  }

  return (
    <Animated.ScrollView contentContainerStyle={styles.formContainer}>
      <Animated.View style={styles.section}>
        <Text style={styles.sectionHeader}>General Information</Text>
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
              <TextInput style={styles.input} onChangeText={onChange} value={value} multiline />
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
                trackColor={{ false: colors.complementary.info, true: colors.complementary.info }}
                thumbColor={value ? colors.accent : customColors.defaultBackground}
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
                <Text style={[styles.label, errors.servings && { color: colors.complementary.danger }]}>Servings</Text>
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
      </Animated.View>
      <Animated.View style={styles.section}>
        <Text style={styles.sectionHeader}>Preparation</Text>
        <Controller
          name="preparation"
          control={control}
          render={({ field: { onChange } }) => <StepCreator type="edit" setData={onChange} />}
        />
      </Animated.View>
      <Button title="Add Recipe" onPress={handleSubmit(onSubmit)} color="#4CAF50" />
    </Animated.ScrollView>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    formContainer: {
      padding: 16,
      backgroundColor: colors.primary
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
      borderRadius: 8,
      padding: 12,
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
      borderRadius: 8,
      width: '30%',
      alignItems: 'center'
    },
    difficultyText: {
      color: colors.neutral.text
    }
  })

export default AddRecipe
