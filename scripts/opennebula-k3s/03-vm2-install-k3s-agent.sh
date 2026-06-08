#!/usr/bin/env bash
# Run on VM2. Joins this VM as a k3s worker/agent.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env.local" ]] && source "$SCRIPT_DIR/.env.local"

VM1_IP="${VM1_IP:-172.16.100.2}"
K3S_TOKEN="${K3S_TOKEN:-}"

log() { printf '\n[INFO] %s\n' "$*"; }
die() { printf '\n[ERROR] %s\n' "$*" >&2; exit 1; }
as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then "$@"; else sudo "$@"; fi
}

[[ -n "$VM1_IP" ]] || die "VM1_IP is required"
[[ -n "$K3S_TOKEN" ]] || die "K3S_TOKEN is required. On VM1 run: sudo cat /var/lib/rancher/k3s/server/node-token"

log "Checking VM1 Kubernetes API reachability at $VM1_IP:6443"
nc -vz "$VM1_IP" 6443

if systemctl list-unit-files k3s-agent.service >/dev/null 2>&1; then
  log "k3s agent service already exists; ensuring it is started"
  as_root systemctl enable --now k3s-agent
else
  log "Installing k3s agent and joining VM1"
  curl -sfL https://get.k3s.io | K3S_URL="https://$VM1_IP:6443" K3S_TOKEN="$K3S_TOKEN" sh -
fi

log "k3s agent status"
as_root systemctl status k3s-agent --no-pager

cat <<'EOF'

[INFO] VM2 is a worker node. kubectl normally runs from VM1, not VM2.
Check the node from VM1 with:
  kubectl get nodes -o wide
EOF
