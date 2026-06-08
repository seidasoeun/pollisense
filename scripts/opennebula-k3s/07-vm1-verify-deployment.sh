#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env.local" ]] && source "$SCRIPT_DIR/.env.local"

VM1_IP="${VM1_IP:-172.16.100.2}"
NAMESPACE="${NAMESPACE:-pollisense}"
BACKEND_PORT="${BACKEND_PORT:-8080}"

log() { printf '\n[INFO] %s\n' "$*"; }
pass() { printf '[PASS] %s\n' "$*"; }
warn() { printf '[WARN] %s\n' "$*" >&2; }

curl_json() {
  local name="$1"
  local url="$2"
  local output="$3"
  if curl -fsS "$url" -o "$output"; then
    pass "$name returned a response"
    cat "$output"
    printf '\n'
  else
    warn "$name failed at $url"
  fi
}

log "Cluster and namespace status"
kubectl get nodes -o wide
kubectl get pods -n "$NAMESPACE" -o wide
kubectl get services -n "$NAMESPACE"
kubectl get pvc -n "$NAMESPACE"
kubectl get secrets -n "$NAMESPACE"
kubectl get networkpolicy -n "$NAMESPACE" || warn "NetworkPolicy resources were not listed"

log "Simulator logs"
kubectl logs -n "$NAMESPACE" deployment/pollisense-simulator --tail=80 || warn "Could not read simulator logs"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

log "Backend API checks through $VM1_IP:$BACKEND_PORT"
curl_json "Backend health" "http://$VM1_IP:$BACKEND_PORT/actuator/health" "$tmp_dir/health.json"
curl_json "Records API" "http://$VM1_IP:$BACKEND_PORT/api/records" "$tmp_dir/records-before.json"
curl_json "Alerts API" "http://$VM1_IP:$BACKEND_PORT/api/alerts" "$tmp_dir/alerts.json"
curl_json "Summary API" "http://$VM1_IP:$BACKEND_PORT/api/summary" "$tmp_dir/summary.json"

log "Scaling backend to 3 replicas"
kubectl scale deployment pollisense-backend -n "$NAMESPACE" --replicas=3
kubectl rollout status deployment/pollisense-backend -n "$NAMESPACE" --timeout=180s
kubectl get pods -n "$NAMESPACE" -o wide -l app=pollisense-backend
pass "Backend scaled to 3 replicas"

log "Scaling backend back to 1 replica"
kubectl scale deployment pollisense-backend -n "$NAMESPACE" --replicas=1
kubectl rollout status deployment/pollisense-backend -n "$NAMESPACE" --timeout=180s
pass "Backend returned to 1 replica"

log "PostgreSQL persistence test"
curl_json "Records before PostgreSQL restart" "http://$VM1_IP:$BACKEND_PORT/api/records" "$tmp_dir/records-before-postgres.json"
kubectl delete pod -n "$NAMESPACE" -l app=postgres --wait=false
kubectl rollout status deployment/postgres -n "$NAMESPACE" --timeout=180s
curl_json "Records after PostgreSQL restart" "http://$VM1_IP:$BACKEND_PORT/api/records" "$tmp_dir/records-after-postgres.json"
pass "PostgreSQL pod restart completed; compare the before/after records above for persistence evidence"

if kubectl get networkpolicy -n "$NAMESPACE" >/dev/null 2>&1; then
  pass "NetworkPolicy objects exist"
  warn "NetworkPolicy enforcement depends on the installed CNI, so this script does not fail if enforcement is not proven"
else
  warn "NetworkPolicy objects were not found"
fi
