const Service = require('../models').serviceModel;
const Car = require('../models').carModel;

const createService = async (req, res)  => {
    const { _id: carId } = req.params;
    const { type, mileagesAtService, changeEveryKm, notes } = req.body;
    try {
        const newService = await Service.create({
            car: carId,
            type,
            mileagesAtService,
            changeEveryKm,
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
    const { _id: carId } = req.params;
    try {
        const services = await Service.find({ car: carId });
        if (!services || services.length === 0) {
            return res.status(404).json({ error: 'No services found for this car' });
        }
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const editService = async (req, res) => {
    const { _id: serviceId } = req.params;
    const { type, mileagesAtService, changeEveryKm, notes } = req.body;
    try {
        const updatedService = await Service.findByIdAndUpdate(serviceId, {
            type,
            mileagesAtService,
            changeEveryKm,
            notes
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
    const { _id: serviceId } = req.params;
    try {
        const deletedService = await Service.findByIdAndDelete(serviceId);
        if (!deletedService) {
            return res.status(404).json({ error: 'Service not found' });
        }
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