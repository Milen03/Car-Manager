import { useEffect, useRef } from 'react'
import { useLogout } from '../../api/auth.js'
import { useNavigate } from 'react-router'

export default function Logout() {
    const { logout } = useLogout()
    const navigate = useNavigate()
    const logoutStarted = useRef(false)

    useEffect(() => {
        if (logoutStarted.current) return
        logoutStarted.current = true

        const performLogout = async () => {
            await logout()
            navigate('/login')
        }

        performLogout()
    }, [logout, navigate])

    return (
        <p>Излизане...</p>
    )
}