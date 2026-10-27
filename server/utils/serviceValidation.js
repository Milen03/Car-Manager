
// previousServiceMileage is passed when editing: an unchanged mileage is accepted even
// if the car has since been driven past it, so older records stay editable.
const validateServiceMileage = (carMileage, serviceMileage, previousServiceMileage) => {
    const mileage = Number(serviceMileage);
    if (serviceMileage === '' || serviceMileage == null || !Number.isFinite(mileage)) {
        return 'Service mileage must be a number';
    }

    if (previousServiceMileage != null && mileage === Number(previousServiceMileage)) {
        return null;
    }

    if (mileage < carMileage) {
        return 'Service mileage cannot be lower than car mileage';
    }

    return null;
};

module.exports = {
    validateServiceMileage
};
