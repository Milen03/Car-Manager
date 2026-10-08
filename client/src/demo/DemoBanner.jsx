import { useState } from 'react'
import { DEMO_ACCOUNT } from './demoApi.js'

// Tells visitors this is the demo build and how to sign in.
export default function DemoBanner() {
    const [open, setOpen] = useState(true)

    if (!open) return null

    return (
        <aside className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-50 rounded-2xl border border-yellow-500/40 bg-gray-900/95 backdrop-blur px-4 py-3 text-sm text-gray-300 shadow-lg shadow-black/50">
            <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-yellow-400">Демо версия</p>
                <button type="button" onClick={() => setOpen(false)} aria-label="Скрий"
                    className="text-gray-500 hover:text-gray-200 cursor-pointer leading-none text-lg">×</button>
            </div>
            <p className="mt-1 leading-relaxed">
                Данните се пазят само в този браузър. Влез с <span className="text-gray-100 select-all">{DEMO_ACCOUNT.email}</span> и
                парола <span className="text-gray-100 select-all">{DEMO_ACCOUNT.password}</span> или си направи регистрация.
            </p>
        </aside>
    )
}
