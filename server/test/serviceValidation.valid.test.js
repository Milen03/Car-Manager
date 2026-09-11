const test = require('node:test');
const assert = require('node:assert/strict');
const { validateServiceMileage } = require('../utils/serviceValidation');

test('allows service mileage equal to the car mileage', () => {
    assert.equal(validateServiceMileage(120000, 120000), null);
});

test('allows service mileage higher than the car mileage', () => {
    assert.equal(validateServiceMileage(120000, 125000), null);
});

test('allows zero mileage for a new car', () => {
    assert.equal(validateServiceMileage(0, 0), null);
});

test('allows decimal mileage when it is equal to or higher than the car mileage', () => {
    assert.equal(validateServiceMileage(120000.5, 120000.5), null);
    assert.equal(validateServiceMileage(120000.5, 120000.75), null);
});