const Service = require('../models').serviceModel;
const Car = require('../models').carModel;

const dateBasedTypes = ['Vignette', 'Tires'];

const createService = async (req, res)  => {
    const { carId } = req.params;
    const { type, mileagesAtService, changeEveryKm, date, notes } = req.body;
    try {
        const car = await Car.findOne({ _id: carId, userId: req.user._id });
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        if (!date) {
            return res.status(400).json({ error: 'Date is required for this service' });
        }
        if (!dateBasedTypes.includes(type) && (!mileagesAtService || !changeEveryKm)) {
            return res.status(400).json({ error: 'Mileage fields are required for this service type' });
        }

        const newService = await Service.create({
            car: carId,
            type,
            mileagesAtService: dateBasedTypes.includes(type) ? undefined : mileagesAtService,
            changeEveryKm: dateBasedTypes.includes(type) ? undefined : changeEveryKm,
            date,
            notes
        });
        if (!newService) {
            return res.status(400).json({ error: 'Failed to create service' });
        }
        // Add service to Car's services array
        await Car.findByIdAndUpdate(carId, { $push: { services: newService._id } });
        
        res.status(201).json(newService);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getServicesByCar = async (req, res) => {
    const { carId } = req.params;
    try {
        const car = await Car.findOne({ _id: carId, userId: req.user._id });
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        const services = await Service.find({ car: carId });
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const editService = async (req, res) => {
    const { serviceId } = req.params;
    const { type, mileagesAtService, changeEveryKm, date, notes } = req.body;
    try {
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const car = await Car.findOne({ _id: service.car, userId: req.user._id });
        if (!car) {
            return res.status(404).json({ error: 'Service not found' });
        }

        if (!date) {
            return res.status(400).json({ error: 'Date is required for this service' });
        }
        if (!dateBasedTypes.includes(type) && (!mileagesAtService || !changeEveryKm)) {
            return res.status(400).json({ error: 'Mileage fields are required for this service type' });
        }

        const updatedService = await Service.findByIdAndUpdate(serviceId, {
            $set: {
                type,
                notes,
                date,
                ...(dateBasedTypes.includes(type) ? {} : { mileagesAtService, changeEveryKm })
            },
            $unset: dateBasedTypes.includes(type) ? { mileagesAtService: '', changeEveryKm: '' } : {}
        }, { new: true, runValidators: true });
        if (!updatedService) {
            return res.status(404).json({ error: 'Service not found' });
        }   
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }       
}

const deleteService = async (req, res) => {     
    const { serviceId } = req.params;
    try {
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const car = await Car.findOne({ _id: service.car, userId: req.user._id });
        if (!car) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const deletedService = await Service.findByIdAndDelete(serviceId);
        // Remove service from Car's services array
        await Car.findByIdAndUpdate(deletedService.car, { $pull: { services: serviceId } });
        
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }   
}

module.exports = {
    createService,
    getServicesByCar,
    editService,
    deleteService
}