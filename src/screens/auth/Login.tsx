import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { api } from '../../services/Api'
import { Token__FULL } from '../../types/Types'
import { setAuth } from '../../redux/slices/AuthSlice'
import { Button, TextInput, View, Text } from 'react-native'

const Login = () => {
  const dispatch = useDispatch()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>('')

  const handleLogin = async () => {
    try {
      const response = await api.post('/api/token/', {
        username: username,
        password: password
      })
      if (response.status !== 200) {
        throw new Error('Login failed')
      }
      const auth: Token__FULL = response.data
      dispatch(setAuth(auth))
    } catch (error) {
      setError('Login failed')
    }
  }

  return (
    <View>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      {error && <Text>{error}</Text>}
    </View>
  )
}

export default Login
