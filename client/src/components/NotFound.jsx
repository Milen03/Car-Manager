import { useNavigate } from 'react-router'

export default function NotFound() {
    const navigate = useNavigate()

    return (
        <main className="relative min-h-screen overflow-hidden bg-gray-950 px-6 py-24 text-gray-100">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_20%,rgba(250,204,21,0.16),transparent_70%)]" />

            <section className="relative mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center text-center">
                <p className="mb-4 text-8xl font-black tracking-tight text-yellow-400 sm:text-9xl">
                    404
                </p>
                <h1 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
                    Тази страница не съществува
                </h1>
                <p className="mt-4 max-w-md text-base leading-7 text-gray-400">
                    Изглежда, че адресът е грешен или страницата вече е преместена.
                </p>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-medium text-gray-950 shadow-lg shadow-yellow-900/30 transition-all duration-200 hover:bg-yellow-400 active:scale-95"
                >
                    Към началната страница
                </button>
            </section>
        </main>
    )
}