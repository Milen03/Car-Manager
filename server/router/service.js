const express = require('express');  
const router = express.Router();
const { auth } = require('../utils');
const { serviceController } = require('../controllers');

router.get('/:carId', serviceController.getServicesByCar);

router.post('/:carId', auth(), serviceController.createService);

router.put('/:serviceId', auth(), serviceController.editService);

router.delete('/:serviceId', auth(), serviceController.deleteService);

module.exports = router;    