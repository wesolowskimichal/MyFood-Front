import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator } from 'react-native'
import { loadTokens } from '../../redux/slices/AuthSlice'
import { validateToken } from '../../utils/Auth'
import Login from '../../screens/auth/Login'
import { useAppSelector } from '../../hooks/useAppDispatch'
import Journal from '../../screens/journal/Journal'
import { getTheme } from '../../redux/slices/ThemeSlice'
import { AppDispatch } from '../../redux/Store'
import { useDispatch } from 'react-redux'
import ScreenWrapper from '../screenWrapper/ScreenWrapper'

const Stack = createNativeStackNavigator()

const AppNavigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const dispatch = useDispatch<AppDispatch>()
  const authState = useAppSelector(state => state.auth)

  useEffect(() => {
    const initializeTheme = async () => {
      await dispatch(getTheme())
    }

    initializeTheme()
  }, [dispatch])

  useEffect(() => {
    const initializeAuth = async () => {
      await dispatch(loadTokens())
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
          <Stack.Screen
            name="Journal"
            options={{
              headerShown: false,
              presentation: 'modal',
              animationTypeForReplace: 'push',
              animation: 'slide_from_right'
            }}
          >
            {props => (
              <ScreenWrapper>
                <Journal {...props} />
              </ScreenWrapper>
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigation
