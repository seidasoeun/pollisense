#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env.local" ]] && source "$SCRIPT_DIR/.env.local"

VM1_IP="${VM1_IP:-172.16.100.2}"
NAMESPACE="${NAMESPACE:-pollisense}"

log() { printf '\n[INFO] %s\n' "$*"; }
warn() { printf '\n[WARN] %s\n' "$*" >&2; }
die() { printf '\n[ERROR] %s\n' "$*" >&2; exit 1; }
as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then "$@"; else sudo "$@"; fi
}

require_dns() {
  local host="$1"
  getent hosts "$host" >/dev/null 2>&1 || die "DNS cannot resolve $host"
}

log "Checking DNS for required hosts"
require_dns archive.ubuntu.com
require_dns download.docker.com
require_dns get.k3s.io

log "Installing Docker from the official Docker apt repository"
as_root apt-get update
as_root apt-get install -y ca-certificates curl gnupg lsb-release
as_root install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /tmp/docker.asc
as_root rm -f /etc/apt/keyrings/docker.gpg
as_root gpg --dearmor -o /etc/apt/keyrings/docker.gpg /tmp/docker.asc
as_root chmod a+r /etc/apt/keyrings/docker.gpg
. /etc/os-release
arch="$(dpkg --print-architecture)"
codename="${VERSION_CODENAME:-$(lsb_release -cs)}"
printf 'deb [arch=%s signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu %s stable\n' "$arch" "$codename" |
  as_root tee /etc/apt/sources.list.d/docker.list >/dev/null
as_root apt-get update
as_root apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
as_root systemctl enable --now docker

if [[ "$(id -u)" -ne 0 ]]; then
  log "Adding current user to docker group. Log out and back in if docker commands need group refresh."
  as_root usermod -aG docker "$USER"
fi

if command -v k3s >/dev/null 2>&1; then
  log "k3s is already installed"
else
  log "Installing k3s server on VM1"
  curl -sfL https://get.k3s.io | sh -
fi

log "Waiting for k3s API"
as_root systemctl enable --now k3s
for _ in {1..60}; do
  if as_root k3s kubectl get nodes >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
as_root k3s kubectl get nodes >/dev/null 2>&1 || die "k3s API did not become ready"

log "Configuring kubeconfig for the current user"
mkdir -p "$HOME/.kube"
as_root cp /etc/rancher/k3s/k3s.yaml "$HOME/.kube/config"
as_root chown "$(id -u):$(id -g)" "$HOME/.kube/config"
chmod 600 "$HOME/.kube/config"
if command -v kubectl >/dev/null 2>&1; then
  KUBECTL=(kubectl)
elif [[ -x /usr/local/bin/kubectl ]]; then
  KUBECTL=(/usr/local/bin/kubectl)
else
  warn "kubectl was not found in PATH. Falling back to 'sudo k3s kubectl'."
  KUBECTL=(as_root k3s kubectl)
fi

log "Verification"
docker version
docker compose version
"${KUBECTL[@]}" get nodes -o wide
"${KUBECTL[@]}" get storageclass

cat <<EOF

[INFO] k3s node token command for joining VM2:
  sudo cat /var/lib/rancher/k3s/server/node-token

Use that token as K3S_TOKEN on VM2 when running:
  bash scripts/opennebula-k3s/03-vm2-install-k3s-agent.sh
EOF
