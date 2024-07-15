import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, View } from 'react-native'
import { loadTokens } from '../../redux/slices/AuthSlice'
import { validateToken } from '../../utils/Auth'
import FridgeList from '../../screens/test'
import Login from '../../screens/auth/Login'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch'
import Journal from '../../screens/journal/Journal'

const Stack = createNativeStackNavigator()

const AppNavigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const dispatch = useAppDispatch()
  const authState = useAppSelector(state => state.auth)

  useEffect(() => {
    const initializeAuth = async () => {
      await dispatch(loadTokens())

      // Validate the access token
      if (authState.access) {
        const isValid = await validateToken(authState.access)
        setIsAuthenticated(isValid)
      } else {
        setIsAuthenticated(false)
      }
    }

    initializeAuth()
  }, [dispatch, authState.access])

  if (isAuthenticated === null) {
    return <ActivityIndicator size="large" />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <Stack.Screen name="Journal" component={Journal} />
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigation
