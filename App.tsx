import { store } from './src/redux/Store'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { Provider } from 'react-redux'
import Test from './src/screens/test'
import Login from './src/screens/auth/Login'

export default function App() {
  return (
    <Provider store={store}>
      <Text>{`${process.env.EXPO_PUBLIC_API_URL}/api/token/refresh/`}</Text>
      <View style={styles.container}>
        <Login />
        <StatusBar style="auto" />
      </View>
    </Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
