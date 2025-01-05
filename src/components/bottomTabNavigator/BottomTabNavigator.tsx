import React, { useMemo } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { RootStackParamList, ThemeColors } from '../../types/Types'
import Fridge from '../../screens/fridge/Fridge'
import Journal from '../../screens/journal/Journal'
import Recipes from '../../screens/recipes/Recipes'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated'

const Tab = createBottomTabNavigator<RootStackParamList>()

const BottomTabNavigator = () => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <Tab.Navigator
      initialRouteName="Journal"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const scale = useSharedValue(focused ? 1.2 : 1)
          const animatedStyle = useAnimatedStyle(() => {
            return {
              transform: [{ scale: withSpring(scale.value) }]
            }
          })

          let iconName: string

          if (route.name === 'Journal') {
            iconName = focused ? 'book' : 'book-outline'
            return (
              <Animated.View style={animatedStyle}>
                <Icon name={iconName} size={size} color={color} />
              </Animated.View>
            )
          } else if (route.name === 'Fridge') {
            return (
              <Animated.View style={animatedStyle}>
                <MaterialIcon name="fridge" size={size} color={color} />
              </Animated.View>
            )
          } else if (route.name === 'Recipes') {
            return (
              <Animated.View style={animatedStyle}>
                <MaterialIcon name="chef-hat" size={size} color={color} />
              </Animated.View>
            )
          } else {
            iconName = 'alert-circle-outline'
          }

          return (
            <Animated.View style={animatedStyle}>
              <Icon name={iconName} size={size} color={color} />
            </Animated.View>
          )
        },
        tabBarActiveTintColor: colors.accent as string,
        tabBarInactiveTintColor: colors.neutral.text as string,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarLabel: ({ focused }) => {
          const scale = useSharedValue(focused ? 1.2 : 1)
          const animatedStyle = useAnimatedStyle(() => {
            return {
              transform: [{ scale: withSpring(scale.value) }]
            }
          })

          return <Animated.Text style={[styles.tabBarLabel, animatedStyle]}>{route.name}</Animated.Text>
        }
      })}
    >
      <Tab.Screen
        name="Fridge"
        component={Fridge}
        options={{
          headerShown: false,
          tabBarLabel: 'Fridge'
        }}
      />
      <Tab.Screen
        name="Journal"
        component={Journal}
        options={{
          headerShown: false,
          tabBarLabel: 'Journal'
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={Recipes}
        options={{
          headerShown: false,
          tabBarLabel: 'Recipes'
        }}
      />
    </Tab.Navigator>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: colors.neutral.surface,
      paddingBottom: 5,
      height: 60,
      borderTopWidth: 0,
      elevation: 5,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5
    },
    tabBarLabel: {
      fontSize: 12,
      fontWeight: 'bold'
    }
  })

export default BottomTabNavigator
