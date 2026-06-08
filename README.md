# PolliSense

PolliSense is a Fog and Cloud Computing course project that demonstrates a version 1 deployment for modular pollinator monitoring. The simulator represents monitoring stations and sends processed JSON records to a backend API; the backend stores observations, device health, alerts, stations, devices, and dashboard preferences in PostgreSQL; the frontend reads backend APIs and shows the dashboard.

## Architecture

```text
pollisense-simulator -> pollisense-backend ingestion API -> PostgreSQL
                     -> backend read APIs -> pollisense-frontend dashboard
```

## Components

- `pollisense-simulator`: Java 21 Spring Boot scheduled simulator that sends records with `X-Ingestion-Token`.
- `pollisense-backend`: Java 21 Spring Boot API for ingestion, persistence, alerts, dashboard data, preferences, and health probes.
- `pollisense-frontend`: React dashboard served by nginx in the container image.
- `k8s/`: Kubernetes manifests for namespace, secrets, PostgreSQL storage, deployments, services, probes, resource limits, security contexts, and network policies.
- `scripts/opennebula-k3s/`: VM scripts for the two-VM OpenNebula/k3s deployment.

## Quick Start with Docker Compose

```bash
docker compose up --build
```

Open the dashboard:

```text
http://localhost:8081
```

Useful checks:

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/records
curl http://localhost:8080/api/alerts
curl http://localhost:8080/api/summary
```

Stop the local stack:

```bash
docker compose down
```

Docker Compose uses demo credentials and `local-demo-token`. They are for local/course use only.

## Kubernetes and OpenNebula

For the version 1 OpenNebula deployment, VM1 is the k3s server/control-plane and VM2 is a k3s worker. In the lab run, VM1 used `172.16.100.2` and VM2 used `172.16.100.3`. Images are built on VM1 and copied/imported to VM2 because this version does not use a registry.

Main entry points:

- [Two-VM OpenNebula/k3s deployment guide](docs/deploy-two-vm-opennebula-k3s.md)
- [OpenNebula/k3s script index](scripts/opennebula-k3s/README.md)
- [Demo runbook](docs/demo-runbook.md)
- [Design decisions](docs/design-decisions.md)
- [Final report outline](docs/final-report-outline.md)

Other deployment notes:

- [Single-server Minikube deployment](docs/deploy-single-server.md)
- [Final OpenNebula deployment notes](docs/deploy-final-opennebula.md)

## Kubernetes Features Used

- `Secret` for PostgreSQL credentials and the ingestion token.
- `PersistentVolumeClaim` for PostgreSQL data with `ReadWriteOnce` and the cluster default StorageClass.
- `Deployment` and `Service` for PostgreSQL, backend, simulator, and frontend.
- Readiness and liveness probes for the backend.
- Resource requests and limits for all application pods.
- Container security contexts with non-root users, no privilege escalation, dropped capabilities, and runtime default seccomp where supported.
- `NetworkPolicy` default-deny rules plus explicit frontend-to-backend, simulator-to-backend, backend-to-PostgreSQL, and DNS egress paths. Enforcement depends on the cluster CNI.
- Optional backend HPA manifest in `k8s/optional/` when metrics-server is available.

## Demo Credentials

The committed Kubernetes Secret manifest contains demo values so the project can be applied directly in the course environment. For any real deployment, generate per-environment secrets instead:

```bash
POSTGRES_DB=pollisense \
POSTGRES_USER=pollisense \
POSTGRES_PASSWORD='<set-a-real-password>' \
INGESTION_TOKEN='<set-a-real-token>' \
bash scripts/create-k8s-secrets.sh
```

For a throwaway local demo, the defaults can be generated explicitly:

```bash
ALLOW_DEMO_SECRETS=true bash scripts/create-k8s-secrets.sh
```
