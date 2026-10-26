import { useCars } from '../../../api/car.js'
import CatalogItem from './catalogItem/CatalogItem.jsx'

export function Catalog() {
    const { cars } = useCars();

    if (!cars || cars.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 pt-28">
                <p className="text-center text-gray-400 text-lg">Няма налични коли.</p>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-gray-950 px-4 sm:px-6 lg:px-8 pt-32 pb-16 sm:pt-36">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 sm:mb-10">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-yellow-400">
                        Каталог
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        {cars.length} {cars.length === 1 ? 'кола' : 'коли'}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                    {cars.map((car) => (
                        <CatalogItem key={car._id} {...car} />
                    ))}
                </div>
            </div>
        </div>
    )
}
