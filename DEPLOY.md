# Deploying Car Manager

The app deploys to two places:

| Part | Target | Identifier |
| --- | --- | --- |
| `client` | Firebase Hosting | project `car-manager-508119` |
| `server` | Cloud Run | service `car-manager`, region `europe-west4` |

## Automated deploy (recommended)

`.github/workflows/deploy.yml` runs the full pipeline: lint + build the client,
run the server tests, then deploy whichever side you pick and poll `/api/test`
until it answers `200`.

Run it from **Actions → Deploy → Run workflow**, choosing `both`, `client`, or
`server`.

### One-time setup

Create a `production` environment in **Settings → Environments**, then add:

**Secrets**

| Name | Contents |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT` | JSON key for a service account with the *Firebase Hosting Admin* role |
| `GCP_SERVICE_ACCOUNT` | JSON key for a service account with *Cloud Run Admin*, *Cloud Build Editor*, *Artifact Registry Writer*, and *Service Account User* |

**Variable**

| Name | Example |
| --- | --- |
| `CLIENT_ORIGIN` | `https://car-manager-508119.web.app` |

JSON keys are the simplest option but are long-lived. Workload Identity
Federation is the safer alternative — swap `credentials_json` for
`workload_identity_provider` + `service_account` in both auth steps.

The Cloud Run deploy reads `DB_URL` and `COOKIESECRET` from **Secret Manager**,
not from GitHub. Create them once:

```bash
printf '%s' 'mongodb+srv://…' | gcloud secrets create DB_URL --data-file=- --project car-manager-508119
openssl rand -hex 32 | gcloud secrets create COOKIESECRET --data-file=- --project car-manager-508119
```

Grant the Cloud Run runtime service account `roles/secretmanager.secretAccessor`
on both.

### Verify the project IDs before the first run

`client/.firebaserc` names Firebase project `car-manager-508119`, but the
deployed API lives at `car-manager-921712960148.europe-west4.run.app` —
project **number** `921712960148`. If those are two different GCP projects,
change `GCP_PROJECT` in the workflow's `env:` block to the Cloud Run one.

## Manual deploy

```bash
# client
cd client && npm ci && npm run build
npx firebase-tools deploy --only hosting --project car-manager-508119

# server
gcloud run deploy car-manager --source server \
  --project car-manager-508119 --region europe-west4 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,CLIENT_ORIGIN=https://car-manager-508119.web.app \
  --set-secrets DB_URL=DB_URL:latest,COOKIESECRET=COOKIESECRET:latest
```

## Required server configuration

`server/config/config.js` throws on startup unless `DB_URL` and `CLIENT_ORIGIN`
are set, and `server/app-config.js` throws unless `COOKIESECRET` is at least
32 characters. `CLIENT_ORIGIN` is a comma-separated allowlist and must contain
the exact Hosting origin, scheme included, or the browser fails CORS.

## Troubleshooting

**`503 {"message":"Database is unavailable"}`** — the container is running but
Mongoose never connected (`server/index.js:24`). Redeploying does not fix it.
Check, in order:

1. The Atlas cluster is not paused.
2. Atlas Network Access allows Cloud Run — it has no static egress, so either
   allowlist `0.0.0.0/0` or route it through a VPC connector with a NAT.
3. `DB_URL` in Secret Manager is current, and the runtime service account can
   read it.
4. `gcloud run services logs read car-manager --region europe-west4` — the
   connection error is logged as `Database connection failed:`.

**CORS failures after a Hosting deploy** — `CLIENT_ORIGIN` on Cloud Run must
list the origin the browser actually uses (`.web.app`, `.firebaseapp.com`, and
any custom domain are distinct origins).
