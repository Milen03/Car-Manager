import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router'
import { userContext } from '../../contexts/userContext.js'

export default function ProtectedRoute() {
    const { username } = useContext(userContext)

    if (!username) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
