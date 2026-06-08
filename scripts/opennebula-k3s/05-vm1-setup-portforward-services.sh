#!/usr/bin/env bash
# Run on VM1. Creates systemd port-forward services bound to the VM1 private IP.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env.local" ]] && source "$SCRIPT_DIR/.env.local"

VM1_IP="${VM1_IP:-172.16.100.2}"
NAMESPACE="${NAMESPACE:-pollisense}"
FRONTEND_PORT="${FRONTEND_PORT:-9999}"
BACKEND_PORT="${BACKEND_PORT:-8080}"

log() { printf '\n[INFO] %s\n' "$*"; }
die() { printf '\n[ERROR] %s\n' "$*" >&2; exit 1; }
as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then "$@"; else sudo "$@"; fi
}

if [[ -x /usr/local/bin/kubectl ]]; then
  KUBECTL_BIN=/usr/local/bin/kubectl
else
  KUBECTL_BIN="$(command -v kubectl || true)"
fi
[[ -n "$KUBECTL_BIN" ]] || die "kubectl was not found"

create_service() {
  local name="$1"
  local service="$2"
  local port_map="$3"
  local unit="/etc/systemd/system/$name.service"

  log "Writing $unit"
  as_root tee "$unit" >/dev/null <<EOF
[Unit]
Description=PolliSense $name
After=k3s.service network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
Environment=KUBECONFIG=/etc/rancher/k3s/k3s.yaml
ExecStart=$KUBECTL_BIN port-forward -n $NAMESPACE svc/$service $port_map --address $VM1_IP
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
}

create_service pollisense-frontend-portforward pollisense-frontend "$FRONTEND_PORT:80"
create_service pollisense-backend-portforward pollisense-backend "$BACKEND_PORT:8080"

log "Enabling and starting port-forward services"
as_root systemctl daemon-reload
as_root systemctl enable --now pollisense-frontend-portforward.service
as_root systemctl enable --now pollisense-backend-portforward.service

log "Service status"
as_root systemctl status pollisense-frontend-portforward.service --no-pager || true
as_root systemctl status pollisense-backend-portforward.service --no-pager || true

log "Listening ports"
as_root sh -c "ss -lntp | grep -E ':($FRONTEND_PORT|$BACKEND_PORT)\\b'" || true

cat <<EOF

[INFO] Browser/API URLs through the Windows SOCKS proxy:
  http://$VM1_IP:$FRONTEND_PORT
  http://$VM1_IP:$BACKEND_PORT/actuator/health
EOF
