import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { loadTokens } from '../../redux/slices/AuthSlice'
import Login from '../../screens/auth/Login'
import { useAppSelector } from '../../hooks/useAppDispatch'
import { getTheme } from '../../redux/slices/ThemeSlice'
import { AppDispatch } from '../../redux/Store'
import { useDispatch } from 'react-redux'
import ScreenWrapper from '../screenWrapper/ScreenWrapper'
import Register from '../../screens/auth/Register'
import { RootStackParamList } from '../../types/Types'
import BottomTabNavigator from '../bottomTabNavigator/BottomTabNavigator'
import ProductInfo from '../../screens/productInfo/ProductInfo'

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
      await dispatch(loadTokens())
      // uncomment when you want to work on login, register page
      // await dispatch(clearAuth())
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
          <>
            <Stack.Screen
              name="Main"
              component={BottomTabNavigator}
              options={{
                headerShown: false
              }}
            />
            <Stack.Screen
              name="ProductInfo"
              component={ProductInfo}
              options={{
                headerShown: true,
                presentation: 'modal',
                animationTypeForReplace: 'push',
                animation: 'slide_from_right'
              }}
            />
          </>
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
