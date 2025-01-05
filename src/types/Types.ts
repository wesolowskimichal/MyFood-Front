import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native'
import { ColorValue } from 'react-native'

//#region Api Types
export type Token = {
  access: string | null
  refresh: string | null
}

export type Unit = 'kg' | 'g' | 'ml' | 'l'

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
  unit: Unit
  picture: string
}

export interface ProductDetails extends ProductBase {
  carbons: number
  fat: number
  protein: number
  added_by: User
}

export interface Meal extends _ID_URL_FIELD {
  order: number
  name: string
  target_proteins: number | null
  target_fat: number | null
  target_carbons: number | null
}

export interface Fridge extends _ID_FIELD {
  product: ProductBase
  current_amount: number
  threshold: number
  is_on_shopping_list: boolean
}

export interface Recipe extends _ID_URL_FIELD {
  name: string
  shared: boolean
  added_by: User
  time: string
  difficulty: string
  description: string
  picture: string
  likes: number
  is_liked: boolean
  preparation: string
  products: {
    product_id: string
    amount_needed: number
  }[]
}

export interface Journal extends _ID_URL_FIELD {
  readonly date: Date
  object: {
    type: 'product' | 'recipe'
    meal: Meal
    // entry: ProductDetails | Recipe
    entry: ProductDetails
    amount: number
  }
}

export interface JournalMeal {
  journalId?: string
  meal: Meal
  elements: {
    // obj: ProductDetails | Recipe
    obj: ProductDetails
    amount: number
  }[]
}

export type Nutrients = {
  proteins: number
  fats: number
  carbs: number
}

export type JournalPage = Page<Journal>
export type FridgePage = Page<Fridge>
export type MealPage = Page<Meal>
export type ProductPage = Page<ProductDetails>
export type RecipePage = Page<Recipe>

//#endregion

//#region Navigation Types
// could be added lastly logged in username in prop to Login
export type RootStackParamList = {
  Login: { infoText?: string; lastUsername?: string }
  ProductInfo: { product: ProductDetails }
  AddProductToComponent: {
    product?: ProductDetails
    meal?: Meal
    fridge?: boolean
    recipe?: boolean
  }
  ProductNotFound: {
    barcode: ProductBase['barcode']
    meal?: Meal
    fridge?: boolean
    recipe?: boolean
  }
  AddProduct: {
    barcode?: string
    meal?: Meal
    fridge?: boolean
    recipe?: boolean
  }
  AddRecipe: undefined
  Register: undefined
  Journal: undefined
  Test: undefined
  Fridge: undefined
  Recipes: undefined
  Recipe: { recipe: Recipe }
  Main: undefined
}

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>
export type JournalScreenProps = NativeStackScreenProps<RootStackParamList, 'Journal'>
export type AddProductScreenProps = NativeStackScreenProps<RootStackParamList, 'AddProduct'>
export type ProductNotFoundScreenProps = NativeStackScreenProps<RootStackParamList, 'ProductNotFound'>
export type AddProductToComponentScreenProps = NativeStackScreenProps<RootStackParamList, 'AddProductToComponent'>
export type ProductInfoScreenProps = NativeStackScreenProps<RootStackParamList, 'ProductInfo'>
export type FridgeScreenProps = NativeStackScreenProps<RootStackParamList, 'Fridge'>
export type RecipesScreenProps = NativeStackScreenProps<RootStackParamList, 'Recipes'>
export type RecipeScreenProps = NativeStackScreenProps<RootStackParamList, 'Recipe'>
export type AddRecipeScreenProps = NativeStackScreenProps<RootStackParamList, 'AddRecipe'>
export type TestScreenProps = NativeStackScreenProps<ParamListBase, 'Test'>

export type NavProps = {
  navigation: NavigationProp<any>
  route: RouteProp<RootStackParamList, keyof RootStackParamList>
}
//#endregopm

//#region Theme
export type Theme = 'light' | 'dark'

export type ThemeColors = {
  primary: ColorValue
  accent: ColorValue
  accentDark: ColorValue
  neutral: {
    background: ColorValue
    surface: ColorValue
    text: ColorValue
    border: ColorValue
  }
  complementary: {
    info: ColorValue
    success: ColorValue
    warning: ColorValue
    danger: ColorValue
  }
}
//#endregion

export type DataState<T> = {
  added: T[]
  edited: Record<string, T>
  // edited: Map<string, T>
  deleted: string[]
}

export namespace PS {
  enum Response {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    NOT_FOUND = 404
  }

  export type SuccessResponse<T> = {
    status: Response.OK | Response.CREATED | Response.NO_CONTENT
    data: T
  }

  export type ErrorResponse = {
    status: Response.BAD_REQUEST | Response.NOT_FOUND
    message: string
  }

  export type FunctionResponse = {
    status: Response
    response: SuccessResponse<unknown> | ErrorResponse
  }
}
