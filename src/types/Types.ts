export type Token = {
  access: string | null
  refresh: string | null
}

export type Token__FULL = {
  access: string
  refresh: string
}

export type Page<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface _ID_FIELD {
  readonly id: string
}

interface _ID_URL_FIELD extends _ID_FIELD {
  readonly url: string
}

export interface User extends _ID_URL_FIELD {
  username: string
  email: string
  first_name: string
  last_name: string
  picture: string
}

export interface ProductBase extends _ID_URL_FIELD {
  barcode: string
  name: string
  amount: number
  unit: 'kg' | 'g' | 'ml' | 'l'
  picture: string
}

export interface ProductDetails extends _ID_URL_FIELD {
  carbons: number
  fat: number
  protein: number
  added_by: User
}

export interface Fridge extends _ID_FIELD {
  product: ProductBase
  current_amount: number
  threshold: number
  is_on_shopping_list: boolean
}

export interface Journal extends _ID_URL_FIELD {
  date: Date
  object: {
    type: string
    entry: string
    amount: number
  }
}

export type JournalPage = Page<Journal>

export type FridgePage = Page<Fridge>

import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native'

//#region Navigation Types
export type RootStackParamList = {
  // lastly logged in username in prop to Login
  Login: undefined
  Journal: undefined
  Test: undefined
}

export type LoginScreenProps = NativeStackScreenProps<ParamListBase, 'Login'>
export type JournalScreenProps = NativeStackScreenProps<ParamListBase, 'Journal'>
export type TestScreenProps = NativeStackScreenProps<ParamListBase, 'Test'>

export type NavProps = {
  navigation: NavigationProp<any>
  route: RouteProp<RootStackParamList, keyof RootStackParamList>
}
//#endregopm
