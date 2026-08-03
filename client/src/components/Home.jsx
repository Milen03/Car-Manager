export function Home() {

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 flex flex-col items-center justify-center px-4 overflow-hidden">
            {/* soft radial yellow glow behind the content, stretched across the page */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_40%,rgba(250,204,21,0.15),transparent_70%)]" />
            <div className="pointer-events-none absolute -top-1/3 -left-1/4 w-[40rem] h-[40rem] bg-yellow-500/10 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-1/3 -right-1/4 w-[40rem] h-[40rem] bg-yellow-500/10 rounded-full blur-3xl" />

            <div className="relative text-center space-y-6 max-w-xl">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-yellow-400 opacity-0 [animation:fadeUp_0.6s_ease-out_forwards]">
                    Car Manager
                </h1>
                <p className="text-gray-400 text-lg opacity-0 [animation:fadeUp_0.6s_ease-out_0.2s_forwards]">
                    Управлявай своите коли лесно и бързо на едно място.
                </p>

                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400
                               active:scale-95 transition-all duration-200 font-medium text-gray-900 shadow-lg shadow-yellow-900/40
                               cursor-pointer opacity-0 [animation:fadeUp_0.6s_ease-out_0.4s_forwards]"
                >
                    <span className="text-xl leading-none">+</span>
                    Добави кола
                </button>
            </div>
        </div>
    )
}
