#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env.local" ]] && source "$SCRIPT_DIR/.env.local"

VM1_IP="${VM1_IP:-172.16.100.2}"
NAMESPACE="${NAMESPACE:-pollisense}"
FRONTEND_PORT="${FRONTEND_PORT:-9999}"
BACKEND_PORT="${BACKEND_PORT:-8080}"

log() { printf '\n[INFO] %s\n' "$*"; }
warn() { printf '\n[WARN] %s\n' "$*" >&2; }
as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then "$@"; else sudo "$@"; fi
}

log "Starting k3s on VM1"
as_root systemctl start k3s

log "Waiting for Kubernetes API"
for _ in {1..60}; do
  if kubectl get nodes >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
kubectl get nodes >/dev/null 2>&1

log "Cluster nodes"
kubectl get nodes -o wide

log "Waiting for PolliSense rollouts"
for deployment in postgres pollisense-backend pollisense-simulator pollisense-frontend; do
  kubectl rollout status -n "$NAMESPACE" "deployment/$deployment" --timeout=180s
done

log "Pods and PVC"
kubectl get pods -n "$NAMESPACE" -o wide
kubectl get pvc -n "$NAMESPACE"

if systemctl list-unit-files pollisense-frontend-portforward.service >/dev/null 2>&1 &&
   systemctl list-unit-files pollisense-backend-portforward.service >/dev/null 2>&1; then
  log "Restarting systemd port-forward services"
  as_root systemctl restart pollisense-frontend-portforward.service
  as_root systemctl restart pollisense-backend-portforward.service
else
  warn "Port-forward systemd services are not installed; starting nohup fallbacks"
  nohup kubectl port-forward -n "$NAMESPACE" svc/pollisense-frontend "$FRONTEND_PORT:80" --address "$VM1_IP" > /tmp/pollisense-frontend-portforward.log 2>&1 &
  nohup kubectl port-forward -n "$NAMESPACE" svc/pollisense-backend "$BACKEND_PORT:8080" --address "$VM1_IP" > /tmp/pollisense-backend-portforward.log 2>&1 &
fi

sleep 2
log "Listening ports"
as_root sh -c "ss -lntp | grep -E ':($FRONTEND_PORT|$BACKEND_PORT)\\b'" || true

cat <<EOF

[INFO] Firefox/SOCKS URLs:
  Frontend: http://$VM1_IP:$FRONTEND_PORT
  Backend:  http://$VM1_IP:$BACKEND_PORT/actuator/health

[INFO] With the SOCKS proxy, do not open localhost; open http://$VM1_IP:$FRONTEND_PORT
EOF
