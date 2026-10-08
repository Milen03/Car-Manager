# Deploying Car Manager

Car Manager runs on **Vercel** as one project with two
[services](https://vercel.com/docs/services), backed by a free **MongoDB Atlas**
database. Both are free on their hobby plans.

```
browser ──► Vercel (car-manager-<name>.vercel.app)
              ├── /api/* ─► service "server" (Express, server/app.js) ──► MongoDB Atlas
              └── /*     ─► service "client" (Vite build, falls back to index.html)
```

The client and the API share one origin, so the auth cookie is first-party.
Login therefore works in every browser, Safari and iOS included, and the API
needs no CORS setup. Every push to `main` redeploys.

## Setup

1. **Import the project.** At [vercel.com](https://vercel.com), choose **Add New →
   Project → Import** `Car-Manager`. Keep **Root Directory** at the repository
   root (`./`), not `server` or `client`: the root `vercel.json` defines both
   services. Leave the build settings alone.
2. **Add the secret.** Under **Settings → Environment Variables**, add `SECRET`:
   32+ random characters, e.g. from https://generate-secret.vercel.app/32.
3. **Add the database.** Open **Storage → Create Database → MongoDB Atlas**, pick
   the free plan and connect it to the project. In the **Connect a Project**
   dialog, set **Custom Prefix** to `DB`, so the variable is named `DB_URL`.
4. **Redeploy.** Choose **Deployments → ⋯ → Redeploy**, so the new variables are
   picked up.

Check it: `https://<project>.vercel.app/api/test` returns JSON.

## Bringing over existing local data (optional)

1. In MongoDB Compass, add the Atlas connection string as a new connection.
   Vercel hides sensitive values, so open the database from **Storage → Open in
   MongoDB Atlas → Connect** to get the string.
2. For `users`, `cars` and `services`, export the collection from `localhost` →
   `Car-Manager` as JSON.
3. In the Atlas connection's `Car-Manager` database, create the same collection
   and import the file.

IDs are kept, so cars stay linked to their owners and existing logins keep
working.

## Server configuration

| Variable | Required | Notes |
| --- | --- | --- |
| `DB_URL` | yes | MongoDB connection string. `MONGO_URL` or `MONGODB_URI` also work. Without a database in the path, `Car-Manager` is used. |
| `SECRET` | yes | ≥ 32 characters, signs session tokens |
| `COOKIESECRET` | no | falls back to `SECRET` |
| `CLIENT_ORIGIN` | no | comma-separated origins allowed to call the API from another site |

Vercel deployments run in production mode even without `NODE_ENV`
(`server/config/env.js`). The server refuses to start in production without a
database URL and a `SECRET` of 32+ characters.

## Troubleshooting

- **`/api/*` returns `FUNCTION_INVOCATION_FAILED`.** The server stopped at
  startup. `DB_URL` or `SECRET` is missing, or the deployment predates them.
  Check **Settings → Environment Variables** and redeploy.
- **`503 {"message":"Database is unavailable"}`.** The API is up but can't reach
  MongoDB. Check that the Atlas cluster is not paused. The server retries on the
  next request, so it recovers on its own.

## Demo build (no server)

`npm run build:demo` in `client/` builds a version whose API runs in the browser
with sample data (`src/demo/demoApi.js`). The result is one self-contained page,
`client/dist-demo/car-manager-demo.html`, that can be published anywhere static.

## Local development

```bash
cd server && npm install && npm start      # http://localhost:3000, needs MongoDB on 127.0.0.1:27017
cd client && npm install && npm run dev    # http://localhost:5173, proxies /api to :3000
```
