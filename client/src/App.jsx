
import './App.css'
import Login from './components/auth/Login.jsx'
import Register from './components/auth/Register.jsx'
import Logout from './components/auth/Logout.jsx'
import { Home } from './components/Home.jsx'
import { Route, Routes } from 'react-router'
function App() {
  

  return (
    <Routes>
 <Route path="/" element={<Home />} />
 <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/logout" element={<Logout />} />
  </Routes>
  )
}

export default App
