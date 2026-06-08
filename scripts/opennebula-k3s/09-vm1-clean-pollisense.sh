#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env.local" ]] && source "$SCRIPT_DIR/.env.local"

NAMESPACE="${NAMESPACE:-pollisense}"
CONFIRM_DELETE="${CONFIRM_DELETE:-false}"
DELETE_IMAGE_TARS="${DELETE_IMAGE_TARS:-false}"
FULL_RESET="${FULL_RESET:-false}"
CONFIRM_FULL_RESET="${CONFIRM_FULL_RESET:-false}"
IMAGE_DIR="${IMAGE_DIR:-/tmp/pollisense-images}"

log() { printf '\n[INFO] %s\n' "$*"; }
warn() { printf '\n[WARN] %s\n' "$*" >&2; }
die() { printf '\n[ERROR] %s\n' "$*" >&2; exit 1; }
as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then "$@"; else sudo "$@"; fi
}

[[ "$CONFIRM_DELETE" == "true" ]] || die "Set CONFIRM_DELETE=true to delete namespace $NAMESPACE"

log "Deleting namespace $NAMESPACE only"
kubectl delete namespace "$NAMESPACE" --ignore-not-found

if [[ "$DELETE_IMAGE_TARS" == "true" ]]; then
  log "Deleting old local image tar files from $IMAGE_DIR"
  rm -f "$IMAGE_DIR"/pollisense-*.tar
fi

if [[ "$FULL_RESET" == "true" ]]; then
  warn "FULL_RESET=true requests removal of the k3s cluster from VM1."
  [[ "$CONFIRM_FULL_RESET" == "true" ]] || die "Set CONFIRM_FULL_RESET=true as a second confirmation for full reset"
  if [[ -x /usr/local/bin/k3s-uninstall.sh ]]; then
    as_root /usr/local/bin/k3s-uninstall.sh
  else
    warn "k3s uninstall script was not found at /usr/local/bin/k3s-uninstall.sh"
  fi
else
  log "Full k3s reset was not requested. The cluster remains installed."
fi
