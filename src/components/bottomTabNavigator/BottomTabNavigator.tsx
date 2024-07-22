import React, { useMemo } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Journal from '../../screens/journal/Journal'
import { StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { RootStackParamList, ThemeColors } from '../../types/Types'
import Fridge from '../../screens/fridge/Fridge'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/Store'

const Tab = createBottomTabNavigator<RootStackParamList>()

const BottomTabNavigator = () => {
  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string

          if (route.name === 'Journal') {
            iconName = focused ? 'book' : 'book-outline'
            return <Icon name={iconName} size={size} color={color} />
          } else if (route.name === 'Fridge') {
            iconName = focused ? 'cube' : 'cube-outline'
            return <MaterialIcon name="fridge" size={size} color={color} />
          } else {
            iconName = 'alert-circle-outline' // default or fallback icon
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.accent as string, // Active tab color
        tabBarInactiveTintColor: colors.neutral.text as string, // Inactive tab color
        tabBarStyle: styles.tabBar, // Custom tab bar style
        tabBarLabelStyle: styles.tabBarLabel // Custom label style,
        
      })}
    >
      <Tab.Screen
        name="Journal"
        component={Journal}
        options={{
          headerShown: false,
          tabBarLabel: 'Journal',
        }}
      />
      <Tab.Screen
        name="Fridge"
        component={Fridge}
        options={{
          headerShown: false,
          tabBarLabel: 'Fridge'
        }}
      />
    </Tab.Navigator>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: colors.neutral.surface, // Background color of the tab bar
      paddingBottom: 5,
      height: 60,
      borderTopWidth: 0,
      elevation: 5, // Add shadow for Android
      shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
      shadowOpacity: 0.2, // Shadow opacity for iOS
      shadowRadius: 5 // Shadow radius for iOS
    },
    tabBarLabel: {
      fontSize: 12,
      fontWeight: 'bold'
    }
  })

export default BottomTabNavigator
