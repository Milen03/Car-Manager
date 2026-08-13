const express = require('express');
const router = express.Router();
const { auth } = require('../utils');
const { carController } = require('../controllers');

// middleware that is specific to this router

router.get('/', auth(), carController.getAllCars);

router.post('/', auth(), carController.createCar);

router.get('/:id', auth(), carController.getCarById);

router.put('/:id', auth(), carController.editCar);

router.delete('/:id', auth(), carController.deleteCar);

module.exports = router;