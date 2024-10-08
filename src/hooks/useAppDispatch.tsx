import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../redux/Store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
