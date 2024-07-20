import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { clearAuth, loadTokens } from '../../redux/slices/AuthSlice'
import { validateToken } from '../../utils/Auth'
import Login from '../../screens/auth/Login'
import { useAppSelector } from '../../hooks/useAppDispatch'
import Journal from '../../screens/journal/Journal'
import { getTheme } from '../../redux/slices/ThemeSlice'
import { AppDispatch } from '../../redux/Store'
import { useDispatch } from 'react-redux'
import ScreenWrapper from '../screenWrapper/ScreenWrapper'
import Register from '../../screens/auth/Register'
import { RootStackParamList } from '../../types/Types'

const Stack = createNativeStackNavigator<RootStackParamList>()

const AppNavigation = () => {
  const dispatch = useDispatch<AppDispatch>()
  const authState = useAppSelector(state => state.auth)

  useEffect(() => {
    const initializeTheme = async () => {
      await dispatch(getTheme())
    }

    const initializeAuth = async () => {
      // uncomment when login, register finished - it is auto reauth
      // await dispatch(loadTokens());
      await dispatch(clearAuth())
    }

    initializeTheme()
    initializeAuth()
  }, [dispatch])

  if (authState.isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {authState.isAuthenticated ? (
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
          <>
            <Stack.Screen
              name="Login"
              options={{
                headerShown: false,
                presentation: 'modal',
                animationTypeForReplace: 'push',
                animation: 'slide_from_right'
              }}
            >
              {props => (
                <ScreenWrapper>
                  <Login {...props} />
                </ScreenWrapper>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Register"
              options={{
                headerShown: false,
                presentation: 'modal',
                animationTypeForReplace: 'push',
                animation: 'slide_from_right'
              }}
            >
              {props => (
                <ScreenWrapper>
                  <Register {...props} />
                </ScreenWrapper>
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default AppNavigation
