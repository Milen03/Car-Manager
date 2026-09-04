# Car Manager API

## Base URL

Development: `http://localhost:3000/api`

## Authentication

Authentication uses the `auth-cookie` HTTP-only cookie. Register or log in before using protected resources.

### Auth endpoints

- `POST /register` - register a user with `username`, `email`, `password`, and `repeatPassword`.
- `POST /login` - log in with `email` and `password`.
- `POST /logout` - clear the current session.
- `GET /users/profile` - get the authenticated user's profile.
- `PUT /users/profile` - update the authenticated user's profile.

### Car endpoints

All car endpoints require authentication and operate only on the current user's cars:

- `GET /cars` - list cars.
- `POST /cars` - create a car.
- `GET /cars/:id` - get a car.
- `PUT /cars/:id` - update a car.
- `DELETE /cars/:id` - delete a car.

### Service endpoints

All service endpoints require authentication and operate only on services belonging to the current user's car:

- `GET /services/:carId` - list services for a car.
- `POST /services/:carId` - create a service.
- `PUT /services/:serviceId` - update a service.
- `DELETE /services/:serviceId` - delete a service.

### Health check

- `GET /test` - return API metadata.

Posts, themes, and likes are not part of the Car Manager API.
