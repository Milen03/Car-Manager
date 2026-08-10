const Car = require('../models/carModel');

async function createCar(req, res) {
    const { _id: userId } = req.user;
    const { brand, model, year, registrationNumber, mileage } = req.body;
    try {
        const newCar = await Car.create({
            brand,
            model,
            year,
            registrationNumber,
            mileage,
            userId
        });
        res.status(201).json(newCar);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getAllCars(req, res) {
    try {
        const cars = await Car.find({ userId: req.user._id });
        res.status(200).json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getCarById(req,res){
    try{
        const car = await Car.findById(req.params.id);
        if(!car) return res.status(404).json({message: 'Car not found'});
        res.status(200).json(car);
    }catch(error){
        res.status(400).json({ message: error.message });
    }
}

async function editCar(req,res){
    try{
        const updatedCar = await Car.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if(!updatedCar) return res.status(404).json({message: 'Car not found'});
        res.status(200).json(updatedCar);
    }catch(error){
        res.status(400).json({ message: error.message });
    }
}

async function deleteCar (req,res){
    try{
        const deletedCar  = await Car.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if(!deletedCar) return res.status(404).json({message: 'Car not found'});
        res.status(200).json({message: 'Car deleted successfully'});
    }catch(error){
        res.status(400).json({ message: error.message });
    }
}


module.exports = {
    createCar,
    getAllCars,
    getCarById,
    editCar,
    deleteCar
};

