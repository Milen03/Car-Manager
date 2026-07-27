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
        res.status(400).json({ error: error.message });
    }
}



module.exports = {
    createCar
};

