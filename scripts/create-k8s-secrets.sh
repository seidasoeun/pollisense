#!/usr/bin/env bash
set -euo pipefail

namespace="pollisense"

if [[ "${ALLOW_DEMO_SECRETS:-false}" == "true" ]]; then
  POSTGRES_DB="${POSTGRES_DB:-pollisense}"
  POSTGRES_USER="${POSTGRES_USER:-pollisense}"
  POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-pollisense}"
  INGESTION_TOKEN="${INGESTION_TOKEN:-local-demo-token}"
fi

required_vars=(
  POSTGRES_DB
  POSTGRES_USER
  POSTGRES_PASSWORD
  INGESTION_TOKEN
)

missing=()
for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    missing+=("$var_name")
  fi
done

if (( ${#missing[@]} > 0 )); then
  printf 'Missing required environment variables: %s\n' "${missing[*]}" >&2
  printf 'Set them explicitly, or set ALLOW_DEMO_SECRETS=true for demo defaults.\n' >&2
  exit 1
fi

kubectl create namespace "$namespace" --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic postgres-secret \
  --namespace "$namespace" \
  --from-literal=POSTGRES_DB="$POSTGRES_DB" \
  --from-literal=POSTGRES_USER="$POSTGRES_USER" \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic ingestion-secret \
  --namespace "$namespace" \
  --from-literal=INGESTION_TOKEN="$INGESTION_TOKEN" \
  --dry-run=client -o yaml | kubectl apply -f -

printf 'Applied Kubernetes secrets in namespace %s:\n' "$namespace"
printf '%s\n' '- postgres-secret'
printf '%s\n' '- ingestion-secret'
