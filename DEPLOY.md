# Deploying Car Manager

The React client runs on **Vercel** and the Express API runs on **Railway**.

```
browser ──► Vercel (car-manager-thbi.vercel.app)
              ├── /assets, /index.html, app routes ─► client/dist
              └── /api/* ─► rewrite ─► Railway (car-manager-api.up.railway.app)
                                          └──► MongoDB (Railway)
```

The browser only ever talks to the Vercel domain: `vercel.json` forwards
`/api/*` to Railway. The auth cookie is therefore first-party, so login works in
every browser, Safari and iOS included, and the API needs no CORS setup.

Both platforms redeploy on their own when you push to `main`.

## 1. API on Railway

1. Sign in at [railway.com](https://railway.com) with GitHub and choose
   **New Project → Deploy from GitHub repo → Car-Manager**.
2. Open the new service and go to **Settings**:
   - **Source → Root Directory:** `server`. Railway builds `server/Dockerfile`.
   - **Config-as-code → Railway Config File:** `/railway.json`. This adds the
     `/healthz` health check and restarts the server if it crashes.
3. Add the database: in the project canvas click **+ Create → Database →
   MongoDB**.
4. In the API service, open **Variables** and add:

   | Name | Value |
   | --- | --- |
   | `DB_URL` | `${{MongoDB.MONGO_URL}}` (type it exactly like this; Railway fills it in) |
   | `SECRET` | 32+ random characters, e.g. from https://generate-secret.vercel.app/32 |

5. **Settings → Networking → Generate Domain.** Accept the suggested port, then
   edit the domain to **`car-manager-api`** so it becomes
   `car-manager-api.up.railway.app`, which is the address `vercel.json` points
   to. If that name is taken, pick another and change the `destination` in
   `vercel.json` to match.

Check it: `https://car-manager-api.up.railway.app/api/test` returns JSON.

## 2. Client on Vercel

The existing Vercel project keeps working as is. Its **Root Directory** must be
the repository root (`./`); `vercel.json` builds `client/` and sets up the
rewrite. After the change is merged, Vercel redeploys on its own. If it doesn't,
use **Deployments → ⋯ → Redeploy**.

The Vercel project needs no environment variables. `SECRET` and any database
variables or MongoDB integration left over from the earlier setup can be removed
from Vercel.

Check it: `https://car-manager-thbi.vercel.app/api/test` returns the same JSON,
this time through Vercel.

## Cost

Railway has no permanent free tier. New accounts get a one-time trial credit,
and after that the Hobby plan costs $5/month, which includes $5 of usage. This
app (a small Node server and MongoDB) normally stays within that. Vercel's Hobby
plan is free.

## Bringing over existing local data (optional)

In Railway open the MongoDB service, **Variables**, and copy `MONGO_PUBLIC_URL`.
In MongoDB Compass, add it as a new connection. For `users`, `cars` and
`services`, export the collection from `localhost` → `Car-Manager` as JSON. Then
create the same collection in the Railway connection's `Car-Manager` database
and import the file. IDs are kept, so cars stay linked to their owners and
existing logins keep working.

## Server configuration

| Variable | Required | Notes |
| --- | --- | --- |
| `DB_URL` | yes | MongoDB connection string. `MONGO_URL` or `MONGODB_URI` also work. Without a database in the path, `Car-Manager` is used. |
| `SECRET` | yes | ≥ 32 characters, signs session tokens |
| `COOKIESECRET` | no | falls back to `SECRET` |
| `CLIENT_ORIGIN` | no | comma-separated origins allowed to call the API directly; not needed with the Vercel rewrite |
| `PORT` | no | set by Railway |

`NODE_ENV=production` is set in the Docker image. The server refuses to start in
production without a database URL and a `SECRET` of 32+ characters.

## Troubleshooting

- **`503 {"message":"Database is unavailable"}`**: the API is up but can't reach
  MongoDB. Check that `DB_URL` is `${{MongoDB.MONGO_URL}}` and that the MongoDB
  service is running. The server retries on the next request, so it recovers on
  its own.
- **The deploy fails or keeps restarting**: open the deployment's logs in
  Railway. A missing `DB_URL` or a short `SECRET` stops the server at startup
  with a message saying which one.
- **`/api/*` on Vercel returns 404 or an error page while Railway works**: the
  Railway domain doesn't match the `destination` in `vercel.json`.

## Local development

```bash
cd server && npm install && npm start      # http://localhost:3000, needs MongoDB on 127.0.0.1:27017
cd client && npm install && npm run dev    # http://localhost:5173, proxies /api to :3000
```
