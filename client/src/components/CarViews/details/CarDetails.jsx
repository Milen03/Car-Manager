import { useParams, useNavigate } from 'react-router'
import { useCar } from '../../../api/car.js'

export function CarDetails() {
    const { id } = useParams();
    const { car } = useCar(id);
    const navigate = useNavigate();

    if (!car) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
                <p className="text-center text-gray-400 text-lg">Зареждане...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-lg shadow-black/40">
                <h1 className="text-2xl font-bold text-yellow-400 text-center mb-6">
                    {car.brand} {car.model}
                </h1>
                <div className="space-y-2 text-sm text-gray-300">
                    <p className="flex justify-between">
                        <span className="text-gray-500">Година</span>
                        <span>{car.year}</span>
                    </p>
                    <p className="flex justify-between">
                        <span className="text-gray-500">Пробег</span>
                        <span>{car.mileage} км</span>
                    </p>
                    <p className="flex justify-between">
                        <span className="text-gray-500">Рег. номер</span>
                        <span>{car.registrationNumber}</span>
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-6 w-full px-4 py-2 rounded-xl bg-gray-800/80 border border-gray-700 hover:bg-gray-800
                               active:scale-95 transition-all duration-200 font-medium text-gray-100 cursor-pointer"
                >
                    Назад
                </button>
            </div>
        </div>
    )
}