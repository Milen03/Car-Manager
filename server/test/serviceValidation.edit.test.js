const test = require('node:test');
const assert = require('node:assert/strict');
const { validateServiceMileage } = require('../utils/serviceValidation');

const mileageError = 'Service mileage cannot be lower than car mileage';

test('allows an unchanged mileage below the car mileage when editing an older service', () => {
    assert.equal(validateServiceMileage(130000, 100000, 100000), null);
});

test('treats a form string equal to the stored mileage as unchanged', () => {
    assert.equal(validateServiceMileage(130000, '100000', 100000), null);
});

test('rejects an edited mileage that moves below the car mileage', () => {
    assert.equal(validateServiceMileage(130000, 110000, 100000), mileageError);
});

test('allows an edited mileage at or above the car mileage', () => {
    assert.equal(validateServiceMileage(130000, 130000, 100000), null);
    assert.equal(validateServiceMileage(130000, 140000, 100000), null);
});
