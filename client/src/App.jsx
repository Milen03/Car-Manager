
import './App.css'
import Login from './components/auth/Login.jsx'
import Register from './components/auth/Register.jsx'
import Logout from './components/auth/Logout.jsx'
import { Home } from './components/Home.jsx'
import Nav from './components/Header/Nav.jsx'
import { Route, Routes } from 'react-router'
import { UserProvider } from './contexts/UserContext.jsx'
import usePersistedState from './hooks/usePersistedState.js'
import CreateCar from './components/CarViews/CreateCar.jsx'
import { Catalog } from './components/CarViews/catalog/Catalog.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
function App() {
  const [authData, setAuthData] = usePersistedState('auth', {})

  const userLoginHandeler = (resultData) => {
    setAuthData(resultData)
  }

  const userLogoutHandeler = () => {
    setAuthData({})
  }

  return (
    <UserProvider value={{ ...authData, userLoginHandeler, userLogoutHandeler }}>
      <Nav />
      <Routes>
        {/* AUTH ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
        <Route path='/cars/create' element={<CreateCar />} />
        <Route path='/cars/catalog' element={<Catalog />} />
        </Route>
      </Routes>
    </UserProvider>
  )
}

export default App
