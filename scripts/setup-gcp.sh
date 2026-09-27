#!/usr/bin/env bash
# One-time Google Cloud setup for Car Manager. Safe to re-run: every step checks
# what already exists and only fills in what is missing.
#
# Run it in Google Cloud Shell (https://shell.cloud.google.com). Cloud Shell is
# free, already signed in as the project owner, and has gcloud, node and npm.
#
#   git clone https://github.com/Milen03/Car-Manager.git && cd Car-Manager
#   ./scripts/setup-gcp.sh
#   ./scripts/deploy.sh
#
# What it does:
#   - enables the APIs the app needs
#   - stores the MongoDB connection string and two generated signing secrets in
#     Secret Manager (nothing secret ends up in the repo or in the service config)
#   - lets the Cloud Run runtime read those secrets and lets Cloud Build build it
#   - keeps only the two newest container images, so storage stays in the free tier
#   - adds a budget alert that emails you if the project ever costs money
set -eEuo pipefail
cd "$(dirname "$0")/.."

# gcloud must never stop to ask a question: several calls below hide its output,
# so a prompt would be invisible and the script would look frozen.
export CLOUDSDK_CORE_DISABLE_PROMPTS=1

PROJECT_ID="${PROJECT_ID:-car-manager-508119}"
REGION="${REGION:-europe-west4}"
SERVICE="${SERVICE:-car-manager}"
BUDGET_AMOUNT="${BUDGET_AMOUNT:-5}"
IMAGE_REPO="cloud-run-source-deploy"

step() { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;31m!!  %s\033[0m\n' "$*"; }
trap 'warn "Stopped at line $LINENO: $BASH_COMMAND"' ERR

# Questions read only fresh keyboard input. Anything already waiting (for example
# the next lines of a multi-line paste) is discarded first, so it cannot answer them.
drain_typeahead() {
  if [ -t 0 ]; then
    while read -r -t 0 2>/dev/null; do read -r -t 1 _ || break; done
  fi
}
# End of input (Ctrl+D) stops the script instead of re-asking forever.
ask() { local reply; drain_typeahead; read -rp "$1" reply || exit 1; printf '%s' "$reply"; }
ask_hidden() { local reply; drain_typeahead; read -rsp "$1" reply || exit 1; echo >&2; printf '%s' "$reply"; }

# mongodb+srv://user:pass@cluster0.abcde.mongodb.net/db?opts -> cluster0.abcde.mongodb.net
mongo_host() { local rest="${1#*://}"; rest="${rest##*@}"; printf '%s' "${rest%%[/?]*}"; }

secret_exists() { gcloud secrets describe "$1" --project "$PROJECT_ID" >/dev/null 2>&1; }

create_secret() {
  printf '%s' "$2" | gcloud secrets create "$1" --project "$PROJECT_ID" \
    --replication-policy=automatic --data-file=- >/dev/null
  echo "Created secret $1"
}

# Prints the plain value of an env var on the currently deployed service, if any,
# so an existing MongoDB connection string can be carried over.
existing_service_env() {
  local service_json
  service_json="$(gcloud run services describe "$SERVICE" --project "$PROJECT_ID" --region "$REGION" \
    --format=json 2>/dev/null)" || return 0
  printf '%s' "$service_json" | python3 -c '
import json, sys
service = json.load(sys.stdin)
for container in service.get("spec", {}).get("template", {}).get("spec", {}).get("containers", []):
    for env in container.get("env", []):
        if env.get("name") == sys.argv[1] and "value" in env:
            print(env["value"])
' "$1"
}

check_mongo() {
  (
    cd server
    npm ci --omit=dev --silent --no-audit --no-fund >/dev/null
    DB_URL="$1" node -e '
      require("mongoose")
        .connect(process.env.DB_URL, { serverSelectionTimeoutMS: 15000 })
        .then(() => { console.log("MongoDB connection OK"); process.exit(0); })
        .catch((error) => { console.error(error.message); process.exit(1); });
    '
  )
}

step "Project $PROJECT_ID, region $REGION"
gcloud config set project "$PROJECT_ID" >/dev/null
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"

if [ "$(gcloud billing projects describe "$PROJECT_ID" --format='value(billingEnabled)')" != "True" ]; then
  warn "Billing is not enabled. Cloud Run needs a billing account even though this app stays inside the free tier."
  warn "Link one at https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID and re-run this script."
  exit 1
fi
BILLING_ACCOUNT_ID="$(gcloud billing projects describe "$PROJECT_ID" --format='value(billingAccountName)')"
BILLING_ACCOUNT_ID="${BILLING_ACCOUNT_ID#billingAccounts/}"

step "Enabling APIs (takes a minute the first time)"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  firebasehosting.googleapis.com \
  billingbudgets.googleapis.com \
  --project "$PROJECT_ID"

# A freshly enabled API can take a minute before it answers.
for attempt in $(seq 1 24); do
  gcloud secrets list --project "$PROJECT_ID" --limit=1 >/dev/null 2>&1 && break
  if [ "$attempt" = 24 ]; then
    warn "Secret Manager is still not answering. Wait a minute and re-run this script."
    exit 1
  fi
  [ "$attempt" = 1 ] && echo "Waiting for the APIs to become available..."
  sleep 5
done

step "Secrets"
if secret_exists DB_URL; then
  echo "DB_URL already stored, keeping it."
  echo "  To replace it: printf '%s' 'mongodb+srv://...' | gcloud secrets versions add DB_URL --data-file=-"
else
  db_url="${DB_URL:-}"
  if [ -z "$db_url" ]; then
    db_url="$(existing_service_env DB_URL_CREDENTIALS)"
    [ -n "$db_url" ] || db_url="$(existing_service_env DB_URL)"
    if [ -n "$db_url" ]; then
      echo "The current Cloud Run service points at MongoDB host: $(mongo_host "$db_url")"
      case "$(ask "Reuse that connection string? [Y/n] ")" in [nN]*) db_url="" ;; esac
    fi
  fi

  while true; do
    while [[ ! "$db_url" =~ ^mongodb(\+srv)?:// ]]; do
      [ -z "$db_url" ] || warn "That does not look like a MongoDB connection string."
      echo "Paste the MongoDB connection string from Atlas (Connect -> Drivers, mongodb+srv://...) and press Enter."
      db_url="$(ask_hidden "The input is hidden, like a password: ")"
    done

    echo "Checking that $(mongo_host "$db_url") is reachable..."
    if check_mongo "$db_url"; then
      break
    fi
    warn "Could not connect. In MongoDB Atlas check that the cluster exists and is not paused,"
    warn "that the password in the string is right, and that Network Access allows 0.0.0.0/0."
    case "$(ask "Enter a different connection string? [Y/n] ")" in
      [nN]*)
        case "$(ask "Store this one anyway? [y/N] ")" in [yY]*) break ;; *) exit 1 ;; esac ;;
      *) db_url="" ;;
    esac
  done
  create_secret DB_URL "$db_url"
fi

for name in JWT_SECRET COOKIE_SECRET; do
  if secret_exists "$name"; then
    echo "$name already stored, keeping it."
  else
    create_secret "$name" "$(openssl rand -hex 32)"
  fi
done

step "Permissions"
RUNTIME_SA="$(gcloud run services describe "$SERVICE" --project "$PROJECT_ID" --region "$REGION" \
  --format='value(spec.template.spec.serviceAccountName)' 2>/dev/null || true)"
RUNTIME_SA="${RUNTIME_SA:-${PROJECT_NUMBER}-compute@developer.gserviceaccount.com}"
echo "Runtime service account: $RUNTIME_SA"

for name in DB_URL JWT_SECRET COOKIE_SECRET; do
  gcloud secrets add-iam-policy-binding "$name" --project "$PROJECT_ID" \
    --member="serviceAccount:$RUNTIME_SA" --role=roles/secretmanager.secretAccessor >/dev/null
done
echo "Runtime can read the secrets."

# Source deploys build with the Compute Engine default service account.
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role=roles/run.builder --condition=None >/dev/null
echo "Cloud Build can build the image."

step "Container image storage"
if ! gcloud artifacts repositories describe "$IMAGE_REPO" --project "$PROJECT_ID" --location "$REGION" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$IMAGE_REPO" --project "$PROJECT_ID" --location "$REGION" \
    --repository-format=docker --description="Cloud Run source deployments"
fi
gcloud artifacts repositories set-cleanup-policies "$IMAGE_REPO" --project "$PROJECT_ID" --location "$REGION" \
  --policy=scripts/artifact-cleanup-policy.json >/dev/null
echo "Only the two newest images are kept."

step "Budget alert"
if [ -n "$(gcloud billing budgets list --billing-account="$BILLING_ACCOUNT_ID" \
      --filter="displayName='Car Manager'" --format='value(name)' 2>/dev/null)" ]; then
  echo "Budget alert already exists."
elif gcloud billing budgets create --billing-account="$BILLING_ACCOUNT_ID" \
      --display-name="Car Manager" --budget-amount="$BUDGET_AMOUNT" \
      --filter-projects="projects/$PROJECT_ID" \
      --threshold-rule=percent=0.1 --threshold-rule=percent=0.5 --threshold-rule=percent=1.0 >/dev/null; then
  echo "You will get an email if this project's monthly cost passes 10%, 50% and 100% of $BUDGET_AMOUNT (billing account currency)."
else
  warn "Could not create the budget alert. Add one at https://console.cloud.google.com/billing/$BILLING_ACCOUNT_ID/budgets"
fi

step "Setup complete. Now run ./scripts/deploy.sh"
