#!/usr/bin/env bash
set -euo pipefail

namespace="pollisense"

echo "Checking namespace"
kubectl get namespace "$namespace"

echo
echo "Pods"
kubectl get pods -n "$namespace" -o wide

echo
echo "Services"
kubectl get services -n "$namespace"

echo
echo "PVC"
kubectl get pvc -n "$namespace"

echo
echo "NetworkPolicies"
kubectl get networkpolicy -n "$namespace"

echo
echo "Waiting for rollouts"
for deployment in postgres pollisense-backend pollisense-simulator pollisense-frontend; do
  kubectl rollout status -n "$namespace" "deployment/$deployment" --timeout=120s
done

cat <<'EOF'

Backend health check:
  kubectl port-forward -n pollisense svc/pollisense-backend 8080:8080
  curl http://127.0.0.1:8080/actuator/health

Simulator logs:
  kubectl logs -n pollisense deployment/pollisense-simulator

API checks after backend port-forward:
  curl http://127.0.0.1:8080/api/records
  curl http://127.0.0.1:8080/api/alerts
  curl http://127.0.0.1:8080/api/summary

Frontend:
  kubectl port-forward -n pollisense svc/pollisense-frontend 8081:80
  Browse to http://127.0.0.1:8081
EOF
