# PolliSense Demo and Evaluation Notes

This file is a concise guide for the final Fog and Cloud Computing demo. It maps the implementation to the course concepts and gives exact commands for the evaluation sequence.

## Course Concept Mapping

- Fog/edge concept: `pollisense-simulator` represents edge monitoring stations. It periodically sends processed JSON records instead of raw images or raw sensor streams.
- Cloud/backend concept: `pollisense-backend` ingests records, stores observations and device-health snapshots in PostgreSQL, exposes dashboard APIs, and generates alerts.
- IaaS: OpenNebula provides the virtual machines that host the Kubernetes cluster.
- PaaS/cloud-native layer: Docker images run on Kubernetes Deployments and communicate through Kubernetes Services.
- Persistence: PostgreSQL data is stored through a Kubernetes `PersistentVolumeClaim`.
- Security: Kubernetes `Secret`, `NetworkPolicy`, and non-root container security contexts are used.

## OpenNebula / IaaS Role

The baseline deployment is static provisioning:

- `vm1`: Kubernetes control-plane VM, created from an OpenNebula Ubuntu template.
- `vm2`: Kubernetes worker VM, created from an OpenNebula Ubuntu template.

Kubernetes runs on top of these VMs. Dynamic OpenNebula node provisioning or autoscaling is useful future work, but it is not required for this prototype.

## Docker Image Design

- Backend image: Maven/JDK build stage, Java 21 JRE runtime stage, numeric non-root UID `10001`.
- Simulator image: Maven/JDK build stage, Java 21 JRE runtime stage, numeric non-root UID `10001`.
- Frontend image: Node build stage, unprivileged nginx runtime stage.

The runtime images are smaller and cleaner because Maven, Node build tools, and source files remain in the build stages.

## Kubernetes Resources

The `k8s/` directory contains:

- `Namespace`: `pollisense`
- `Secret`: `postgres-secret`, `ingestion-secret`
- `PersistentVolumeClaim`: `postgres-data`
- PostgreSQL `Deployment` and `Service`
- Backend `Deployment` and `Service`
- Simulator `Deployment`
- Frontend `Deployment` and `Service`
- `NetworkPolicy` resources for default-deny and required allowed paths

PostgreSQL is exposed only as a `ClusterIP` Service inside the cluster.

## PostgreSQL PVC Storage Choice

The PVC requests `2Gi` with `ReadWriteOnce` and leaves `storageClassName` unset. This uses the cluster default StorageClass. In an OpenNebula-based course environment, this may be backed by default VM/cluster storage or by a configured OpenNebula datastore integration. A static PersistentVolume can also be created manually if the cluster does not provide dynamic provisioning.

## Security Mechanisms

- `postgres-secret`: database name, username, and password.
- `ingestion-secret`: token shared by simulator and backend.
- Backend requires `X-Ingestion-Token` for `POST /api/ingest`.
- NetworkPolicy starts from default-deny ingress and egress.
- Allowed paths:
  - frontend to backend on TCP `8080`
  - simulator to backend on TCP `8080`
  - backend to PostgreSQL on TCP `5432`
  - DNS egress on TCP/UDP `53`
- Application containers run as non-root and disable privilege escalation.

## Local Demo Commands

```bash
docker compose up --build
```

Open:

```text
http://localhost:8081
```

Check backend health and data:

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/health/readiness
curl http://localhost:8080/actuator/health/liveness
curl http://localhost:8080/api/stations
curl http://localhost:8080/api/devices
curl http://localhost:8080/api/records
curl http://localhost:8080/api/device-health
curl http://localhost:8080/api/alerts
curl http://localhost:8080/api/summary
```

Manual ingestion token check:

```bash
curl -i -X POST http://localhost:8080/api/ingest ^
  -H "Content-Type: application/json" ^
  -d "{\"timestamp\":\"2026-05-30T12:00:00Z\",\"stationId\":\"station-meadow-01\",\"deviceId\":\"ps-001\",\"targetGroup\":\"HONEYBEE\",\"pollinatorCount\":12,\"confidence\":0.82,\"temperature\":21.4,\"humidity\":52.1,\"lightLevel\":680,\"batteryLevel\":12,\"connectivityStatus\":\"OFFLINE\",\"signalQuality\":18,\"moduleStatus\":\"ATTENTION\"}"
```

Expected: `401 Unauthorized`.

```bash
curl -i -X POST http://localhost:8080/api/ingest ^
  -H "Content-Type: application/json" ^
  -H "X-Ingestion-Token: local-demo-token" ^
  -d "{\"timestamp\":\"2026-05-30T12:00:00Z\",\"stationId\":\"station-meadow-01\",\"deviceId\":\"ps-001\",\"targetGroup\":\"HONEYBEE\",\"pollinatorCount\":12,\"confidence\":0.82,\"temperature\":21.4,\"humidity\":52.1,\"lightLevel\":680,\"batteryLevel\":12,\"connectivityStatus\":\"OFFLINE\",\"signalQuality\":18,\"moduleStatus\":\"ATTENTION\"}"
```

Expected: `201 Created`, followed by alerts for low battery, offline connectivity, weak signal, and module attention.

## Kubernetes Demo Commands

Build images:

```bash
docker build -t pollisense-backend:latest ./pollisense-backend
docker build -t pollisense-simulator:latest ./pollisense-simulator
docker build -t pollisense-frontend:latest ./pollisense-frontend
```

Apply manifests:

```bash
kubectl apply -f k8s/
kubectl get pods -n pollisense
kubectl get svc,pvc -n pollisense
```

Port-forward frontend and backend:

```bash
kubectl port-forward -n pollisense svc/pollisense-frontend 8081:80
kubectl port-forward -n pollisense svc/pollisense-backend 8080:8080
```

Functional check:

```bash
kubectl logs -n pollisense deployment/pollisense-simulator
curl http://localhost:8080/api/records
curl http://localhost:8080/api/alerts
```

Persistence check:

```bash
curl http://localhost:8080/api/records
kubectl delete pod -n pollisense -l app=postgres
kubectl rollout status -n pollisense deployment/postgres
curl http://localhost:8080/api/records
```

Scaling check:

```bash
kubectl scale deployment pollisense-backend -n pollisense --replicas=3
kubectl get pods -n pollisense -l app=pollisense-backend
curl http://localhost:8080/actuator/health
```

NetworkPolicy check:

```bash
kubectl run frontend-net-test -n pollisense --rm -it --restart=Never --image=busybox:1.36 --labels=app=pollisense-frontend -- sh
nc -vz pollisense-backend 8080
nc -vz postgres 5432
```

Expected: backend connection succeeds, PostgreSQL connection fails.

```bash
kubectl run simulator-net-test -n pollisense --rm -it --restart=Never --image=busybox:1.36 --labels=app=pollisense-simulator -- sh
nc -vz pollisense-backend 8080
nc -vz postgres 5432
nc -vz pollisense-frontend 80
```

Expected: backend connection succeeds, PostgreSQL and frontend connections fail.

```bash
kubectl run backend-net-test -n pollisense --rm -it --restart=Never --image=busybox:1.36 --labels=app=pollisense-backend -- sh
nc -vz postgres 5432
```

Expected: PostgreSQL connection succeeds.
