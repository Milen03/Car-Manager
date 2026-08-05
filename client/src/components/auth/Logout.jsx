import { useLogout } from '../../api/auth.js'
import { useNavigate } from 'react-router'

export default function Logout() {
    const { logout } = useLogout()
    const navigate = useNavigate()

    const handleLogout = async () => {
        const result = await logout()
        console.log(result)
        navigate('/')
    }
    return (
        <></>
    )
}