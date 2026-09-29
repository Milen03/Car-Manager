# Deploying Car Manager

## Vercel (recommended)

Free, no credit card, and every push to `main` redeploys automatically. The
client and the API run on one domain, so login works in every browser.

**1. Import the project.** Sign in at [vercel.com](https://vercel.com) with
GitHub, then **Add New → Project → Import** `Car-Manager`. Keep **Root
Directory** at the repository root (`./`), not `server` or `client`: the root
`vercel.json` defines both services. Leave the build settings alone. Under
**Environment Variables** add:

| Name | Value |
| --- | --- |
| `SECRET` | 32+ random characters, e.g. from https://generate-secret.vercel.app/32 |

Click **Deploy**. The site loads, but the API answers `503` until step 2.

**2. Add the database.** In the project open **Storage → Create Database →
MongoDB Atlas**, pick the free plan and connect it to the project. This sets
`MONGODB_URI`, which the server reads.

**3. Redeploy.** **Deployments → ⋯ → Redeploy**, so the new variable is
picked up. The app is live at `https://<project>.vercel.app`.

### Bringing over existing local data (optional)

Copy `MONGODB_URI` from **Settings → Environment Variables**, open MongoDB
Compass, and add it as a new connection. For `users`, `cars` and `services`:
export the collection from `localhost` → `Car-Manager` as JSON, then create the
same collection in the Atlas connection's `Car-Manager` database and import the
file. IDs are kept, so cars stay linked to their owners and existing logins keep
working. When the connection string names no database, the server uses
`Car-Manager`.

### How it fits together

- `vercel.json` defines two [services](https://vercel.com/docs/services):
  `client` (Vite, static) and `server` (Express, entrypoint `server/app.js`).
  Public rewrites send `/api/*` to `server` and everything else to `client`,
  which falls back to `index.html` for app routes. Services receive the original
  path, so the Express routes stay under `/api`. The browser is the only caller
  of the API, so the services need no bindings.
- Vercel deployments run in production mode even without `NODE_ENV`
  (`server/config/env.js`).
- Only `SECRET` and `MONGODB_URI` (or `DB_URL`) are required in production.
  `CLIENT_ORIGIN` is only needed if another origin must call the API, and
  `COOKIESECRET` falls back to `SECRET`.

---

## Alternative: Google Cloud (Firebase Hosting + Cloud Run)

### How it is hosted

```
browser ──► Firebase Hosting (car-manager-508119.web.app)
              ├── /assets, /index.html, SPA routes ─► static files from client/dist
              └── /api/** ─────────────────────────► Cloud Run "car-manager" (europe-west4)
                                                        └──► MongoDB Atlas (free M0)
```

The client and the API share one origin, so the auth cookie is first-party. That
is what makes login work in Safari/iOS and in private windows, which block the
third-party cookie the old two-domain setup relied on. Firebase Hosting only
forwards a cookie named `__session` to Cloud Run, which is why the server uses
that name.

### Cost

Built to stay at **€0** for a portfolio demo:

| Piece | Setting | Free allowance |
| --- | --- | --- |
| Cloud Run | scales to zero, max 1 instance, billed only during requests | 180k vCPU-seconds, 2M requests / month |
| Firebase Hosting | hashed assets cached for a year | 10 GB storage, 360 MB/day transfer |
| Artifact Registry | only the 2 newest images kept | 0.5 GB |
| Secret Manager | 3 secrets | 6 secret versions, 10k reads / month |
| MongoDB Atlas | M0 cluster | 512 MB, free forever |

`setup-gcp.sh` also adds a budget alert that emails you at 10%, 50% and 100% of
5/month in your billing account's currency (`BUDGET_AMOUNT` to change). Google
Cloud never caps spending on its own; the one-instance limit is what bounds it.

The trade-off of scaling to zero: once the service has sat idle for a while,
the next request takes a few extra seconds while an instance starts and
connects to MongoDB. Requests after that are fast. Open the site a minute
before you demo it.

### First deploy

**1. MongoDB.** In [MongoDB Atlas](https://cloud.mongodb.com), make sure the
cluster exists and is not paused, and under **Network Access** allow
`0.0.0.0/0` — Cloud Run has no fixed outbound IP. Copy the connection string
(`mongodb+srv://…`).

**2. Google Cloud.** Open [Cloud Shell](https://shell.cloud.google.com) — it is
free and already signed in — and run:

```bash
git clone https://github.com/Milen03/Car-Manager.git && cd Car-Manager
./scripts/setup-gcp.sh     # once: APIs, secrets, permissions, cost limits
./scripts/deploy.sh        # build, deploy, and check the live site
```

Run the lines one at a time: `setup-gcp.sh` asks questions, and pasting all
three lines at once used to feed the next line in as an answer.

`setup-gcp.sh` asks for the MongoDB connection string (or offers to reuse the
one from the existing service), tests that it connects, and stores it in Secret
Manager next to two generated signing secrets. Nothing secret goes into the repo
or the service config. Re-running it is safe.

`deploy.sh` ends by requesting `/api/test` through Hosting — the same path a
browser takes — and fails loudly if the API, the rewrite or the database is
broken.

### Redeploying

```bash
./scripts/deploy.sh          # both
./scripts/deploy.sh server   # API only
./scripts/deploy.sh client   # client only
```

#### From GitHub instead (optional)

**Actions → Deploy → Run workflow** runs the same `deploy.sh` after lint, build
and tests. It needs one repository secret, `GCP_SERVICE_ACCOUNT`: a JSON key for
a service account with

- Cloud Run Source Developer (`roles/run.sourceDeveloper`)
- Service Usage Consumer (`roles/serviceusage.serviceUsageConsumer`)
- Service Account User (`roles/iam.serviceAccountUser`) on the runtime service account
- Firebase Hosting Admin (`roles/firebasehosting.admin`)

Run `setup-gcp.sh` once from Cloud Shell first; the workflow only deploys.

### Server configuration

Set by `deploy.sh`; listed here for reference.

| Variable | Source | Notes |
| --- | --- | --- |
| `NODE_ENV` | `production` | |
| `CLIENT_ORIGIN` | the `.web.app` and `.firebaseapp.com` origins | optional; only for other origins calling the API |
| `DB_URL` | secret `DB_URL` | |
| `SECRET` | secret `JWT_SECRET` | ≥ 32 characters, signs session tokens |
| `COOKIESECRET` | secret `COOKIE_SECRET` | ≥ 32 characters |

The server refuses to start in production without a database URL and a `SECRET` of 32+ characters.

### Troubleshooting

**`503 {"message":"Database is unavailable"}`** — the API is up but cannot reach
MongoDB. Check that the Atlas cluster is not paused, that Network Access allows
`0.0.0.0/0`, and that the `DB_URL` secret is current:

```bash
printf '%s' 'mongodb+srv://…' | gcloud secrets versions add DB_URL --data-file=-
./scripts/deploy.sh server
gcloud run services logs read car-manager --region europe-west4 --limit 50
```

An instance now retries the connection on the next request, so it recovers on
its own once the database is reachable again.

**Firebase deploy reports an authentication error** — run
`npx firebase-tools@15 login --no-localhost` once in Cloud Shell, then deploy again.

## Local development

```bash
cd server && npm install && npm start      # http://localhost:3000, needs MongoDB on 127.0.0.1:27017
cd client && npm install && npm run dev    # http://localhost:5173, proxies /api to :3000
```
