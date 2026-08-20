import { useState, useEffect } from 'react';
import { useServicesByCar, createService, deleteService } from '../../../api/service.js';

const serviceTypeLabels = {
    'Oil': 'Масло',
    'Air Filter': 'Въздушен филтър',
    'Tires': 'Гуми',
    'Vignette': 'Винетка',
    'Brake-Pads': 'Накладки',
    'other': 'Друго',
};

export function ServiceDetails({ carId }) {
    const fetchedServices = useServicesByCar(carId);
    const [services, setServices] = useState([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        setServices(fetchedServices);
    }, [fetchedServices]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const result = await createService(carId, data);
        if (!result) return;

        setServices(prev => [...prev, result]);
        setShowForm(false);
        e.target.reset();
    }

    const handleDelete = async (serviceId) => {
        if (!window.confirm('Сигурни ли сте, че искате да изтриете тази работа?')) return;

        const result = await deleteService(serviceId);
        if (!result) return;

        setServices(prev => prev.filter(service => service._id !== serviceId));
    }

    return (
        <section className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight text-yellow-400">
                    Сервизни записи
                </h2>
                <button
                    type="button"
                    onClick={() => setShowForm(prev => !prev)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400
                               active:scale-95 transition-all duration-200 font-medium text-gray-900 text-sm cursor-pointer"
                >
                    {showForm ? 'Затвори' : 'Добави работа'}
                </button>
            </div>

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="mb-6 space-y-4 bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-lg shadow-black/40"
                >
                    <select
                        name="type"
                        required
                        defaultValue=""
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                    >
                        <option value="" disabled>Вид работа</option>
                        {Object.entries(serviceTypeLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        name="mileagesAtService"
                        placeholder="Пробег при извършване (км)"
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                    />
                    <input
                        type="number"
                        name="changeEveryKm"
                        placeholder="Смяна на всеки (км)"
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                    />
                    <textarea
                        name="notes"
                        placeholder="Бележки"
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors resize-none"
                    />

                    <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400
                                   active:scale-95 transition-all duration-200 font-medium text-gray-900 shadow-lg shadow-yellow-900/40 cursor-pointer"
                    >
                        Запази
                    </button>
                </form>
            )}

            {services.length === 0 ? (
                <p className="text-center text-gray-400 text-sm">Няма добавени сервизни записи.</p>
            ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map(service => (
                        <li
                            key={service._id}
                            className="flex items-start justify-between gap-4 bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-5 shadow-lg shadow-black/40"
                        >
                            <div>
                                <p className="font-semibold text-gray-100">
                                    {serviceTypeLabels[service.type] ?? service.type}
                                </p>
                                <p className="text-sm text-gray-400">При {service.mileagesAtService} км, смяна на всеки {service.changeEveryKm} км</p>
                                {service.notes && (
                                    <p className="text-sm text-gray-500 mt-1">{service.notes}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDelete(service._id)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600/90 hover:bg-red-500
                                           active:scale-95 transition-all duration-200 font-medium text-white text-xs cursor-pointer shrink-0"
                            >
                                Изтрий
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
