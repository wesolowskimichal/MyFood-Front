import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { View, Text, TextInput, Button, ScrollView, Pressable } from 'react-native'
import Animated, { SlideInLeft, SlideOutRight, LinearTransition } from 'react-native-reanimated'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'

type StepCreatorProps = {
  type: 'edit' | 'view'
  data?: string
  setData?: (data: string) => void
}

const StepCreator = ({ type, data, setData }: StepCreatorProps) => {
  const colors = useSelector((state: RootState) => state.theme.colors)

  const [steps, setSteps] = useState<string[]>([])
  const [newStep, setNewStep] = useState<string>('')

  useEffect(() => {
    if (data && type === 'view') {
      setSteps(data.split('\n'))
    }
  }, [data, type])

  const addStep = useCallback(() => {
    if (newStep.trim()) {
      setSteps(prevSteps => [...prevSteps, newStep.trim()])
      setNewStep('')
    }
  }, [newStep])

  const updateStep = useCallback(
    (text: string, index: number) => {
      const updatedSteps = [...steps]
      updatedSteps[index] = text
      setSteps(updatedSteps)
    },
    [steps]
  )

  const compiledSteps = useMemo(() => {
    return steps.join('\n')
  }, [steps])

  useEffect(() => {
    if (type === 'edit' && setData) {
      setData(compiledSteps)
    }
  }, [steps, type])

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {type === 'edit'
          ? steps.map((step, index) => (
              <Animated.View
                key={index}
                layout={LinearTransition.springify()}
                entering={SlideInLeft}
                exiting={SlideOutRight}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  marginBottom: 12,
                  paddingVertical: 2,
                  paddingHorizontal: 10,
                  backgroundColor: colors.neutral.surface,
                  borderRadius: 4,
                  borderColor: colors.neutral.border,
                  borderWidth: 1
                }}
              >
                <Text style={{ color: colors.neutral.text }}>{`${index + 1}.`}</Text>
                <TextInput
                  value={step}
                  onChangeText={text => updateStep(text, index)}
                  placeholder="Edit step"
                  placeholderTextColor={colors.neutral.text}
                  style={{
                    flex: 1,
                    color: colors.neutral.text
                  }}
                />
              </Animated.View>
            ))
          : steps.map((step, index) => (
              <Animated.View
                key={index}
                layout={LinearTransition.springify()}
                entering={SlideInLeft}
                exiting={SlideOutRight}
                style={{
                  marginBottom: 12,
                  paddingVertical: 2,
                  paddingHorizontal: 10,
                  backgroundColor: colors.neutral.surface,
                  borderRadius: 4,
                  borderColor: colors.neutral.border,
                  borderWidth: 1
                }}
              >
                <Text style={{ color: colors.neutral.text }}>{`${index + 1}. ${step}`}</Text>
              </Animated.View>
            ))}
      </ScrollView>

      {type === 'edit' && (
        <View>
          <TextInput
            value={newStep}
            onChangeText={setNewStep}
            placeholder="Enter new step"
            placeholderTextColor={colors.neutral.text}
            style={{
              marginBottom: 12,
              paddingVertical: 2,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: colors.neutral.border,
              borderRadius: 4,
              color: colors.neutral.text,
              backgroundColor: colors.neutral.border
            }}
          />
          <Pressable
            onPress={addStep}
            style={{
              backgroundColor: colors.neutral.text,
              borderRadius: 4
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
              ADD STEP
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

export default StepCreator
