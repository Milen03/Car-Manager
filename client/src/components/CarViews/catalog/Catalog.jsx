import { useCars } from '../../../api/car.js'
import CatalogItem from './catalogItem/CatalogItem.jsx'

export function Catalog() {
    const { cars } = useCars();

    if (!cars || cars.length === 0) {
        return <p className="text-center text-gray-400">Няма налични коли.</p>
    }
    return (
        <div className="min-h-screen bg-gray-950 px-4 py-24">
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                    <CatalogItem key={car._id} {...car} />
                ))}
            </div>
        </div>
    )
}