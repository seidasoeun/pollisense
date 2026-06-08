# PolliSense Design Decisions

These are short engineering notes for the deployment prototype.

## Backend

The backend is stateless. It keeps request handling, ingestion validation, alert generation, and dashboard APIs in the Java process, but persistent data lives in PostgreSQL. This lets the backend Deployment scale to more than one replica for the demo.

## PostgreSQL

PostgreSQL is stateful because it stores observations, device-health snapshots, alerts, stations, devices, and dashboard preferences. The prototype runs it as a single-replica Deployment because that is simple to demo and works with one PVC.

For production, PostgreSQL should move to a StatefulSet or a managed database. It would also need backups, restore testing, monitoring, and a storage plan with clear durability guarantees.

## PVC Storage

The `postgres-data` PVC uses `ReadWriteOnce` because one PostgreSQL pod should mount the database volume at a time. The manifest leaves `storageClassName` unset so Kubernetes uses the cluster default StorageClass.

On Minikube, the default StorageClass usually handles this automatically. On OpenNebula, the default StorageClass may map to the available datastore integration. If dynamic provisioning is not available, a manually created static PersistentVolume can satisfy the same claim.

## Secrets

The committed Secret manifest contains demo values so the repository can be applied directly during a course demo. Real deployments should generate secrets per environment and should not commit secret values to Git. The helper script in `scripts/create-k8s-secrets.sh` supports that path.

## OpenNebula

The baseline OpenNebula role is static provisioning. VMs are created from templates, Kubernetes is installed on them, and the PolliSense manifests run on that cluster.

Dynamic OpenNebula integration would mean provisioning or removing Kubernetes worker VMs based on demand. That is future work for this prototype. It would require a node autoscaling mechanism, VM templates, credentials, quotas, and a tested way for new VMs to join the cluster.

## NetworkPolicy

The manifests define default-deny ingress and egress with explicit allowed paths between frontend, simulator, backend, PostgreSQL, and DNS. Actual enforcement depends on the Kubernetes CNI plugin. Some local Minikube setups do not enforce NetworkPolicy.
