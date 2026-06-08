#!/usr/bin/env bash
set -euo pipefail

VM_HOSTNAME="${VM_HOSTNAME:-pollisense-vm}"
DEBUG_PASS="${DEBUG_PASS:-debug}"

log() { printf '\n[INFO] %s\n' "$*"; }
warn() { printf '\n[WARN] %s\n' "$*" >&2; }
die() { printf '\n[ERROR] %s\n' "$*" >&2; exit 1; }
as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then "$@"; else sudo "$@"; fi
}

log "Configuring hostname: $VM_HOSTNAME"
as_root hostnamectl set-hostname "$VM_HOSTNAME"

log "Updating /etc/hosts so sudo can resolve the VM hostname"
if ! grep -Eq "127\.0\.1\.1[[:space:]].*\b${VM_HOSTNAME}\b" /etc/hosts; then
  printf '127.0.1.1 %s localhost.localdomain\n' "$VM_HOSTNAME" | as_root tee -a /etc/hosts >/dev/null
fi

warn "Enabling root password login is only for isolated course lab VMs."
log "Setting temporary root password for lab debugging"
printf 'root:%s\n' "$DEBUG_PASS" | as_root chpasswd
as_root mkdir -p /etc/ssh/sshd_config.d
as_root tee /etc/ssh/sshd_config.d/99-pollisense-lab.conf >/dev/null <<'EOF'
# Course lab only. Do not use this setting on production systems.
PermitRootLogin yes
PasswordAuthentication yes
EOF
if systemctl list-unit-files ssh.service >/dev/null 2>&1; then
  as_root systemctl restart ssh || true
elif systemctl list-unit-files sshd.service >/dev/null 2>&1; then
  as_root systemctl restart sshd || true
fi

log "Selecting a working DNS resolver"
dns_candidates=(168.63.129.16 1.1.1.1 8.8.8.8 9.9.9.9)
selected_dns=""
for dns in "${dns_candidates[@]}"; do
  log "Trying DNS resolver $dns"
  printf 'nameserver %s\noptions timeout:2 attempts:2\n' "$dns" | as_root tee /etc/resolv.conf >/dev/null
  if getent hosts archive.ubuntu.com >/dev/null 2>&1; then
    selected_dns="$dns"
    break
  fi
done
[[ -n "$selected_dns" ]] || die "Could not resolve archive.ubuntu.com with the tested DNS resolvers"
log "Using DNS resolver $selected_dns"

log "Network information"
ip addr || true
ip route || true
cat /etc/resolv.conf || true

log "Updating apt package metadata"
as_root apt-get update

log "Installing basic VM tools"
as_root apt-get install -y \
  ca-certificates curl wget git gnupg lsb-release iproute2 net-tools dnsutils \
  netcat-openbsd socat make openssl tar gzip jq

log "Bootstrap complete. Docker, k3s, nginx, and PolliSense were not installed by this script."
