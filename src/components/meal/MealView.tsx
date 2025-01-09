import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import { Meal, ThemeColors } from '../../types/Types'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CountKcal } from '../../helpers/CountKcal'
import { useDeleteMealMutation, usePatchMealMutation, usePostMealMutation } from '../../redux/api/slices/UserMealSlice'
import { setJournalRefetch } from '../../redux/slices/JournalSlice'
import Dialog, { DialogContent, DialogTrigger } from '../dialog/Dialog'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import Icon from 'react-native-vector-icons/Feather'
import { debounce } from 'lodash'

type MealViewProps = { meal?: Meal; onSave?: () => void }

const mealSchema = z.object({
  order: z.number().min(1, 'Order is required'),
  name: z.string().min(1, 'Name is required'),
  target_proteins: z.number().optional().nullable(),
  target_fat: z.number().optional().nullable(),
  target_carbons: z.number().optional().nullable()
})

type ViewType = 'view' | 'add'

export const MealView = ({ meal, onSave }: MealViewProps) => {
  const dispatch = useDispatch()
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const [viewType] = useState<ViewType>(meal ? 'view' : 'add')
  const [isDeleteMealDialogVisible, setIsDeleteMealDialogVisible] = useState(false)

  const [postMeal, { isLoading: isPostMealLoading, isError: isPostMealError }] = usePostMealMutation()
  const [patchMeal, { isLoading: isPatchMealLoading, isError: isPatchMealError }] = usePatchMealMutation()
  const [deleteMeal, { isLoading: isDeleteMealLoading, isError: isDeleteMealError, isSuccess: isDeleteMealSuccess }] =
    useDeleteMealMutation()

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: meal?.name || '',
      order: meal?.order || 1,
      target_proteins: meal?.target_proteins,
      target_fat: meal?.target_fat,
      target_carbons: meal?.target_carbons
    },
    resolver: zodResolver(mealSchema)
  })

  const target_proteins = watch('target_proteins')
  const target_fat = watch('target_fat')
  const target_carbons = watch('target_carbons')

  const onAdd = async (data: any) => {
    try {
      await postMeal(data)
      dispatch(setJournalRefetch(true))
      onSave?.()
    } catch (error) {}
  }

  const onPatch = async (data: any) => {
    try {
      if (meal?.id) {
        await patchMeal({ id: meal.id, ...data })
        dispatch(setJournalRefetch(true))
        onSave?.()
      }
    } catch (error) {}
  }

  const onDelete = async () => {
    try {
      if (meal?.id) {
        await deleteMeal(meal.id)
        dispatch(setJournalRefetch(true))
        onSave?.()
      }
    } catch (error) {}
  }

  const getFooter = () => {
    if (viewType === 'add') {
      return (
        <TouchableOpacity
          style={{
            backgroundColor: colors.accent,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            paddingHorizontal: 8,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            marginTop: 16
          }}
          disabled={isPostMealLoading}
          onPress={handleSubmit(onAdd)}
        >
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>ADD</Text>
          {isPostMealLoading && <ActivityIndicator color={colors.primary} />}
          {isPostMealError && <AntDesignIcon name="close" size={24} color={colors.primary} />}
        </TouchableOpacity>
      )
    }
    if (viewType === 'view') {
      return (
        <Dialog visible={isDeleteMealDialogVisible} setVisible={setIsDeleteMealDialogVisible}>
          <DialogTrigger>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  borderBottomLeftRadius: 4,
                  backgroundColor: colors.accent,
                  gap: 6
                }}
                onPress={handleSubmit(onPatch)}
              >
                <AntDesignIcon name="edit" size={18} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>EDIT</Text>
                {isPatchMealLoading && <ActivityIndicator color={colors.primary} />}
                {isPatchMealError && <AntDesignIcon name="close" size={24} color={colors.primary} />}
              </Pressable>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  borderBottomRightRadius: 4,
                  backgroundColor: '#CD5C5C',
                  gap: 6
                }}
              >
                <Icon name="trash-2" size={18} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>DELETE</Text>
                {isPostMealLoading && <ActivityIndicator color={colors.primary} />}
                {isPostMealError && <AntDesignIcon name="close" size={24} color={colors.primary} />}
              </View>
            </View>
          </DialogTrigger>
          <DialogContent style={styles.DialogContent}>
            <Text style={styles.DialogContentText}>Are you sure you want to remove this item from Journal?</Text>
            <View style={styles.DialogContentButtonsWrapper}>
              <Pressable
                onPress={onDelete}
                disabled={isDeleteMealLoading}
                style={[
                  styles.DialogContentButton,
                  { backgroundColor: '#CD5C5C', flexDirection: 'row', justifyContent: 'center', gap: 5 }
                ]}
              >
                <Text style={{ color: colors.primary }}>Yes</Text>
                {!isDeleteMealLoading && !isDeleteMealError && !isDeleteMealSuccess && (
                  <Icon name="trash-2" size={14} color={colors.primary} />
                )}
                {isDeleteMealLoading && <ActivityIndicator color={colors.primary} />}
                {isDeleteMealError && <AntDesignIcon name="close" size={24} color={colors.primary} />}
                {isDeleteMealSuccess && <AntDesignIcon name="check" size={24} color={colors.primary} />}
              </Pressable>
              <Pressable style={styles.DialogContentButton} onPress={() => setIsDeleteMealDialogVisible(false)}>
                <Text>No</Text>
              </Pressable>
            </View>
          </DialogContent>
        </Dialog>
      )
    }
  }

  return (
    <View
      style={{ backgroundColor: colors.neutral.background, flex: 1, borderRadius: 4, elevation: 4, marginBottom: 12 }}
    >
      <>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={[
                    {
                      flex: 5,
                      borderWidth: 1,
                      borderColor: colors.neutral.border,
                      borderRadius: 4,
                      padding: 4,
                      paddingHorizontal: 8,
                      marginBottom: 16,
                      backgroundColor: colors.neutral.surface,
                      color: colors.neutral.text
                    },
                    errors.name && { borderColor: colors.complementary.danger }
                  ]}
                  placeholder={errors.name ? errors.name.message : 'Name'}
                  placeholderTextColor={errors.name ? colors.complementary.danger : colors.neutral.border}
                  onChangeText={name => {
                    onChange(name)
                  }}
                  value={value}
                />
              </>
            )}
          />

          <Controller
            name="order"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  {
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.neutral.border,
                    borderRadius: 4,
                    padding: 4,
                    paddingHorizontal: 8,
                    marginBottom: 16,
                    backgroundColor: colors.neutral.surface,
                    color: colors.neutral.text
                  },
                  errors.order && { borderColor: colors.complementary.danger }
                ]}
                placeholder={errors.order ? errors.order.message : 'Order'}
                placeholderTextColor={errors.order ? colors.complementary.danger : colors.neutral.border}
                keyboardType="numeric"
                onChangeText={text => {
                  const numberValue = parseInt(text, 10)
                  onChange(isNaN(numberValue) ? undefined : numberValue)
                }}
                // value={value ? value.toString() : ''}
                value={meal ? meal.order.toString() : value ? value.toString() : ''}
              />
            )}
          />
        </View>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ flex: 1, textAlign: 'center', color: colors.accent, fontSize: 12, fontWeight: '600' }}>
              P
            </Text>
            <Text style={{ flex: 1, textAlign: 'center', color: colors.accent, fontSize: 12, fontWeight: '600' }}>
              C
            </Text>
            <Text style={{ flex: 1, textAlign: 'center', color: colors.accent, fontSize: 12, fontWeight: '600' }}>
              F
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Controller
              name="target_proteins"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    {
                      flex: 1,
                      borderWidth: 1,
                      borderColor: colors.neutral.border,
                      borderRadius: 4,
                      padding: 4,
                      paddingHorizontal: 8,
                      marginBottom: 16,
                      backgroundColor: colors.neutral.surface,
                      color: colors.neutral.text,
                      textAlign: 'center'
                    }
                  ]}
                  placeholder="Target Proteins"
                  placeholderTextColor={colors.neutral.border}
                  keyboardType="numeric"
                  onChangeText={_text => {
                    const text = _text[0] === '-' ? _text.slice(1) : _text
                    const numberValue = parseInt(text, 10)
                    onChange(isNaN(numberValue) ? undefined : numberValue)
                  }}
                  value={value?.toString() || '-'}
                />
              )}
            />
            <Controller
              name="target_carbons"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    {
                      flex: 1,
                      borderWidth: 1,
                      borderColor: colors.neutral.border,
                      borderRadius: 4,
                      padding: 4,
                      paddingHorizontal: 8,
                      marginBottom: 16,
                      backgroundColor: colors.neutral.surface,
                      color: colors.neutral.text,
                      textAlign: 'center'
                    }
                  ]}
                  placeholder="Taget Carbs"
                  placeholderTextColor={colors.neutral.border}
                  keyboardType="numeric"
                  onChangeText={_text => {
                    const text = _text[0] === '-' ? _text.slice(1) : _text
                    const numberValue = parseInt(text, 10)
                    onChange(isNaN(numberValue) ? undefined : numberValue)
                  }}
                  value={value?.toString() || '-'}
                />
              )}
            />
            <Controller
              name="target_fat"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    {
                      flex: 1,
                      borderWidth: 1,
                      borderColor: colors.neutral.border,
                      borderRadius: 4,
                      padding: 4,
                      paddingHorizontal: 8,
                      marginBottom: 16,
                      backgroundColor: colors.neutral.surface,
                      color: colors.neutral.text,
                      textAlign: 'center'
                    }
                  ]}
                  placeholder="Target Fats"
                  placeholderTextColor={colors.neutral.border}
                  keyboardType="numeric"
                  onChangeText={_text => {
                    const text = _text[0] === '-' ? _text.slice(1) : _text
                    const numberValue = parseInt(text, 10)
                    onChange(isNaN(numberValue) ? undefined : numberValue)
                  }}
                  value={value?.toString() || '-'}
                />
              )}
            />
          </View>
          {target_proteins && target_carbons && target_fat && (
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
              kcal:{' '}
              {CountKcal({
                proteins: target_proteins as number,
                fats: target_carbons as number,
                carbs: target_fat as number
              })}
            </Text>
          )}

          {getFooter()}
        </View>
      </>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    DialogTrigger: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.complementary.danger,
      borderRadius: 4
    },
    DialogContent: {
      flexDirection: 'column',
      gap: 24
    },
    DialogContentText: {
      color: colors.neutral.text,
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '600'
    },
    DialogContentButtonsWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    DialogContentButton: {
      borderWidth: 1,
      borderColor: colors.neutral.border,
      borderRadius: 4,
      padding: 10,
      width: 100,
      justifyContent: 'center',
      alignItems: 'center'
    }
  })
