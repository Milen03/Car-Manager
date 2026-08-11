import { Link } from 'react-router'

export default function CatalogItem({
    _id,
    brand,
    model,
    year,
    mileage,
    registrationNumber,
}) {

    return (
        <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-lg shadow-black/40 hover:border-yellow-500/50 transition-colors">
            <h3 className="text-xl font-bold text-yellow-400">
                {brand} {model}
            </h3>
            <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p className="flex justify-between">
                    <span className="text-gray-500">Година</span>
                    <span>{year}</span>
                </p>
                <p className="flex justify-between">
                    <span className="text-gray-500">Пробег</span>
                    <span>{mileage} км</span>
                </p>
                <p className="flex justify-between">
                    <span className="text-gray-500">Рег. номер</span>
                    <span>{registrationNumber}</span>
                </p>
            </div>

            <Link
                to={`/cars/${_id}`}
                className="mt-5 block text-center px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400
                           active:scale-95 transition-all duration-200 font-medium text-gray-900 shadow-lg shadow-yellow-900/40 cursor-pointer"
            >
                Отвори
            </Link>
        </div>
    )
}