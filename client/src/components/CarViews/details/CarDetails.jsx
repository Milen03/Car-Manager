import { useParams, useNavigate } from 'react-router'
import { useCar } from '../../../api/car.js'

export function CarDetails() {
    const { id } = useParams();
    const { car } = useCar(id);
    const navigate = useNavigate();

    if (!car) {
        return (
            <div className="min-h-screen bg-gray-950 pt-20 px-6">
                <p className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
                    Зареждане на детайлите за колата...
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 pt-20">
            <section className="relative w-full bg-gray-900/85 backdrop-blur border-b border-gray-800 px-6 py-8 shadow-lg shadow-black/40 overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,rgba(250,204,21,0.10),transparent_70%)]" />

                <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Лява част: Марка и модел */}
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Детайли за колата</p>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-yellow-400">
                            {car.brand} {car.model}
                        </h1>
                    </div>

                    {/* Средна част: Характеристики като pill-ове */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 border border-gray-700 text-sm">
                            <span className="text-gray-500">Година</span>
                            <span className="font-semibold text-gray-100">{car.year}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 border border-gray-700 text-sm">
                            <span className="text-gray-500">Пробег</span>
                            <span className="font-semibold text-gray-100">{car.mileage} км</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 border border-gray-700 text-sm">
                            <span className="text-gray-500">Рег. номер</span>
                            <span className="font-semibold text-gray-100">{car.registrationNumber}</span>
                        </div>
                    </div>

                    {/* Дясна част: Бутон Назад */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 hover:bg-gray-800
                                   hover:border-yellow-500/50 active:scale-95 transition-all duration-200 font-medium text-gray-100 text-sm cursor-pointer"
                    >
                        <span aria-hidden="true">←</span>
                        Назад
                    </button>
                </div>
            </section>
        </div>
    )
}