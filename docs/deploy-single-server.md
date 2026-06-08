# PolliSense Single-Server Minikube Deployment Guide

This guide deploys PolliSense on one Linux server or OpenNebula VM with Docker and a single-node Minikube Kubernetes cluster.

Use this guide for practical final demo preparation when you have one server and connect to it from a Windows laptop over SSH.

## Architecture

```text
Windows laptop
  -> SSH tunnel or SOCKS proxy
  -> Linux server / OpenNebula VM
  -> Minikube single-node Kubernetes cluster
  -> frontend nginx -> backend API -> PostgreSQL PVC
                         ^
                         |
                      simulator
```

PolliSense flow:

```text
simulator -> backend ingestion API -> PostgreSQL -> backend APIs -> frontend dashboard
```

Course concepts shown by this deployment:

- IaaS/OpenNebula: one Linux VM is provisioned through OpenNebula or another IaaS environment.
- Docker: backend, simulator, and frontend are built as container images.
- Kubernetes: namespace, Deployments, Services, Secrets, PVC, probes, and NetworkPolicy are applied from `k8s/`.
- Persistence: PostgreSQL stores data on the `postgres-data` PersistentVolumeClaim.
- Security: Kubernetes Secrets, NetworkPolicy, and non-root container security contexts are used.
- Scalability: the backend is stateless and can be scaled with Deployment replicas. This is optional for the main demo.
- Evaluation: the demo can show functional flow, persistence, security behavior, and the dashboard.

## Assumptions

- You have one Linux server or OpenNebula VM.
- You connect from a Windows laptop by SSH.
- Docker and Minikube run on the server.
- Kubernetes runs as a single-node Minikube cluster on the server.
- The dashboard is accessed from the laptop through SSH local port forwarding or an SSH SOCKS proxy.
- Replace placeholders such as `<SERVER_IP>`, `<SERVER_PRIVATE_IP>`, `<USER>`, and `<SSH_PORT>` with your real values.

## Server-First Checklist

Use this as the short path once the server exists:

```bash
git clone https://github.com/seidasoeun/pollisense.git
cd pollisense
# If you are validating a branch before merge:
# git fetch origin
# git switch polish/deployment-readiness

docker compose config
minikube status || minikube start --driver=docker
kubectl get nodes -o wide
kubectl get storageclass

eval $(minikube docker-env)
docker build -t pollisense-backend:latest ./pollisense-backend
docker build -t pollisense-simulator:latest ./pollisense-simulator
docker build -t pollisense-frontend:latest ./pollisense-frontend
docker images | grep pollisense

kubectl apply --dry-run=client -f k8s/
kubectl apply -f k8s/
bash scripts/check-k8s-demo.sh
```

Then port-forward the frontend and backend using the steps below.

## 1. Connect to the Server

From PowerShell on your Windows laptop:

```powershell
ssh -p <SSH_PORT> <USER>@<SERVER_IP>
```

After connecting, run all Linux commands on the server unless a step explicitly says to run it from the laptop.

## 2. Prepare the Server

Update package metadata:

```bash
sudo apt update
```

Install basic tools:

```bash
sudo apt install -y git curl ca-certificates gnupg
```

Install Docker if it is not already installed. One common Ubuntu path is:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Allow your user to run Docker without `sudo`:

```bash
sudo usermod -aG docker "$USER"
```

Log out and reconnect so the group change is active:

```bash
exit
ssh -p <SSH_PORT> <USER>@<SERVER_IP>
```

Verify Docker:

```bash
docker version
```

## 3. Install kubectl

If `kubectl` is already installed, skip this section.

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

## 4. Install Minikube

If `minikube` is already installed, skip this section.

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube version
```

## 5. Start Minikube

Start a single-node cluster with the Docker driver:

```bash
minikube start --driver=docker
```

If Minikube is already running, check it instead:

```bash
minikube status
```

Verify the node:

```bash
kubectl get nodes -o wide
```

Expected result: one node is shown with status `Ready`.

Check storage support:

```bash
kubectl get storageclass
```

Minikube usually provides a default StorageClass. The PostgreSQL PVC depends on a StorageClass or a manually created PersistentVolume.

## 6. Clone PolliSense

```bash
git clone https://github.com/seidasoeun/pollisense.git
cd pollisense
```

## 7. Build Images for Minikube

PolliSense Kubernetes manifests use local image names:

- `pollisense-backend:latest`
- `pollisense-simulator:latest`
- `pollisense-frontend:latest`

They also use `imagePullPolicy: IfNotPresent`, so Kubernetes can use an image that already exists in the node runtime.

For Minikube, run:

```bash
eval $(minikube docker-env)
```

This points your shell's Docker client at Minikube's Docker daemon. Without this step, `docker build` builds images into the server's normal Docker daemon, while the Minikube node cannot see them. That commonly causes `ImagePullBackOff`.

Build the three images:

```bash
docker build -t pollisense-backend:latest ./pollisense-backend
docker build -t pollisense-simulator:latest ./pollisense-simulator
docker build -t pollisense-frontend:latest ./pollisense-frontend
```

Verify:

```bash
docker images | grep pollisense
```

Expected result: all three local images are present with the `latest` tag. If they are missing after `kubectl apply`, the pods will usually show `ImagePullBackOff`.

## 8. Deploy Kubernetes Manifests

Run a client-side manifest check first:

```bash
kubectl apply --dry-run=client -f k8s/
```

Apply all manifests:

```bash
kubectl apply -f k8s/
```

Wait for rollouts:

```bash
kubectl rollout status -n pollisense deployment/postgres
kubectl rollout status -n pollisense deployment/pollisense-backend
kubectl rollout status -n pollisense deployment/pollisense-frontend
kubectl rollout status -n pollisense deployment/pollisense-simulator
```

Show the resources:

```bash
kubectl get pods -n pollisense
kubectl get all -n pollisense
```

Check services:

```bash
kubectl get svc -n pollisense
```

Check the PostgreSQL PVC:

```bash
kubectl get pvc -n pollisense
```

Check NetworkPolicies:

```bash
kubectl get networkpolicy -n pollisense
```

You can also run:

```bash
bash scripts/check-k8s-demo.sh
```

This prints the key resources, waits for rollouts, and shows the backend/frontend verification commands without printing secret values.

A healthy deployment should include:

- `postgres` pod running.
- `pollisense-backend` pod running and ready.
- `pollisense-simulator` pod running.
- `pollisense-frontend` pod running.
- `postgres-data` PVC bound.
- Several NetworkPolicies, including `default-deny`.

## 9. Dashboard Access Method A: SSH Local Port Forwarding

This is the recommended method because it is simple and uses normal laptop `localhost` URLs.

On the server, forward the Kubernetes frontend Service to the server loopback address:

```bash
kubectl port-forward -n pollisense svc/pollisense-frontend 9999:80
```

Leave this command running.

From a new PowerShell window on the laptop:

```powershell
ssh -L 127.0.0.1:9999:127.0.0.1:9999 -p <SSH_PORT> <USER>@<SERVER_IP>
```

Leave this SSH session running.

Open on the laptop:

```text
http://localhost:9999
```

This works because `ssh -L` maps laptop `localhost:9999` directly to server `localhost:9999`.

## 10. Dashboard Access Method B: SSH SOCKS Proxy

Use this method if your browser is already configured to browse through an SSH SOCKS proxy.

First, identify the server's private IP address:

```bash
hostname -I
```

Choose the address that is reachable from the server itself and, through the SOCKS proxy, from your laptop. This is the value for `<SERVER_PRIVATE_IP>`.

On the server, expose the frontend port-forward on that private IP:

```bash
kubectl port-forward -n pollisense svc/pollisense-frontend 9999:80 --address <SERVER_PRIVATE_IP>
```

Leave this command running.

From PowerShell on the laptop, open the SOCKS tunnel:

```powershell
ssh -D 127.0.0.1:8888 -p <SSH_PORT> <USER>@<SERVER_IP>
```

Leave this SSH session running.

Configure your browser SOCKS5 proxy:

```text
Host: 127.0.0.1
Port: 8888
SOCKS version: SOCKS5
```

Open in that browser:

```text
http://<SERVER_PRIVATE_IP>:9999
```

Why `http://localhost:9999` on the laptop does not work with `ssh -D`:

- `ssh -D` creates a SOCKS proxy, not a fixed port mapping.
- In the browser, `localhost` still means the laptop itself.
- The Kubernetes port-forward is running on the server.
- Therefore, with SOCKS you must open the server-side address, such as `http://<SERVER_PRIVATE_IP>:9999`, through the proxy.

## 11. Backend API Access

You can expose the backend API in the same two ways.

### Backend with Local Port Forwarding

On the server:

```bash
kubectl port-forward -n pollisense svc/pollisense-backend 8080:8080
```

From a new PowerShell window on the laptop:

```powershell
ssh -L 127.0.0.1:8080:127.0.0.1:8080 -p <SSH_PORT> <USER>@<SERVER_IP>
```

Open from the laptop:

```text
http://localhost:8080/actuator/health
```

### Backend with SOCKS Proxy

On the server:

```bash
kubectl port-forward -n pollisense svc/pollisense-backend 8080:8080 --address <SERVER_PRIVATE_IP>
```

Use the same SOCKS tunnel:

```powershell
ssh -D 127.0.0.1:8888 -p <SSH_PORT> <USER>@<SERVER_IP>
```

Open through the SOCKS-configured browser:

```text
http://<SERVER_PRIVATE_IP>:8080/actuator/health
```

Useful backend API checks:

```text
http://<SERVER_PRIVATE_IP>:8080/actuator/health
http://<SERVER_PRIVATE_IP>:8080/api/records
http://<SERVER_PRIVATE_IP>:8080/api/alerts
http://<SERVER_PRIVATE_IP>:8080/api/summary
```

If you use local forwarding instead of SOCKS, replace `http://<SERVER_PRIVATE_IP>:8080` with `http://localhost:8080`.

## 12. Demo Verification

Check that all pods are running:

```bash
kubectl get pods -n pollisense
```

Check backend health:

```bash
curl http://127.0.0.1:8080/actuator/health
```

Expected: status is `UP`.

Check records:

```bash
curl http://127.0.0.1:8080/api/records
```

Check alerts:

```bash
curl http://127.0.0.1:8080/api/alerts
```

Check summary:

```bash
curl http://127.0.0.1:8080/api/summary
```

Check simulator logs:

```bash
kubectl logs -n pollisense deployment/pollisense-simulator
```

During the demo, show:

- Dashboard loads in the browser.
- Records appear after the simulator runs.
- Alerts appear when generated from device-health or observation data.
- Refreshing the dashboard still works.
- Simulator logs show records being sent.
- Backend health endpoint returns `UP`.

Save these terminal outputs for the final report/proposal evidence:

```bash
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

Take screenshots of the dashboard after records appear, the OpenNebula VM view, and the Kubernetes resource overview.

## 13. Persistence Test

Expose the backend API first, using either local forwarding or SOCKS.

Check records before deleting PostgreSQL:

```bash
curl http://127.0.0.1:8080/api/records
```

Delete the PostgreSQL pod:

```bash
kubectl delete pod -n pollisense -l app=postgres
```

Wait for the Deployment to recreate it:

```bash
kubectl rollout status -n pollisense deployment/postgres
kubectl get pods -n pollisense
```

Check records again:

```bash
curl http://127.0.0.1:8080/api/records
```

Expected demo point: records should remain because PostgreSQL uses the `postgres-data` PVC.

## 14. Security and NetworkPolicy Test

The manifests define:

- default-deny ingress and egress for all pods in the `pollisense` namespace.
- frontend to backend on TCP `8080`.
- simulator to backend on TCP `8080`.
- backend to PostgreSQL on TCP `5432`.
- DNS egress on TCP/UDP `53`.

NetworkPolicy enforcement depends on the Minikube CNI. If your Minikube CNI does not enforce NetworkPolicy, the commands may not block traffic. If that happens, explain in the report that the manifests define the intended policy, but the local Minikube CNI did not enforce it.

### Frontend-like Pod

Run:

```bash
kubectl run frontend-net-test -n pollisense --rm -it --restart=Never --image=busybox:1.36 --labels=app=pollisense-frontend -- sh
```

Inside the shell:

```sh
nc -vz pollisense-backend 8080
nc -vz postgres 5432
```

Expected:

- Backend connection succeeds.
- PostgreSQL connection fails.

Exit:

```sh
exit
```

### Simulator-like Pod

Run:

```bash
kubectl run simulator-net-test -n pollisense --rm -it --restart=Never --image=busybox:1.36 --labels=app=pollisense-simulator -- sh
```

Inside the shell:

```sh
nc -vz pollisense-backend 8080
nc -vz postgres 5432
nc -vz pollisense-frontend 80
```

Expected:

- Backend connection succeeds.
- PostgreSQL connection fails.
- Frontend connection fails.

Exit:

```sh
exit
```

### Backend-like Pod

Run:

```bash
kubectl run backend-net-test -n pollisense --rm -it --restart=Never --image=busybox:1.36 --labels=app=pollisense-backend -- sh
```

Inside the shell:

```sh
nc -vz postgres 5432
```

Expected:

- PostgreSQL connection succeeds.

Exit:

```sh
exit
```

## 15. Optional Scaling Test

This is optional. It demonstrates that the backend is stateless and can run multiple replicas because persistent state is stored in PostgreSQL.

Scale backend to three replicas:

```bash
kubectl scale deployment pollisense-backend -n pollisense --replicas=3
kubectl get pods -n pollisense -l app=pollisense-backend
```

Check the dashboard and backend health:

```bash
curl http://127.0.0.1:8080/actuator/health
```

Open or refresh the dashboard.

Scale back to one replica:

```bash
kubectl scale deployment pollisense-backend -n pollisense --replicas=1
kubectl get pods -n pollisense -l app=pollisense-backend
```

Keep this optional in the demo. The core deployment plan is the functional flow, persistence, security resources, and dashboard.

## 16. Troubleshooting

### ImagePullBackOff

Likely cause: images were built into the server Docker daemon instead of the Minikube Docker daemon.

Fix:

```bash
eval $(minikube docker-env)
docker build -t pollisense-backend:latest ./pollisense-backend
docker build -t pollisense-simulator:latest ./pollisense-simulator
docker build -t pollisense-frontend:latest ./pollisense-frontend
kubectl rollout restart deployment -n pollisense pollisense-backend pollisense-simulator pollisense-frontend
```

### CrashLoopBackOff

Inspect logs and pod events:

```bash
kubectl logs -n pollisense deployment/pollisense-backend
kubectl logs -n pollisense deployment/pollisense-simulator
kubectl describe pod -n pollisense <POD_NAME>
```

Common causes include database connection problems, missing environment variables, or images built from old code.

### PVC Pending

Check storage:

```bash
kubectl get pvc -n pollisense
kubectl get storageclass
kubectl describe pvc -n pollisense postgres-data
```

If there is no default StorageClass, create or enable one for Minikube, or create a static PersistentVolume.

### Dashboard Not Reachable

Check:

```bash
kubectl get svc -n pollisense
kubectl get pods -n pollisense
```

For local forwarding:

- Confirm `kubectl port-forward` is still running on the server.
- Confirm `ssh -L` is still running on the laptop.
- Open `http://localhost:9999`.

For SOCKS:

- Confirm `kubectl port-forward` uses `--address <SERVER_PRIVATE_IP>`.
- Confirm `ssh -D 127.0.0.1:8888` is still running.
- Confirm the browser uses SOCKS5 host `127.0.0.1`, port `8888`.
- Open `http://<SERVER_PRIVATE_IP>:9999`, not laptop `localhost`.

### Backend API Empty

Wait for the simulator to send records, then check logs:

```bash
kubectl logs -n pollisense deployment/pollisense-simulator
kubectl logs -n pollisense deployment/pollisense-backend
```

Also check the API:

```bash
curl http://127.0.0.1:8080/api/records
curl http://127.0.0.1:8080/api/alerts
curl http://127.0.0.1:8080/api/summary
```

### NetworkPolicy Test Not Blocking

Minikube's active CNI may not enforce NetworkPolicy. The manifests still define the intended security boundaries. Note this limitation in the report if traffic is not blocked during the local Minikube test.

If you need enforced NetworkPolicy for the demo, start Minikube with a CNI that supports it, or use a Kubernetes setup such as k3s with a compatible network plugin. Do not claim blocked traffic unless the netcat checks actually fail as expected.
