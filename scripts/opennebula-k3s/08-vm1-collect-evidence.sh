#!/usr/bin/env bash
# Run on VM1. Collects demo evidence without dumping secret values.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env.local" ]] && source "$SCRIPT_DIR/.env.local"

VM1_IP="${VM1_IP:-172.16.100.2}"
NAMESPACE="${NAMESPACE:-pollisense}"
BACKEND_PORT="${BACKEND_PORT:-8080}"
STAMP="$(date +%Y%m%d-%H%M%S)"
EVIDENCE_DIR="${EVIDENCE_DIR:-$HOME/pollisense-evidence/$STAMP}"

log() { printf '\n[INFO] %s\n' "$*"; }
capture() {
  local name="$1"
  shift
  log "Saving $name"
  "$@" > "$EVIDENCE_DIR/$name" 2>&1 || true
}

mkdir -p "$EVIDENCE_DIR"

capture kubectl-nodes-wide.txt kubectl get nodes -o wide
capture kubectl-all-wide.txt kubectl get all -n "$NAMESPACE" -o wide
capture kubectl-pvc.txt kubectl get pvc -n "$NAMESPACE"
capture kubectl-secrets.txt kubectl get secrets -n "$NAMESPACE"
capture kubectl-networkpolicy.txt kubectl get networkpolicy -n "$NAMESPACE"
capture simulator-logs-tail.txt kubectl logs -n "$NAMESPACE" deployment/pollisense-simulator --tail=100

capture backend-health.json curl -fsS "http://$VM1_IP:$BACKEND_PORT/actuator/health"
capture backend-records.json curl -fsS "http://$VM1_IP:$BACKEND_PORT/api/records"
capture backend-alerts.json curl -fsS "http://$VM1_IP:$BACKEND_PORT/api/alerts"
capture backend-summary.json curl -fsS "http://$VM1_IP:$BACKEND_PORT/api/summary"

capture systemctl-frontend-portforward.txt systemctl status pollisense-frontend-portforward.service --no-pager
capture systemctl-backend-portforward.txt systemctl status pollisense-backend-portforward.service --no-pager
capture ss-listening.txt ss -lntp

cat <<EOF

[INFO] Evidence saved to:
  $EVIDENCE_DIR

[INFO] Secret manifests were not dumped. Only 'kubectl get secrets' output was saved.
EOF
