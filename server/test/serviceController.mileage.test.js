const test = require('node:test');
const assert = require('node:assert/strict');
const { carModel: Car, serviceModel: Service } = require('../models');
const { createService, editService } = require('../controllers/serviceControllers');

const userId = 'user1';
const carId = 'car1';

const createResponse = () => ({
    statusCode: null,
    body: null,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    }
});

// Stubs the database calls the controllers make and records every car update.
const stubDatabase = (t, { carMileage, existingService }) => {
    const carUpdates = [];
    t.mock.method(Car, 'findOne', async () => ({ _id: carId, mileage: carMileage }));
    t.mock.method(Car, 'findByIdAndUpdate', async (id, update) => {
        carUpdates.push({ id, update });
        return {};
    });
    t.mock.method(Service, 'create', async (data) => ({ _id: 'service1', ...data }));
    t.mock.method(Service, 'findById', async () => existingService);
    t.mock.method(Service, 'findByIdAndUpdate', async (id, update) => ({ _id: id, ...update.$set }));
    return carUpdates;
};

const createRequest = (body) => ({ params: { carId }, body, user: { _id: userId } });
const editRequest = (body) => ({ params: { serviceId: 'service1' }, body, user: { _id: userId } });

test('adding a mileage-based service raises the car mileage to the service mileage', async (t) => {
    const carUpdates = stubDatabase(t, { carMileage: 120000 });
    const res = createResponse();

    await createService(createRequest({
        type: 'Oil', mileagesAtService: '130000', changeEveryKm: '10000', date: '2026-10-27'
    }), res);

    assert.equal(res.statusCode, 201);
    assert.equal(carUpdates.length, 1);
    assert.deepEqual(carUpdates[0].update.$max, { mileage: 130000 });
});

test('adding a date-based service leaves the car mileage alone', async (t) => {
    const carUpdates = stubDatabase(t, { carMileage: 120000 });
    const res = createResponse();

    await createService(createRequest({ type: 'Vignette', date: '2026-10-27' }), res);

    assert.equal(res.statusCode, 201);
    assert.equal(carUpdates[0].update.$max, undefined);
});

test('adding a service below the car mileage is rejected without saving anything', async (t) => {
    const carUpdates = stubDatabase(t, { carMileage: 120000 });
    const res = createResponse();

    await createService(createRequest({
        type: 'Oil', mileagesAtService: '110000', changeEveryKm: '10000', date: '2026-10-27'
    }), res);

    assert.equal(res.statusCode, 400);
    assert.equal(Service.create.mock.callCount(), 0);
    assert.equal(carUpdates.length, 0);
});

test('editing only the notes of an older service is allowed after the car has been driven further', async (t) => {
    const carUpdates = stubDatabase(t, {
        carMileage: 130000,
        existingService: { _id: 'service1', car: carId, type: 'Oil', mileagesAtService: 100000 }
    });
    const res = createResponse();

    await editService(editRequest({
        type: 'Oil', mileagesAtService: '100000', changeEveryKm: '10000', date: '2026-01-10', notes: 'Castrol'
    }), res);

    assert.equal(res.statusCode, 200);
    assert.equal(carUpdates.length, 0);
});

test('editing a service to a higher mileage raises the car mileage', async (t) => {
    const carUpdates = stubDatabase(t, {
        carMileage: 130000,
        existingService: { _id: 'service1', car: carId, type: 'Oil', mileagesAtService: 130000 }
    });
    const res = createResponse();

    await editService(editRequest({
        type: 'Oil', mileagesAtService: '135000', changeEveryKm: '10000', date: '2026-10-27'
    }), res);

    assert.equal(res.statusCode, 200);
    assert.equal(carUpdates.length, 1);
    assert.deepEqual(carUpdates[0].update, { $max: { mileage: 135000 } });
});
