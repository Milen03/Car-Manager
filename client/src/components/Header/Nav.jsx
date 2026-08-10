import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { userContext } from '../../contexts/UserContext.jsx'
import { useLogout } from '../../api/auth.js'

export default function Nav() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { username } = useContext(userContext)
    const { logout } = useLogout()
    const navigate = useNavigate()

    const handleLogout = async () => {
        setMobileMenuOpen(false)
        await logout()
        navigate('/login')
    }

    const guestNav = [
        { name: 'Начало', href: '/' },
        { name: 'Вход', href: '/login' },
        { name: 'Регистрация', href: '/register' },
    ]

    const userNav = [
        { name: 'Начало', href: '/' },
        { name: 'Добави кола', href: '/cars/create' },
    ]

    const navItems = username ? userNav : guestNav

    return (
        <header className="fixed inset-x-0 top-0 z-20">
            <nav className="flex items-center justify-between px-6 py-4 lg:px-12 bg-gray-950/70 backdrop-blur border-b border-gray-800">
                <Link to="/" className="text-lg font-bold tracking-tight text-yellow-400">
                    Car Manager
                </Link>

                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-100 hover:bg-gray-800/80 cursor-pointer"
                >
                    <span className="sr-only">Отвори менюто</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                    </svg>
                </button>

                <div className="hidden lg:flex lg:gap-x-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className="text-sm font-medium text-gray-100 hover:text-yellow-400 transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden lg:flex lg:items-center lg:gap-3">
                    {username && (
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
                    )}
                </div>
            </nav>

            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-30 bg-black/60"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div
                        className="fixed inset-y-0 right-0 z-40 w-full max-w-xs bg-gray-950/95 backdrop-blur border-l border-gray-800 px-6 py-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-yellow-400">Car Manager</span>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-gray-100 hover:bg-gray-800/80 rounded cursor-pointer"
                            >
                                <span className="sr-only">Затвори менюто</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-6 flex flex-col gap-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-base font-medium text-gray-100 hover:text-yellow-400 transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {username && (
                                <>
                                    <span className="text-gray-400">{username}</span>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="text-left px-4 py-2 rounded-xl bg-gray-900/60 border border-gray-800
                                                   hover:bg-gray-800/80 active:scale-95 transition-all duration-200 font-medium text-gray-100 cursor-pointer"
                                    >
                                        Изход
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

