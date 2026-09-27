#!/usr/bin/env bash
# Deploys Car Manager and checks the live site. Run ./scripts/setup-gcp.sh once first.
#
#   ./scripts/deploy.sh           # API + client
#   ./scripts/deploy.sh server    # API only
#   ./scripts/deploy.sh client    # client only
#
# The client is served by Firebase Hosting, which forwards /api/** to the Cloud Run
# service, so the whole app lives on one origin: https://<project>.web.app
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_ID="${PROJECT_ID:-car-manager-508119}"
REGION="${REGION:-europe-west4}"
SERVICE="${SERVICE:-car-manager}"
SITE_URL="${SITE_URL:-https://${PROJECT_ID}.web.app}"
CLIENT_ORIGIN="${CLIENT_ORIGIN:-https://${PROJECT_ID}.web.app,https://${PROJECT_ID}.firebaseapp.com}"
TARGET="${1:-all}"

step() { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }
fail() { printf '\033[1;31m!!  %s\033[0m\n' "$*"; exit 1; }

case "$TARGET" in all|server|client) ;; *) fail "Unknown target '$TARGET'. Use all, server or client." ;; esac

deploy_server() {
  step "Deploying the API to Cloud Run ($SERVICE, $REGION)"
  # Cost controls:
  #   --scaling auto --min 0 --min-instances 0  scale to zero when idle; --min 0 also
  #                                             clears any service-wide minimum
  #   --max-instances 1                         hard cap; one instance serves 80 requests at once
  #   --cpu-throttling                          billed only while a request is running
  #   --cpu-boost                               faster cold starts, billed only during startup
  gcloud run deploy "$SERVICE" \
    --source server \
    --project "$PROJECT_ID" \
    --region "$REGION" \
    --allow-unauthenticated \
    --scaling auto \
    --min 0 \
    --min-instances 0 \
    --max-instances 1 \
    --cpu 1 \
    --memory 512Mi \
    --cpu-throttling \
    --cpu-boost \
    --concurrency 80 \
    --timeout 60 \
    --set-env-vars "^;^NODE_ENV=production;CLIENT_ORIGIN=${CLIENT_ORIGIN}" \
    --set-secrets "DB_URL=DB_URL:latest,SECRET=JWT_SECRET:latest,COOKIESECRET=COOKIE_SECRET:latest" \
    --quiet
}

deploy_client() {
  step "Building the client"
  (cd client && npm ci --no-audit --no-fund && npm run build)

  step "Deploying the client to Firebase Hosting"
  if ! (cd client && npx --yes firebase-tools@15 deploy --only hosting --project "$PROJECT_ID" --non-interactive); then
    fail "Firebase deploy failed. If it reported an authentication error, run: npx firebase-tools@15 login --no-localhost"
  fi
}

# Hits the API through Hosting, exactly the way a visitor's browser does, so a
# broken rewrite, a crashed container or an unreachable database all fail here.
smoke_test() {
  step "Checking $SITE_URL"
  local body status attempt
  body="$(mktemp)"
  for attempt in 1 2 3 4 5 6; do
    # curl reports 000 itself when it cannot connect.
    status="$(curl -s -o "$body" -w '%{http_code}' "$SITE_URL/api/test")" || true
    if [ "$status" = "200" ] && grep -q '"name":"rest-api"' "$body"; then
      echo "API OK through Hosting (attempt $attempt)."
      break
    fi
    echo "attempt $attempt: HTTP $status $(head -c 200 "$body")"
    [ "$attempt" = 6 ] && fail "The API is not answering through $SITE_URL/api. Logs: gcloud run services logs read $SERVICE --region $REGION --limit 50"
    sleep 10
  done

  status="$(curl -s -o "$body" -w '%{http_code}' "$SITE_URL/cars/catalog")" || true
  if [ "$status" != "200" ] || ! grep -q '<title>Car Manager</title>' "$body"; then
    fail "The client did not load from $SITE_URL (HTTP $status)."
  fi
  echo "Client OK."
  rm -f "$body"
}

[ "$TARGET" = "client" ] || deploy_server
[ "$TARGET" = "server" ] || deploy_client
smoke_test

step "Live at $SITE_URL"
