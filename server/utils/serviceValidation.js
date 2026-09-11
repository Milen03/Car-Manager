const validateServiceMileage = (carMileage, serviceMileage) => {
    if (serviceMileage < carMileage) {
        return 'Service mileage cannot be lower than car mileage';
    }

    return null;
};

module.exports = {
    validateServiceMileage
};
