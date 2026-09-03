import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useServicesByCar, createService, deleteService, editService } from '../../../api/service.js';

const serviceTypeLabels = {
    'Oil': 'Масло',
    'Air Filter': 'Въздушен филтър',
    'Tires': 'Гуми',
    'Vignette': 'Винетка',
    'Brake-Pads': 'Накладки',
    'other': 'Друго',
};

const dateBasedTypes = ['Vignette', 'Tires'];

export function ServiceDetails({ carId }) {
    const fetchedServices = useServicesByCar(carId);
    const [services, setServices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formType, setFormType] = useState('');
    const [editType, setEditType] = useState('');

    useEffect(() => {
        setServices(fetchedServices);
    }, [fetchedServices]);

    const validateServiceData = ({ type, mileagesAtService, changeEveryKm, date }) => {
        if (dateBasedTypes.includes(type)) {
            if (!date) {
                return 'Датата е задължителна за този вид работа.';
            }
            return null;
        }
        if (Number(mileagesAtService) >= Number(changeEveryKm)) {
            return 'Пробегът при извършване трябва да е по-малък от интервала за смяна.';
        }
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const validationError = validateServiceData(data);
        if (validationError) {
            alert(validationError);
            return;
        }

        const result = await createService(carId, data);
        if (!result) return;

        setServices(prev => [...prev, result]);
        setShowForm(false);
        setFormType('');
        e.target.reset();
    }

    const handleDelete = async (serviceId) => {
        if (!window.confirm('Сигурни ли сте, че искате да изтриете тази работа?')) return;

        const result = await deleteService(serviceId);
        if (!result) return;

        setServices(prev => prev.filter(service => service._id !== serviceId));
    }

    const handleEditSubmit = async (e, serviceId) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const validationError = validateServiceData(data);
        if (validationError) {
            alert(validationError);
            return;
        }

        const result = await editService(serviceId, data);
        if (!result) return;

        setServices(prev => prev.map(service => service._id === serviceId ? result : service));
        setEditingId(null);
    }

    return (
        <section className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight text-yellow-400">
                    Сервизни записи
                </h2>
                <button
                    type="button"
                    onClick={() => {
                        setShowForm(prev => !prev);
                        setFormType('');
                    }}
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
                        onChange={(e) => setFormType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                    >
                        <option value="" disabled>Вид работа</option>
                        {Object.entries(serviceTypeLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        name="date"
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                    />
                    {!dateBasedTypes.includes(formType) && (
                        <>
                            <input
                                type="number"
                                name="mileagesAtService"
                                placeholder="Пробег при извършване (км)"
                                min="0"
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                            />
                            <input
                                type="number"
                                name="changeEveryKm"
                                placeholder="Смяна на всеки (км)"
                                min="1"
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                            />
                        </>
                    )}
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
                            {editingId === service._id ? (
                                <form
                                    onSubmit={(e) => handleEditSubmit(e, service._id)}
                                    className="w-full space-y-3"
                                >
                                    <select
                                        name="type"
                                        required
                                        defaultValue={service.type}
                                        onChange={(e) => setEditType(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                                    >
                                        <option value="" disabled>Вид работа</option>
                                        {Object.entries(serviceTypeLabels).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="date"
                                        name="date"
                                        defaultValue={service.date ? service.date.slice(0, 10) : ''}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                                    />
                                    {!dateBasedTypes.includes(editType) && (
                                        <>
                                            <input
                                                type="number"
                                                name="mileagesAtService"
                                                placeholder="Пробег при извършване (км)"
                                                defaultValue={service.mileagesAtService}
                                                min="0"
                                                required
                                                className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                                            />
                                            <input
                                                type="number"
                                                name="changeEveryKm"
                                                placeholder="Смяна на всеки (км)"
                                                defaultValue={service.changeEveryKm}
                                                min="1"
                                                required
                                                className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors"
                                            />
                                        </>
                                    )}
                                    <textarea
                                        name="notes"
                                        placeholder="Бележки"
                                        rows={3}
                                        defaultValue={service.notes}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 focus:border-yellow-500 transition-colors resize-none"
                                    />

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400
                                                       active:scale-95 transition-all duration-200 font-medium text-gray-900 text-sm cursor-pointer"
                                        >
                                            Запази
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingId(null)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600
                                                       active:scale-95 transition-all duration-200 font-medium text-gray-100 text-sm cursor-pointer"
                                        >
                                            Отказ
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div>
                                        <p className="font-semibold text-gray-100">
                                            {serviceTypeLabels[service.type] ?? service.type}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Сменена на {service.date ? new Date(service.date).toLocaleDateString('bg-BG') : 'няма дата'}
                                        </p>
                                        {!dateBasedTypes.includes(service.type) && (
                                            <p className="text-sm text-gray-400">При {service.mileagesAtService} км, смяна на всеки {service.changeEveryKm} км</p>
                                        )}
                                        {service.notes && (
                                            <p className="text-sm text-gray-500 mt-1">{service.notes}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingId(service._id);
                                                setEditType(service.type);
                                            }}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400
                                                       active:scale-95 transition-all duration-200 font-medium text-gray-900 text-xs cursor-pointer"
                                        >
                                            Редактирай
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(service._id)}
                                            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-red-600/90 hover:bg-red-500
                                                       active:scale-95 transition-all duration-200 font-medium text-white text-xs cursor-pointer"
                                        >
                                            Изтрий
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

ServiceDetails.propTypes = {
    carId: PropTypes.string.isRequired,
}
