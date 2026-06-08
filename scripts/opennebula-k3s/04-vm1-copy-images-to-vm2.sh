#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env.local" ]] && source "$SCRIPT_DIR/.env.local"

VM2_IP="${VM2_IP:-172.16.100.3}"
SSH_USER="${SSH_USER:-root}"
IMAGE_DIR="${IMAGE_DIR:-/tmp/pollisense-images}"

log() { printf '\n[INFO] %s\n' "$*"; }
die() { printf '\n[ERROR] %s\n' "$*" >&2; exit 1; }

[[ -n "$VM2_IP" ]] || die "VM2_IP is required"

log "Local image names are not pulled from a registry, so every Kubernetes node needs the images."
mkdir -p "$IMAGE_DIR"

images=(pollisense-backend:latest pollisense-simulator:latest pollisense-frontend:latest)
for image in "${images[@]}"; do
  tar_name="${image/:/-}.tar"
  log "Saving $image"
  docker save "$image" -o "$IMAGE_DIR/$tar_name"
done

log "Copying image tar files to VM2 at $SSH_USER@$VM2_IP"
ssh "$SSH_USER@$VM2_IP" "mkdir -p '$IMAGE_DIR'"
scp "$IMAGE_DIR"/*.tar "$SSH_USER@$VM2_IP:$IMAGE_DIR/"

log "Importing images into VM2 k3s containerd"
for image in "${images[@]}"; do
  tar_name="${image/:/-}.tar"
  ssh "$SSH_USER@$VM2_IP" "sudo k3s ctr images import '$IMAGE_DIR/$tar_name'"
done

log "Verifying PolliSense images on VM2"
ssh "$SSH_USER@$VM2_IP" "sudo k3s ctr images list | grep pollisense"

log "Image copy/import complete"
