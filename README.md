# PolliSense

PolliSense is a cloud-native course prototype for modular pollinator monitoring. It demonstrates a fog-to-cloud flow:

```text
simulator -> backend ingestion API -> PostgreSQL -> backend read APIs -> frontend dashboard
```

The simulator represents edge monitoring stations. It sends processed JSON records, not raw images or video. Each record combines ecological data, such as pollinator count, temperature, humidity, and light level, with device-health data, such as battery level, connectivity, signal quality, and module status.

## Components

- `pollisense-frontend`: React researcher dashboard.
- `pollisense-backend`: Java 21 Spring Boot API with PostgreSQL persistence, ingestion security, dashboard APIs, researcher preferences, alerts, and actuator health probes.
- `pollisense-simulator`: Java 21 Spring Boot scheduled simulator that sends records to the backend.
- `k8s`: Kubernetes manifests for namespace, secrets, PVC-backed PostgreSQL, deployments, services, probes, scaling, and network policies.

## Local Docker Demo

Build and run the full local stack:

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
curl http://localhost:8080/api/stations
curl http://localhost:8080/api/records
curl http://localhost:8080/api/alerts
```

The simulator sends a record every few seconds using the `X-Ingestion-Token` header. The backend compares it with the `INGESTION_TOKEN` environment variable.

## Kubernetes Demo

Build images for the cluster runtime you use. For a local cluster such as Minikube:

```bash
docker build -t pollisense-backend:latest ./pollisense-backend
docker build -t pollisense-simulator:latest ./pollisense-simulator
docker build -t pollisense-frontend:latest ./pollisense-frontend
kubectl apply -f k8s/
kubectl get pods -n pollisense
```

Port-forward the frontend:

```bash
kubectl port-forward -n pollisense svc/pollisense-frontend 8081:80
```

Optionally port-forward the backend API:

```bash
kubectl port-forward -n pollisense svc/pollisense-backend 8080:8080
```

Scale the backend Deployment:

```bash
kubectl scale deployment pollisense-backend -n pollisense --replicas=3
kubectl get pods -n pollisense -l app=pollisense-backend
```

Check persistence by deleting the PostgreSQL pod and confirming records remain after the Deployment recreates it:

```bash
kubectl delete pod -n pollisense -l app=postgres
kubectl get pods -n pollisense
kubectl port-forward -n pollisense svc/pollisense-backend 8080:8080
curl http://localhost:8080/api/records
```

## Kubernetes Features Used

- `Secret`: `postgres-secret` stores database credentials, and `ingestion-secret` stores the ingestion token used by the simulator and backend.
- `PersistentVolumeClaim`: `postgres-data` requests `2Gi` of `ReadWriteOnce` storage for PostgreSQL. The manifest intentionally leaves `storageClassName` unset so the cluster default StorageClass is used. On OpenNebula, this can map to the storage class backed by the selected OpenNebula datastore or be changed to a static class if the infrastructure is prepared manually.
- `Deployment`: backend replicas can be scaled horizontally because the application is stateless and stores records, preferences, alerts, and device-health snapshots in PostgreSQL.
- `Readiness/liveness probes`: backend probes use `/actuator/health/readiness` and `/actuator/health/liveness`.
- `NetworkPolicy`: the namespace starts with default-deny ingress and egress. Policies then allow only frontend to backend, simulator to backend, backend to PostgreSQL, and DNS egress.
- `SecurityContext`: application containers run as non-root images and disable privilege escalation.

## OpenNebula / IaaS Plan

OpenNebula is the IaaS layer for the final deployment. The practical plan is:

1. Provision a small set of Linux VMs from OpenNebula templates.
2. Install or bootstrap Kubernetes on those VMs, for example one control-plane VM and one or more worker VMs for the demo.
3. Build and publish the three application images to a registry reachable from the VMs, or load them directly for a local cluster demonstration.
4. Apply the manifests in `k8s/` to run PostgreSQL, backend, simulator, and frontend.
5. Use the Kubernetes PVC with the cluster default storage class. If OpenNebula storage is configured dynamically, the PVC can be provisioned by the storage integration. If the course environment is static, a pre-created PersistentVolume can satisfy the same claim.

This keeps OpenNebula responsible for virtual compute and storage resources, while Kubernetes handles container scheduling, service discovery, scaling, secrets, network isolation, probes, and persistent volume attachment.

## Alert Rules

The backend generates alerts when:

- `batteryLevel < 20`
- `connectivityStatus` is `WEAK` or `OFFLINE`
- `signalQuality < 30`
- `moduleStatus` is not `OK`

## NetworkPolicy Checks

After applying `k8s/`, direct frontend or simulator access to PostgreSQL should be blocked. A quick check can be done by starting a temporary shell in the namespace with labels matching the frontend or simulator and trying to connect to `postgres:5432`; the connection should fail unless the pod is the backend.
