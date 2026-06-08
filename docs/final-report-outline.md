# Final Report Outline

This is an outline only. Fill it with evidence from the final demo run.

## Problem and Motivation

- Pollinator monitoring needs modular field stations and a backend that can collect processed observations.
- The course focus is the deployment model: fog/edge simulation, cloud backend, persistence, and Kubernetes operation on OpenNebula VMs.

## Architecture

- Flow: simulator -> backend ingestion API -> PostgreSQL -> backend read APIs -> frontend dashboard.
- Explain which component represents edge/fog and which components run in the cluster.

## Implementation

- Backend: Spring Boot APIs, ingestion token validation, alert generation, PostgreSQL persistence.
- Simulator: scheduled record generation and authenticated ingestion requests.
- Frontend: React dashboard served from the frontend container.

## Docker Image Design

- Backend and simulator use Java 21 multi-stage images.
- Frontend uses a Node build stage and nginx runtime image.
- Runtime containers use non-root users where configured.

## Kubernetes Resources

- Namespace, Secrets, PVC, Deployments, Services, probes, resource limits, security contexts, and NetworkPolicies.
- Backend scaling demonstration.
- PostgreSQL persistence through PVC.

## OpenNebula Deployment

- Static OpenNebula provisioning in version 1.
- VM1 as k3s server/control-plane.
- VM2 as k3s worker/agent.
- Images built on VM1 and copied/imported to VM2.
- SOCKS access through the main OpenNebula server.

## Security Mechanisms

- Ingestion token for simulator-to-backend writes.
- Kubernetes Secrets for credentials and token values.
- NetworkPolicy objects for expected service paths, with the CNI enforcement caveat.
- Container security contexts.

## Evaluation and Demo Evidence

- OpenNebula VM details.
- `kubectl get nodes -o wide`.
- `kubectl get all -n pollisense -o wide`.
- PVC status.
- Backend health, records, alerts, and summary responses.
- Simulator logs.
- Dashboard screenshot.
- Backend scaling output.
- PostgreSQL restart and records-after-restart evidence.

## Limitations and Future Work

- PostgreSQL is single-replica in version 1.
- OpenNebula provisioning is static.
- Images are copied manually instead of pulled from a registry.
- NetworkPolicy enforcement depends on the installed CNI.
- Future work: managed database or StatefulSet, backup/restore, registry, secret manager, and dynamic OpenNebula worker autoscaling.
