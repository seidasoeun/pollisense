# PolliSense Final OpenNebula Deployment Guide

This guide describes the intended final deployment for PolliSense using OpenNebula-provisioned Linux VMs and Kubernetes.

It is written for the final Fog and Cloud Computing course demo and report. Commands are generic where the exact OpenNebula course environment may differ.

## High-Level Architecture

```text
OpenNebula IaaS
  -> Linux VMs
  -> Kubernetes cluster
  -> Docker container workloads
  -> PolliSense application
```

PolliSense application flow:

```text
pollisense-simulator
  -> pollisense-backend ingestion API
  -> PostgreSQL with PersistentVolumeClaim
  -> pollisense-backend read APIs
  -> pollisense-frontend dashboard
```

Responsibilities:

- OpenNebula provisions Linux VMs, networking, CPU, memory, and disk.
- Kubernetes schedules and manages containers on those VMs.
- Docker images package each application component.
- PostgreSQL stores persistent state through a Kubernetes PVC.
- Frontend, backend, and simulator run as stateless workloads.
- Secrets, NetworkPolicy, probes, and security contexts provide the basic cloud-native operational model.

## Target VM Layout

Recommended final layout:

| VM | Role | Purpose |
| --- | --- | --- |
| `vm1` | Kubernetes control-plane | Kubernetes API server, cluster control components, and optional workloads |
| `vm2` | Kubernetes worker | Runs application workloads |

This layout is small enough for a course demo but still shows OpenNebula as the IaaS layer and Kubernetes as the orchestration layer.

The single-server Minikube deployment in `docs/deploy-single-server.md` is a practical fallback for demo preparation. The final architecture maps the same Kubernetes resources onto OpenNebula-provisioned VMs.

## OpenNebula Preparation

Exact OpenNebula steps depend on the course environment, templates, images, network names, and permissions. Use this as the checklist.

Create Ubuntu VM templates or instantiate VMs from existing Ubuntu templates.

Recommended minimum sizing for a small demo:

| VM | vCPU | RAM | Disk |
| --- | --- | --- | --- |
| `vm1` control-plane | 2 | 4 GiB | 20 GiB |
| `vm2` worker | 2 | 4 GiB | 20 GiB |

Larger VMs are helpful if image builds happen on the VMs.

Networking requirements:

- VMs can reach each other on the private network.
- Your Windows laptop can SSH to at least the control-plane VM.
- Kubernetes node, pod, and service networking are not blocked by firewall rules.
- You record VM public/private IPs for the final report and demo.

From your laptop, verify SSH access:

```powershell
ssh -p <SSH_PORT> <USER>@<VM1_IP>
ssh -p <SSH_PORT> <USER>@<VM2_IP>
```

On each VM, record the addresses:

```bash
hostname -I
ip addr
```

In the final report, include:

- OpenNebula VM names or IDs.
- VM roles.
- CPU/RAM/disk sizes.
- IP addresses used for cluster communication and SSH.

## Kubernetes Cluster Setup Options

There are several valid ways to create the Kubernetes cluster on the OpenNebula VMs.

Recommended path for this course demo: k3s.

k3s is a lightweight Kubernetes distribution. It is simpler to bootstrap than kubeadm and is usually enough for a two-VM final demo.

Alternative paths:

- kubeadm: closer to a standard Kubernetes setup, but more manual.
- k3s: simpler and recommended here unless the course requires kubeadm.
- Minikube single-node fallback: useful if time is limited or the multi-VM setup is blocked.

## Option A: Recommended k3s Setup

Run this on `vm1`:

```bash
curl -sfL https://get.k3s.io | sh -
```

Check the control-plane:

```bash
sudo k3s kubectl get nodes
```

Get the node token:

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

Record the private IP address of `vm1`:

```bash
hostname -I
```

Run this on `vm2`, replacing placeholders:

```bash
curl -sfL https://get.k3s.io | K3S_URL=https://<VM1_PRIVATE_IP>:6443 K3S_TOKEN=<K3S_NODE_TOKEN> sh -
```

Back on `vm1`, verify both nodes:

```bash
sudo k3s kubectl get nodes -o wide
```

To use normal `kubectl` as your user on `vm1`, copy the kubeconfig:

```bash
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown "$USER:$USER" ~/.kube/config
kubectl get nodes -o wide
```

If you access the Kubernetes API remotely from your laptop, you may need to adjust the kubeconfig server address and OpenNebula firewall rules. For the demo, it is simpler to run `kubectl` on `vm1` over SSH.

## Option B: kubeadm Setup

Use kubeadm if the course environment or professor expects a more standard Kubernetes bootstrap.

High-level steps:

1. Install container runtime, kubelet, kubeadm, and kubectl on both VMs.
2. Disable swap on both VMs.
3. Initialize the control-plane on `vm1`:

   ```bash
   sudo kubeadm init --pod-network-cidr=<POD_CIDR>
   ```

4. Configure kubeconfig for your user on `vm1`.
5. Install a CNI plugin that supports NetworkPolicy if you want to demonstrate policy enforcement.
6. Join `vm2` using the `kubeadm join` command printed by `kubeadm init`.
7. Verify:

   ```bash
   kubectl get nodes -o wide
   ```

Do not overpromise exact kubeadm commands in the report unless you used and recorded the exact environment.

## Option C: Single-Node Minikube Fallback

If the OpenNebula multi-VM cluster cannot be completed in time, use one OpenNebula VM with Minikube.

Follow:

```text
docs/deploy-single-server.md
```

This still shows:

- OpenNebula VM provisioning.
- Docker images.
- Kubernetes manifests.
- PostgreSQL PVC.
- Secrets, probes, security contexts, and NetworkPolicy resources.

The limitation is that it is a single-node cluster, so it does not demonstrate scheduling across multiple VMs.

## Server Preparation

On each VM, install basic tools:

```bash
sudo apt update
sudo apt install -y git curl ca-certificates
```

For k3s, Docker is not strictly required for running workloads because k3s uses containerd. Docker is still useful for building images on the VMs:

```bash
sudo apt install -y docker.io
sudo usermod -aG docker "$USER"
```

Log out and reconnect after adding your user to the Docker group.

## Container Image Strategy

The current manifests use:

```yaml
imagePullPolicy: IfNotPresent
```

for the three PolliSense application images. This means each node can use a local image if it is already present.

Image options:

1. Build images on each node.
2. Use a local or private registry reachable by the cluster.
3. Export image tar files and import them on each node.
4. Push images to a registry reachable by the OpenNebula VMs.

Recommended repeatable method for the final demo: use a registry reachable by the cluster.

Example image tags:

```text
<REGISTRY>/pollisense-backend:demo
<REGISTRY>/pollisense-simulator:demo
<REGISTRY>/pollisense-frontend:demo
```

Then update the image fields in the Kubernetes manifests or create a demo overlay. If you do this, document the exact image names in the report.

Simpler method for a small demo: build or import the images on every Kubernetes node.

For k3s, importing image tar files is often practical:

```bash
docker build -t pollisense-backend:latest ./pollisense-backend
docker build -t pollisense-simulator:latest ./pollisense-simulator
docker build -t pollisense-frontend:latest ./pollisense-frontend

docker save pollisense-backend:latest -o pollisense-backend.tar
docker save pollisense-simulator:latest -o pollisense-simulator.tar
docker save pollisense-frontend:latest -o pollisense-frontend.tar
```

Copy the tar files to each VM:

```bash
scp -P <SSH_PORT> pollisense-backend.tar pollisense-simulator.tar pollisense-frontend.tar <USER>@<VM_IP>:~
```

Import on each k3s node:

```bash
sudo k3s ctr images import pollisense-backend.tar
sudo k3s ctr images import pollisense-simulator.tar
sudo k3s ctr images import pollisense-frontend.tar
```

Verify:

```bash
sudo k3s ctr images list | grep pollisense
```

If you use containerd without k3s, use the appropriate `ctr` or `crictl` commands for that runtime.

## Clone the Repository

On the VM where you run `kubectl`:

```bash
git clone https://github.com/seidasoeun/pollisense.git
cd pollisense
```

## Kubernetes Deployment

Apply the manifests:

```bash
kubectl apply --dry-run=client -f k8s/
kubectl apply -f k8s/
```

Verify namespace:

```bash
kubectl get namespace pollisense
```

Verify all resources:

```bash
kubectl get all -n pollisense
```

Verify pods:

```bash
kubectl get pods -n pollisense -o wide
```

Verify services:

```bash
kubectl get svc -n pollisense
```

Verify PVC:

```bash
kubectl get pvc -n pollisense
```

Verify Secrets:

```bash
kubectl get secrets -n pollisense
```

Verify NetworkPolicies:

```bash
kubectl get networkpolicy -n pollisense
```

Wait for rollouts:

```bash
kubectl rollout status -n pollisense deployment/postgres
kubectl rollout status -n pollisense deployment/pollisense-backend
kubectl rollout status -n pollisense deployment/pollisense-frontend
kubectl rollout status -n pollisense deployment/pollisense-simulator
```

For a compact verification pass, run:

```bash
bash scripts/check-k8s-demo.sh
```

This helper checks the namespace, pods, services, PVC, NetworkPolicies, and rollouts. It also prints the backend and frontend commands to run next.

## Storage

The PostgreSQL manifest defines:

```text
PVC name: postgres-data
Size: 2Gi
Access mode: ReadWriteOnce
StorageClass: unset
```

Because `storageClassName` is unset, Kubernetes uses the cluster default StorageClass if one exists.

In an OpenNebula environment, that storage may map to:

- default VM or cluster storage,
- a course-provided Kubernetes StorageClass,
- an OpenNebula-backed volume integration,
- or a manually prepared static PersistentVolume.

Check available StorageClasses:

```bash
kubectl get storageclass
```

Check the claim:

```bash
kubectl describe pvc -n pollisense postgres-data
```

If dynamic provisioning is unavailable, create a static PersistentVolume adapted to your VM path or storage device. Example:

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-data-static
spec:
  capacity:
    storage: 2Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: /var/lib/pollisense/postgres
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
  namespace: pollisense
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: manual
  resources:
    requests:
      storage: 2Gi
```

This example is optional and adaptable. For a multi-node cluster, `hostPath` ties the volume to a specific node and is not ideal for production. For the course demo, it can be acceptable if you clearly explain the limitation.

## Security

PolliSense uses Kubernetes Secrets:

- `postgres-secret`: database name, user, and password.
- `ingestion-secret`: token used by the simulator and backend.

View Secret names without printing values:

```bash
kubectl get secrets -n pollisense
```

NetworkPolicy intent:

- default deny ingress and egress in the `pollisense` namespace.
- allow frontend to backend on TCP `8080`.
- allow simulator to backend on TCP `8080`.
- allow backend to PostgreSQL on TCP `5432`.
- allow DNS egress on TCP/UDP `53`.

Check:

```bash
kubectl get networkpolicy -n pollisense
kubectl describe networkpolicy -n pollisense default-deny
```

The backend, simulator, and frontend manifests also set container-level security contexts:

- run as non-root users.
- disable privilege escalation.

Check the manifests:

```bash
grep -R "securityContext\|runAsNonRoot\|allowPrivilegeEscalation" -n k8s/
```

NetworkPolicy enforcement depends on the Kubernetes CNI. If the selected CNI does not enforce NetworkPolicy, mention that in the report and show the manifests as the intended policy.

## Accessing the Dashboard

The frontend is a ClusterIP service. For a controlled demo, use `kubectl port-forward` and SSH tunneling instead of exposing a public LoadBalancer.

On `vm1`:

```bash
kubectl port-forward -n pollisense svc/pollisense-frontend 9999:80 --address <VM1_PRIVATE_IP>
```

From the laptop, use either local forwarding or SOCKS.

Local forwarding:

```powershell
ssh -L 127.0.0.1:9999:<VM1_PRIVATE_IP>:9999 -p <SSH_PORT> <USER>@<VM1_PUBLIC_IP>
```

Open:

```text
http://localhost:9999
```

SOCKS:

```powershell
ssh -D 127.0.0.1:8888 -p <SSH_PORT> <USER>@<VM1_PUBLIC_IP>
```

Configure browser SOCKS5 proxy:

```text
Host: 127.0.0.1
Port: 8888
```

Open:

```text
http://<VM1_PRIVATE_IP>:9999
```

## Backend API Checks

Port-forward backend:

```bash
kubectl port-forward -n pollisense svc/pollisense-backend 8080:8080 --address <VM1_PRIVATE_IP>
```

Check health:

```bash
curl http://<VM1_PRIVATE_IP>:8080/actuator/health
```

Check APIs:

```bash
curl http://<VM1_PRIVATE_IP>:8080/api/records
curl http://<VM1_PRIVATE_IP>:8080/api/alerts
curl http://<VM1_PRIVATE_IP>:8080/api/summary
```

If you use laptop local forwarding, replace `<VM1_PRIVATE_IP>` with `localhost` in the browser or curl command on the laptop.

## Final Demo Sequence

Use this sequence during the final demo.

Show OpenNebula VM infrastructure:

- Show `vm1` and `vm2`.
- Show CPU, RAM, disk, and IP addresses.
- Explain that OpenNebula is the IaaS layer.

Show Kubernetes nodes:

```bash
kubectl get nodes -o wide
```

Show deployed resources:

```bash
kubectl get all -n pollisense
```

Show persistence:

```bash
kubectl get pvc -n pollisense
```

Show Secrets:

```bash
kubectl get secrets -n pollisense
```

Show NetworkPolicies:

```bash
kubectl get networkpolicy -n pollisense
```

Open the dashboard:

```text
http://localhost:9999
```

or, with SOCKS:

```text
http://<VM1_PRIVATE_IP>:9999
```

Show simulator logs:

```bash
kubectl logs -n pollisense deployment/pollisense-simulator
```

Show backend health:

```bash
curl http://<VM1_PRIVATE_IP>:8080/actuator/health
```

Show records and alerts:

```bash
curl http://<VM1_PRIVATE_IP>:8080/api/records
curl http://<VM1_PRIVATE_IP>:8080/api/alerts
curl http://<VM1_PRIVATE_IP>:8080/api/summary
```

Show persistence test:

```bash
curl http://<VM1_PRIVATE_IP>:8080/api/records
kubectl delete pod -n pollisense -l app=postgres
kubectl rollout status -n pollisense deployment/postgres
curl http://<VM1_PRIVATE_IP>:8080/api/records
```

Optional backend scaling:

```bash
kubectl scale deployment pollisense-backend -n pollisense --replicas=3
kubectl get pods -n pollisense -l app=pollisense-backend -o wide
curl http://<VM1_PRIVATE_IP>:8080/actuator/health
kubectl scale deployment pollisense-backend -n pollisense --replicas=1
```

Keep scaling optional. The main demo should focus on functional flow, persistence, security resources, and dashboard behavior.

## Evidence to Save Before Writing

Save command output from the actual OpenNebula VM or Kubernetes host:

```bash
git status
git log --oneline -5
docker images | grep pollisense
kubectl get nodes -o wide
kubectl get all -n pollisense
kubectl get pvc -n pollisense
kubectl get secrets -n pollisense
kubectl get networkpolicy -n pollisense
kubectl logs -n pollisense deployment/pollisense-simulator --tail=50
curl http://127.0.0.1:8080/actuator/health
curl http://127.0.0.1:8080/api/records
curl http://127.0.0.1:8080/api/alerts
curl http://127.0.0.1:8080/api/summary
```

Take screenshots of:

- OpenNebula VM list or VM details.
- `kubectl get nodes -o wide`.
- `kubectl get all -n pollisense`.
- The dashboard after records and alerts appear.
- The persistence test before and after PostgreSQL pod recreation.

Only update the final report/proposal after these checks are captured. If NetworkPolicy is not enforced by the selected CNI, state that clearly and show the manifests as the intended policy.

## Report Explanation Text

You can adapt this text in the final report:

OpenNebula is used as the IaaS layer. It provisions the Linux virtual machines that provide compute, memory, storage, and networking for the deployment.

Kubernetes runs on top of the OpenNebula VMs and acts as the orchestration layer. It schedules the PolliSense containers, provides service discovery through Services, manages rollouts through Deployments, and attaches persistent storage through a PersistentVolumeClaim.

Docker packages each PolliSense component as a container image. The frontend is a React/Vite dashboard served by nginx. The backend is a Java Spring Boot API. The simulator is a Java Spring Boot process that periodically sends processed monitoring records.

PostgreSQL is the stateful component. It stores observations, alerts, preferences, and device-health data on a Kubernetes PVC so data can survive PostgreSQL pod recreation.

The backend is stateless because persistent data is stored in PostgreSQL. This means the backend Deployment can be scaled horizontally by increasing the replica count.

Kubernetes Secrets store the PostgreSQL credentials and ingestion token. NetworkPolicy defines the allowed communication paths between frontend, simulator, backend, PostgreSQL, and DNS. The application containers run as non-root users and disable privilege escalation.

Dynamic OpenNebula node provisioning or autoscaling is future work. The baseline deployment uses statically provisioned OpenNebula VMs and Kubernetes workloads, which is sufficient for the course prototype and final demo.

## Troubleshooting

### Nodes Not Ready

Check:

```bash
kubectl get nodes -o wide
kubectl describe node <NODE_NAME>
```

For k3s:

```bash
sudo systemctl status k3s
sudo systemctl status k3s-agent
```

Common causes:

- VM networking blocks node communication.
- k3s agent joined with the wrong control-plane IP or token.
- firewall rules block Kubernetes ports.
- VM resources are too small.

### Pods Pending

Check:

```bash
kubectl get pods -n pollisense
kubectl describe pod -n pollisense <POD_NAME>
```

Common causes:

- image not available on the node.
- PVC is not bound.
- node has insufficient CPU or memory.

### Images Not Found

Check pod events:

```bash
kubectl describe pod -n pollisense <POD_NAME>
```

Fix by using one image strategy consistently:

- push to a registry reachable by the cluster,
- import images on all nodes,
- or update manifests to point to the correct registry tags.

Remember that `imagePullPolicy: IfNotPresent` uses a local image only if the image exists on the node selected for the pod.

### PVC Pending

Check:

```bash
kubectl get pvc -n pollisense
kubectl describe pvc -n pollisense postgres-data
kubectl get storageclass
```

Fix options:

- configure a default StorageClass,
- set `storageClassName` to a valid class,
- or create a static PersistentVolume.

### NetworkPolicy Not Enforced

If blocked connections still succeed, check the CNI. Some Kubernetes networking setups do not enforce NetworkPolicy.

For the report:

- show that NetworkPolicy manifests exist,
- explain the intended allowed paths,
- state whether the selected CNI enforced the rules during the demo.

### Port-Forward Inaccessible

Check that the port-forward is still running:

```bash
kubectl port-forward -n pollisense svc/pollisense-frontend 9999:80 --address <VM1_PRIVATE_IP>
```

For local forwarding, check the laptop SSH command:

```powershell
ssh -L 127.0.0.1:9999:<VM1_PRIVATE_IP>:9999 -p <SSH_PORT> <USER>@<VM1_PUBLIC_IP>
```

For SOCKS, check browser proxy settings and open:

```text
http://<VM1_PRIVATE_IP>:9999
```

### Backend Cannot Connect to PostgreSQL

Check backend logs:

```bash
kubectl logs -n pollisense deployment/pollisense-backend
```

Check PostgreSQL:

```bash
kubectl get pods -n pollisense -l app=postgres
kubectl logs -n pollisense deployment/postgres
kubectl get svc -n pollisense postgres
kubectl get secret -n pollisense postgres-secret
```

Common causes:

- PostgreSQL pod is not ready.
- PVC is pending.
- Secret values do not match the backend environment.
- NetworkPolicy or CNI behavior blocks backend-to-PostgreSQL traffic.
