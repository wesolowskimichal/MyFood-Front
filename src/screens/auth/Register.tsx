import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RegisterScreenProps, ThemeColors, User } from '../../types/Types'
import { useState, useMemo } from 'react'
import { api } from '../../services/Api'
import { setAuth } from '../../redux/slices/AuthSlice'
import {
  Button,
  TextInput,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native'
import { RootState } from '../../redux/Store'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { AxiosError } from 'axios'
import { Link } from '@react-navigation/native'
import Loader from '../../components/loader/Loader'

const Register = ({ navigation, route: _route }: RegisterScreenProps) => {
  const dispatch = useDispatch()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [picture, setPicture] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string | null }>({})
  const [loading, setLoading] = useState(false)

  const colors = useSelector((state: RootState) => state.theme.colors)
  const styles = useMemo(() => createStyles(colors), [colors])

  const handleRegister = async () => {
    try {
      setLoading(true)
      setError(null)
      setInputErrors({})
      const formData = new FormData()
      formData.append('username', username.trim())
      formData.append('password', password)
      formData.append('email', email.trim().toLowerCase())
      formData.append('first_name', firstName.trim())
      formData.append('last_name', lastName.trim())
      if (picture) {
        console.log('adding picture')
        formData.append('picture', {
          uri: picture,
          name: 'profile.jpg',
          type: 'image/jpeg'
        } as any)
      }

      const response = await api.post('/api/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (response.status !== 201) {
        throw new Error('Registration failed')
      }
      const auth: User = response.data
      console.log(auth)
      navigation.navigate('Login', {
        infoText: 'Successfully registered! Log in to your account',
        lastUsername: username.trim()
      })
    } catch (error) {
      let errorMessage = 'Registration failed'
      const inputErrors: { [key: string]: string | null } = {}
      if (error instanceof AxiosError) {
        if (error.response?.data) {
          const { detail, username, email, password, first_name, last_name } = error.response.data

          if (detail) {
            errorMessage = detail
          }
          if (username) inputErrors.username = username.join(', ')
          if (email) inputErrors.email = email.join(', ')
          if (password) inputErrors.password = password.join(', ')
          if (first_name) inputErrors.first_name = first_name.join(', ')
          if (last_name) inputErrors.last_name = last_name.join(', ')
        } else if (error.request) {
          errorMessage = 'Network error, please try again'
        }
      }
      setInputErrors(inputErrors)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    })

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      )
      setPicture(manipResult.uri)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Register</Text>
        {inputErrors.username && <Text style={styles.errorText}>{inputErrors.username}</Text>}
        <TextInput
          style={[styles.input, inputErrors.username ? styles.inputError : {}]}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor={colors.neutral.border}
        />
        {inputErrors.password && <Text style={styles.errorText}>{inputErrors.password}</Text>}
        <TextInput
          style={[styles.input, inputErrors.password ? styles.inputError : {}]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={colors.neutral.border}
        />
        {inputErrors.email && <Text style={styles.errorText}>{inputErrors.email}</Text>}
        <TextInput
          style={[styles.input, inputErrors.email ? styles.inputError : {}]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={colors.neutral.border}
        />
        {inputErrors.first_name && <Text style={styles.errorText}>{inputErrors.first_name}</Text>}
        <TextInput
          style={[styles.input, inputErrors.first_name ? styles.inputError : {}]}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor={colors.neutral.border}
        />
        {inputErrors.last_name && <Text style={styles.errorText}>{inputErrors.last_name}</Text>}
        <TextInput
          style={[styles.input, inputErrors.last_name ? styles.inputError : {}]}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor={colors.neutral.border}
        />
        <Pressable onPress={pickImage}>
          <Text style={styles.imagePickerText}>Pick an image</Text>
        </Pressable>
        {picture && <Image source={{ uri: picture }} style={styles.image} />}
        <Button title="Register" onPress={handleRegister} color={colors.accent} />
        {error && Object.keys(inputErrors).length === 0 && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.loginContainer}>
          <Text style={styles.loginInfoText}>
            Already have an account?{' '}
            <Link to={{ screen: 'Login' }}>
              <Text style={styles.loginText}>Login</Text>
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary,
      padding: 16
    },
    scrollContainer: {
      justifyContent: 'center',
      alignItems: 'center'
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
    inputError: {
      borderColor: colors.complementary.danger
    },
    imagePickerText: {
      color: colors.accent,
      marginBottom: 12
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 12
    },
    errorText: {
      color: colors.complementary.danger,
      marginTop: 8,
      marginBottom: 8,
      alignSelf: 'flex-start'
    },
    loginContainer: {
      marginTop: 16
    },
    loginInfoText: {
      color: colors.neutral.text
    },
    loginText: {
      color: colors.accent
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }
  })

export default Register
