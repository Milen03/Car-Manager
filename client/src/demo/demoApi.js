// An in-browser stand-in for the Express API, used by the demo build
// (`npm run build:demo`) so the app can be shown without a server or database.
// It follows the real routes, validation and response shapes in server/, and
// keeps its data in this browser only.
import { readItem, writeItem } from '../utils/storage.js';

const STORE_KEY = 'car-manager-demo:db';
const SESSION_KEY = 'car-manager-demo:session';

export const DEMO_ACCOUNT = { email: 'demo@carmanager.bg', password: 'demo12345' };

const dateBasedTypes = ['Vignette', 'Tires'];
const serviceTypes = ['Oil', 'Air Filter', 'Tires', 'Vignette', 'Brake-Pads', 'other'];
const latinAndDigits = /^[a-zA-Z0-9]+$/;

const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)),
    (byte) => byte.toString(16).padStart(2, '0')).join('');
const now = () => new Date().toISOString();
const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

function seed() {
    const userId = newId();
    const golfId = newId();
    const corollaId = newId();
    const created = now();

    const services = [
        { car: golfId, type: 'Oil', mileagesAtService: 148500, changeEveryKm: 10000, date: daysAgo(40), notes: 'Castrol Edge 5W-30, маслен филтър Mann' },
        { car: golfId, type: 'Brake-Pads', mileagesAtService: 148500, changeEveryKm: 40000, date: daysAgo(40), notes: 'Предни накладки Bosch' },
        { car: golfId, type: 'Vignette', date: daysAgo(120), notes: 'Годишна винетка' },
        { car: corollaId, type: 'Oil', mileagesAtService: 72300, changeEveryKm: 15000, date: daysAgo(15), notes: 'Toyota 0W-20' },
        { car: corollaId, type: 'Tires', date: daysAgo(200), notes: 'Зимни гуми Michelin Alpin 6' },
    ].map((service) => ({ _id: newId(), createdAt: created, updatedAt: created, ...service }));

    const cars = [
        { _id: golfId, brand: 'Volkswagen', model: 'Golf VII', year: 2016, registrationNumber: 'CA 1234 AB', mileage: 148500 },
        { _id: corollaId, brand: 'Toyota', model: 'Corolla', year: 2019, registrationNumber: 'CB 5678 KT', mileage: 72300 },
    ].map((car) => ({
        ...car,
        userId,
        services: services.filter((service) => service.car === car._id).map((service) => service._id),
        created_at: created,
        updatedAt: created,
    }));

    return {
        users: [{
            _id: userId,
            username: 'demouser',
            email: DEMO_ACCOUNT.email,
            password: DEMO_ACCOUNT.password,
            cars: cars.map((car) => car._id),
            created_at: created,
            updatedAt: created,
        }],
        cars,
        services,
    };
}

function load() {
    try {
        const stored = JSON.parse(readItem(STORE_KEY));
        if (stored && Array.isArray(stored.users)) {
            return stored;
        }
    } catch {
        // unreadable data: start over
    }
    const fresh = seed();
    save(fresh);
    return fresh;
}

function save(db) {
    writeItem(STORE_KEY, JSON.stringify(db));
}

const ok = (body, status = 200) => ({ status, body });
const fail = (status, body) => ({ status, body });
const withoutPassword = (user) => {
    const { password, ...rest } = user; // eslint-disable-line no-unused-vars
    return rest;
};
const toNumber = (value) => (value === '' || value === undefined || value === null ? undefined : Number(value));

function currentUser(db) {
    const userId = readItem(SESSION_KEY);
    return db.users.find((user) => user._id === userId) || null;
}

function validateUser({ email, username, password }) {
    if (!email || !username || !password) {
        return 'Email, username and password are required';
    }
    if (username.length < 5) {
        return 'User validation failed: username: Username should be at least 5 characters';
    }
    if (!latinAndDigits.test(username)) {
        return `User validation failed: username: ${username} must contains only latin letters and digits!`;
    }
    if (password.length < 5) {
        return 'User validation failed: password: Password should be at least 5 characters';
    }
    if (!latinAndDigits.test(password)) {
        return 'User validation failed: password: must contains only latin letters and digits!';
    }
    return null;
}

function validateCar(car) {
    for (const field of ['brand', 'model', 'year', 'registrationNumber', 'mileage']) {
        if (car[field] === undefined || car[field] === '' || Number.isNaN(car[field])) {
            return `Car validation failed: ${field}: Path \`${field}\` is required.`;
        }
    }
    return null;
}

function validateService(car, { type, mileagesAtService, changeEveryKm, date }) {
    if (!serviceTypes.includes(type)) {
        return `\`${type}\` is not a valid service type`;
    }
    if (!date) {
        return 'Date is required for this service';
    }
    if (!dateBasedTypes.includes(type)) {
        if (!mileagesAtService || !changeEveryKm) {
            return 'Mileage fields are required for this service type';
        }
        if (mileagesAtService < car.mileage) {
            return 'Service mileage cannot be lower than car mileage';
        }
    }
    return null;
}

function serviceFields(body) {
    const type = body.type;
    const dateBased = dateBasedTypes.includes(type);
    return {
        type,
        mileagesAtService: dateBased ? undefined : toNumber(body.mileagesAtService),
        changeEveryKm: dateBased ? undefined : toNumber(body.changeEveryKm),
        date: body.date || undefined,
        notes: body.notes,
    };
}

function carFields(body) {
    const fields = {};
    for (const key of ['brand', 'model', 'registrationNumber']) {
        if (body[key] !== undefined) fields[key] = String(body[key]).trim();
    }
    for (const key of ['year', 'mileage']) {
        if (body[key] !== undefined) fields[key] = toNumber(body[key]);
    }
    return fields;
}

const routes = [
    ['POST', /^\/register$/, (db, body) => {
        const { email, username, password, repeatPassword } = body || {};
        if (password !== repeatPassword) {
            return fail(400, { message: 'Passwords do not match' });
        }
        const error = validateUser({ email, username, password });
        if (error) {
            return fail(400, { message: error });
        }
        if (db.users.some((user) => user.email === email)) {
            return fail(409, { message: 'This email is already registered!' });
        }
        if (db.users.some((user) => user.username === username)) {
            return fail(409, { message: 'This username is already registered!' });
        }
        const user = { _id: newId(), email, username, password, cars: [], created_at: now(), updatedAt: now() };
        db.users.push(user);
        save(db);
        writeItem(SESSION_KEY, user._id);
        return ok(withoutPassword(user));
    }],
    ['POST', /^\/login$/, (db, body) => {
        const user = db.users.find((candidate) => candidate.email === body?.email);
        if (!user || user.password !== body?.password) {
            return fail(401, { message: 'Wrong email or password' });
        }
        writeItem(SESSION_KEY, user._id);
        return ok(withoutPassword(user));
    }],
    ['POST', /^\/logout$/, () => {
        writeItem(SESSION_KEY, '');
        return ok({ message: 'Logged out!' });
    }],
    ['GET', /^\/test$/, () => ok({ name: 'car-manager-demo', description: 'In-browser demo API' })],
    ['GET', /^\/users\/profile$/, (db, body, params, user) => ok(withoutPassword(user)), true],
    ['PUT', /^\/users\/profile$/, (db, body, params, user) => {
        const updates = { username: body?.username ?? user.username, email: body?.email ?? user.email };
        const error = validateUser({ ...updates, password: user.password });
        if (error) {
            return fail(400, { message: error });
        }
        Object.assign(user, updates, { updatedAt: now() });
        save(db);
        return ok(withoutPassword(user));
    }, true],
    ['GET', /^\/cars$/, (db, body, params, user) => ok(db.cars.filter((car) => car.userId === user._id)), true],
    ['POST', /^\/cars$/, (db, body, params, user) => {
        const car = { _id: newId(), ...carFields(body || {}), userId: user._id, services: [], created_at: now(), updatedAt: now() };
        const error = validateCar(car);
        if (error) {
            return fail(400, { message: error });
        }
        db.cars.push(car);
        user.cars.push(car._id);
        save(db);
        return ok(car, 201);
    }, true],
    ['GET', /^\/cars\/([^/]+)$/, (db, body, [id], user) => {
        const car = db.cars.find((candidate) => candidate._id === id && candidate.userId === user._id);
        return car ? ok(car) : fail(404, { message: 'Car not found' });
    }, true],
    ['PUT', /^\/cars\/([^/]+)$/, (db, body, [id], user) => {
        const car = db.cars.find((candidate) => candidate._id === id && candidate.userId === user._id);
        if (!car) {
            return fail(404, { message: 'Car not found' });
        }
        const updated = { ...car, ...carFields(body || {}) };
        const error = validateCar(updated);
        if (error) {
            return fail(400, { message: error });
        }
        Object.assign(car, updated, { updatedAt: now() });
        save(db);
        return ok(car);
    }, true],
    ['DELETE', /^\/cars\/([^/]+)$/, (db, body, [id], user) => {
        const car = db.cars.find((candidate) => candidate._id === id && candidate.userId === user._id);
        if (!car) {
            return fail(404, { message: 'Car not found' });
        }
        db.cars = db.cars.filter((candidate) => candidate._id !== id);
        db.services = db.services.filter((service) => service.car !== id);
        user.cars = user.cars.filter((carId) => carId !== id);
        save(db);
        return ok({ message: 'Car deleted successfully' });
    }, true],
    ['GET', /^\/services\/([^/]+)$/, (db, body, [carId], user) => {
        const car = db.cars.find((candidate) => candidate._id === carId && candidate.userId === user._id);
        if (!car) {
            return fail(404, { error: 'Car not found' });
        }
        return ok(db.services.filter((service) => service.car === carId));
    }, true],
    ['POST', /^\/services\/([^/]+)$/, (db, body, [carId], user) => {
        const car = db.cars.find((candidate) => candidate._id === carId && candidate.userId === user._id);
        if (!car) {
            return fail(404, { error: 'Car not found' });
        }
        const fields = serviceFields(body || {});
        const error = validateService(car, fields);
        if (error) {
            return fail(400, { error });
        }
        const service = { _id: newId(), car: carId, ...fields, createdAt: now(), updatedAt: now() };
        db.services.push(service);
        car.services.push(service._id);
        save(db);
        return ok(service, 201);
    }, true],
    ['PUT', /^\/services\/([^/]+)$/, (db, body, [serviceId], user) => {
        const service = db.services.find((candidate) => candidate._id === serviceId);
        const car = service && db.cars.find((candidate) => candidate._id === service.car && candidate.userId === user._id);
        if (!service || !car) {
            return fail(404, { error: 'Service not found' });
        }
        const fields = serviceFields(body || {});
        const error = validateService(car, fields);
        if (error) {
            return fail(400, { error });
        }
        Object.assign(service, fields, { updatedAt: now() });
        save(db);
        return ok(service);
    }, true],
    ['DELETE', /^\/services\/([^/]+)$/, (db, body, [serviceId], user) => {
        const service = db.services.find((candidate) => candidate._id === serviceId);
        const car = service && db.cars.find((candidate) => candidate._id === service.car && candidate.userId === user._id);
        if (!service || !car) {
            return fail(404, { error: 'Service not found' });
        }
        db.services = db.services.filter((candidate) => candidate._id !== serviceId);
        car.services = car.services.filter((id) => id !== serviceId);
        save(db);
        return ok({ message: 'Service deleted successfully' });
    }, true],
];

// Answers a request for `path` (relative to the API base, e.g. "/cars/123")
// with { status, body }, as the real server would.
export async function handleDemoRequest(method, path, body) {
    const db = load();
    const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';

    for (const [routeMethod, pattern, handler, needsAuth] of routes) {
        const match = method === routeMethod && cleanPath.match(pattern);
        if (!match) continue;

        // Strip undefined values so responses look like the server's JSON.
        const respond = (result) => ({ status: result.status, body: JSON.parse(JSON.stringify(result.body)) });

        if (needsAuth) {
            const user = currentUser(db);
            if (!user) {
                return { status: 401, body: { message: 'Invalid token!' } };
            }
            return respond(handler(db, body, match.slice(1).map(decodeURIComponent), user));
        }
        return respond(handler(db, body, match.slice(1)));
    }

    return { status: 404, body: { message: 'Not found' } };
}
