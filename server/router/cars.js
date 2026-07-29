const express = require('express');
const router = express.Router();
const { auth } = require('../utils');
const { carController } = require('../controllers');

// middleware that is specific to this router

router.get('/', carController.getCars);

router.post('/', auth(), carController.createCar);

router.get('/:carId', carController.getCar);

router.put('/:carId', auth(), carController.editCar);

router.delete('/:carId', auth(), carController.deleteCar);

module.exports = router;