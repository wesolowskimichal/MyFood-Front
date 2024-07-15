import { store } from './src/redux/Store'
import { Provider } from 'react-redux'
import AppNavigation from './src/components/appNavigation/AppNavigation'

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigation />
    </Provider>
  )
}
