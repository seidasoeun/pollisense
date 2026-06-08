#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env.local" ]] && source "$SCRIPT_DIR/.env.local"

NAMESPACE="${NAMESPACE:-pollisense}"
REPO_URL="${REPO_URL:-https://github.com/seidasoeun/pollisense.git}"
APP_DIR="${APP_DIR:-$HOME/pollisense}"
CLEAN_NAMESPACE="${CLEAN_NAMESPACE:-false}"

log() { printf '\n[INFO] %s\n' "$*"; }
warn() { printf '\n[WARN] %s\n' "$*" >&2; }
die() { printf '\n[ERROR] %s\n' "$*" >&2; exit 1; }
as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then "$@"; else sudo "$@"; fi
}

if [[ -d "$APP_DIR/.git" ]]; then
  log "Updating existing repository at $APP_DIR"
  git -C "$APP_DIR" pull --ff-only
else
  log "Cloning PolliSense into $APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

log "Running local validation before deployment"
docker compose config >/dev/null
kubectl apply --dry-run=client -f k8s/
bash -n scripts/create-k8s-secrets.sh
bash -n scripts/check-k8s-demo.sh

if [[ "$CLEAN_NAMESPACE" == "true" ]]; then
  warn "CLEAN_NAMESPACE=true, deleting namespace $NAMESPACE before redeploy"
  kubectl delete namespace "$NAMESPACE" --ignore-not-found
  for _ in {1..60}; do
    kubectl get namespace "$NAMESPACE" >/dev/null 2>&1 || break
    sleep 2
  done
else
  log "Keeping existing namespace. Set CLEAN_NAMESPACE=true only for a clean redeploy."
fi

log "Building local Docker images"
docker build -t pollisense-backend:latest ./pollisense-backend
docker build -t pollisense-simulator:latest ./pollisense-simulator
docker build -t pollisense-frontend:latest ./pollisense-frontend

log "Importing local images into VM1 k3s containerd"
for image in pollisense-backend:latest pollisense-simulator:latest pollisense-frontend:latest; do
  safe_name="${image/:/-}.tar"
  docker save "$image" -o "/tmp/$safe_name"
  as_root k3s ctr images import "/tmp/$safe_name"
  rm -f "/tmp/$safe_name"
done

log "Applying Kubernetes manifests from k8s/"
kubectl apply -f k8s/

log "Waiting for rollouts"
for deployment in postgres pollisense-backend pollisense-simulator pollisense-frontend; do
  kubectl rollout status -n "$NAMESPACE" "deployment/$deployment" --timeout=180s
done

log "Deployment status"
kubectl get nodes -o wide
kubectl get all -n "$NAMESPACE" -o wide
kubectl get pvc -n "$NAMESPACE"
kubectl get secrets -n "$NAMESPACE"
kubectl get networkpolicy -n "$NAMESPACE"

cat <<EOF

[INFO] Next commands:
  bash scripts/opennebula-k3s/04-vm1-copy-images-to-vm2.sh
  bash scripts/opennebula-k3s/05-vm1-setup-portforward-services.sh
EOF
