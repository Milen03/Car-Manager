import { useContext } from 'react'
import { Navigate } from 'react-router'
import { userContext } from '../../contexts/UserContext.jsx'

export default function ProtectedRoute({ children }) {
    const { username } = useContext(userContext)

    if (!username) {
        return <Navigate to="/login" replace />
    }

    return children
}
