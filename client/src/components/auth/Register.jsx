import { useRegister } from '../../api/auth.js'
import { useNavigate } from 'react-router'
export default function Register() {
    const { register } = useRegister()
    const navigate = useNavigate()

    const handleSubmit = async (e) =>{
        e.preventDefault()

        const formData = new FormData(e.target)

        const data = Object.fromEntries(formData.entries())

        if(data.password !== data.repeatPassword){
            alert("Passwords do not match!")
            return
        }
        

        const result = await register(data.username, data.email, data.password)

        console.log(result)
        
       navigate('/')

        return result

    }
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-gray-100 flex flex-col items-center justify-center px-4 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_40%,rgba(250,204,21,0.28),transparent_70%)]" />
            <div className="pointer-events-none absolute -top-1/3 -left-1/4 w-[40rem] h-[40rem] bg-yellow-500/25 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-1/3 -right-1/4 w-[40rem] h-[40rem] bg-yellow-500/25 rounded-full blur-3xl" />

            <form
                onSubmit={handleSubmit}
                className="relative w-full max-w-sm space-y-4 bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-lg shadow-black/40"
            >
                <h1 className="text-3xl font-bold tracking-tight text-yellow-400 text-center mb-2">
                    Car Manager
                </h1>

                <h2 className="text-3xl font-bold tracking-tight text-yellow-400 text-center mb-2">
                    Регистрация
                </h2>

                <input
                    type="text"
                    name="username"
                    minLength={3}
                    placeholder="Username"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                />
                <input
                    type="password"
                    name="password"
                    minLength={6}
                    placeholder="Password"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                />
                <input
                    type="password"
                    name="repeatPassword"
                    minLength={6}
                    placeholder="Repeat Password"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                />

                <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400
                               active:scale-95 transition-all duration-200 font-medium text-gray-900 shadow-lg shadow-yellow-900/40 cursor-pointer"
                >
                    Регистрирай се
                </button>
            </form>
        </div>
    )
}