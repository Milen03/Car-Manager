import { Link } from 'react-router'
import PropTypes from 'prop-types'

export default function CatalogItem({
    _id,
    brand,
    model,
    year,
    mileage,
    registrationNumber,
}) {

    return (
        <div className="flex flex-col h-full bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-lg shadow-black/40 hover:border-yellow-500/50 transition-colors">
            <h3 className="text-lg sm:text-xl font-bold text-yellow-400 break-words">
                {brand} {model}
            </h3>
            <div className="flex-1 mt-4 space-y-3 text-sm text-gray-300">
                <p className="flex items-center justify-between gap-4 pb-3 border-b border-gray-800">
                    <span className="text-gray-500 shrink-0">Година</span>
                    <span className="text-right">{year}</span>
                </p>
                <p className="flex items-center justify-between gap-4 pb-3 border-b border-gray-800">
                    <span className="text-gray-500 shrink-0">Пробег</span>
                    <span className="text-right">{mileage.toLocaleString('bg-BG')} км</span>
                </p>
                <p className="flex items-center justify-between gap-4">
                    <span className="text-gray-500 shrink-0">Рег. номер</span>
                    <span className="text-right break-all">{registrationNumber}</span>
                </p>
            </div>

            <Link
                to={`/cars/${_id}`}
                className="mt-6 block text-center px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400
                           active:scale-95 transition-all duration-200 font-medium text-gray-900 shadow-lg shadow-yellow-900/40 cursor-pointer"
            >
                Отвори
            </Link>
        </div>
    )
}

CatalogItem.propTypes = {
    _id: PropTypes.string.isRequired,
    brand: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    year: PropTypes.number.isRequired,
    mileage: PropTypes.number.isRequired,
    registrationNumber: PropTypes.string.isRequired,
}
