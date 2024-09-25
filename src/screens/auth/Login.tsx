import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { api } from '../../services/Api'
import { LoginScreenProps, ThemeColors, Token__FULL } from '../../types/Types'
import { setAuth } from '../../redux/slices/AuthSlice'
import { Button, TextInput, View, Text, StyleSheet } from 'react-native'
import { RootState } from '../../redux/Store'
import { Link } from '@react-navigation/native'
import { AxiosError } from 'axios'
import Loader from '../../components/loader/Loader'

const Login = ({ navigation: _navigation, route }: LoginScreenProps) => {
  const infoText = route?.params?.infoText ?? null
  const lastUsername = route?.params?.lastUsername ?? null

  const dispatch = useDispatch()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>('')
  const [loading, setLoading] = useState(false)

  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const handleLogin = async () => {
    try {
      setLoading(true)
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
      if (error instanceof AxiosError) {
        const { detail } = error.response?.data
        setError(detail ?? 'Login failed')
      } else {
        setError('Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (lastUsername) {
      setUsername(lastUsername)
    }
  }, [lastUsername])

  if (loading) {
    return <Loader />
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {infoText && <Text style={styles.infoText}>{infoText}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor={colors.neutral.border}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={colors.neutral.border}
      />
      <Button title="Login" onPress={handleLogin} color={colors.accent} />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.registerContainer}>
        <Text style={styles.registerInfoText}>
          Don't have an account?{' '}
          <Link to={{ screen: 'Register' }}>
            <Text style={styles.registerText}>Register</Text>
          </Link>
        </Text>
      </View>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary,
      padding: 16
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.neutral.text,
      marginBottom: 16
    },
    input: {
      width: '100%',
      padding: 10,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.neutral.border,
      borderRadius: 4,
      color: colors.neutral.text,
      backgroundColor: colors.neutral.surface
    },
    infoText: {
      color: colors.complementary.info,
      marginTop: 8
    },
    errorText: {
      color: colors.complementary.danger,
      marginTop: 8
    },
    registerContainer: {
      marginTop: 16
    },
    registerInfoText: {
      color: colors.neutral.text
    },
    registerText: {
      color: colors.accent
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }
  })
export default Login
