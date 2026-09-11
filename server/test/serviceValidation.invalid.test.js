const test = require('node:test');
const assert = require('node:assert/strict');
const { validateServiceMileage } = require('../utils/serviceValidation');

const mileageError = 'Service mileage cannot be lower than car mileage';

test('rejects service mileage that is one kilometer below the car mileage', () => {
    assert.equal(validateServiceMileage(120000, 119999), mileageError);
});

test('rejects service mileage far below the car mileage', () => {
    assert.equal(validateServiceMileage(120000, 60000), mileageError);
});

test('rejects zero service mileage for a car that has been driven', () => {
    assert.equal(validateServiceMileage(1, 0), mileageError);
});

test('rejects negative service mileage', () => {
    assert.equal(validateServiceMileage(0, -1), mileageError);
});