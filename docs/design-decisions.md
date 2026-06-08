# Design Decisions

These notes describe the version 1 deployment choices. They are not production claims.

## Backend

- The backend is stateless.
- It validates ingestion tokens, accepts records, generates alerts, and serves dashboard APIs.
- Persistent state is stored in PostgreSQL, so backend pods can be restarted or scaled without losing records.
- This is why the backend Deployment can be scaled during the demo.

## PostgreSQL

- PostgreSQL is stateful.
- It stores observations, device-health snapshots, alerts, stations, devices, and dashboard preferences.
- In version 1 it runs as a single replica.
- The single-replica choice keeps the demo simple and matches the one-PVC setup.
- The limitation is that PostgreSQL itself is not highly available.

A production version would use a managed database or a Kubernetes `StatefulSet` with a tested storage design. It would also need backup/restore, monitoring, and regular recovery testing.

## PVC Storage

- The `postgres-data` PVC uses `ReadWriteOnce`.
- `ReadWriteOnce` fits a single PostgreSQL pod because only one pod should mount the database volume for writing.
- The manifest leaves `storageClassName` unset.
- Kubernetes therefore uses the cluster default StorageClass.
- On OpenNebula, this depends on the storage integration available in the lab. If dynamic provisioning is not available, a static PersistentVolume can satisfy the same claim.

## Secrets

- The committed Kubernetes Secret manifest contains demo values for reproducibility.
- Real deployments should generate secrets per environment.
- A production version should use a real secret manager or platform secret integration instead of committing secret values.

## OpenNebula

- In our version 1 deployment, OpenNebula provisioning is static.
- VM1 is created as the k3s server/control-plane.
- VM2 is created as the k3s worker/agent.
- Kubernetes schedules the containers after the VMs already exist.

Dynamic OpenNebula autoscaling is future work. It would require worker VM templates, credentials, quotas, a node join path, and safe node removal when load drops.

## NetworkPolicy

- The manifests include default-deny ingress and egress policies.
- Additional policies allow the expected paths: frontend to backend, simulator to backend, backend to PostgreSQL, and DNS egress.
- NetworkPolicy enforcement depends on the Kubernetes CNI.
- Some local clusters or default k3s setups may create the objects but not enforce them unless a compatible CNI is installed.
