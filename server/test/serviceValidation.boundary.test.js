const test = require('node:test');
const assert = require('node:assert/strict');
const { validateServiceMileage } = require('../utils/serviceValidation');

test('distinguishes the invalid value immediately below the boundary', () => {
    const carMileage = 100000;

    assert.notEqual(validateServiceMileage(carMileage, carMileage - 1), null);
    assert.equal(validateServiceMileage(carMileage, carMileage), null);
});

test('handles a large mileage value without changing the comparison', () => {
    const carMileage = 9999999;

    assert.notEqual(validateServiceMileage(carMileage, 9999998), null);
    assert.equal(validateServiceMileage(carMileage, 10000000), null);
});

test('returns no error for every valid mileage in a representative range', () => {
    const carMileage = 50000;
    const validServiceMileages = [50000, 50001, 55000, 100000];

    for (const serviceMileage of validServiceMileages) {
        assert.equal(validateServiceMileage(carMileage, serviceMileage), null);
    }
});