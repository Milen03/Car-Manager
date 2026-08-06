import { useContext } from 'react'
import { useNavigate } from 'react-router'
import { userContext } from '../../contexts/UserContext.jsx'
import { useLogout } from '../../api/auth.js'

export default function Nav() {
    const { username } = useContext(userContext)
    const { logout } = useLogout()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <nav className="fixed top-0 inset-x-0 z-20 flex items-center justify-end gap-3 px-6 py-5">
            {username ? (
                <>
                    <span className="text-gray-300 font-medium">{username}</span>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-xl bg-gray-900/60 border border-gray-800
                                   hover:bg-gray-800/80 active:scale-95 transition-all duration-200 font-medium text-gray-100 cursor-pointer"
                    >
                        Изход
                    </button>
                </>
            ) : (
                <>
                    <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="px-6 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 active:scale-95 transition-all
                                   duration-200 font-medium text-gray-900 shadow-lg shadow-yellow-900/40 cursor-pointer"
                    >
                        Регистрирай се
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="px-3 py-1.5 text-sm rounded-xl bg-gray-900/60 backdrop-blur border border-gray-800
                                   hover:bg-gray-800/80 active:scale-95 transition-all duration-200 font-medium text-gray-100 cursor-pointer"
                    >
                        Вход
                    </button>
                </>
            )}
        </nav>
    )
}
