# Two-VM OpenNebula k3s Deployment

This is the main deployment guide for the version 1 PolliSense OpenNebula setup used in the course demo.

## Topology

```text
Windows browser
  -> Firefox SOCKS5 127.0.0.1:8888
  -> ssh -D tunnel to the OpenNebula/main server
  -> VM1 private IP 172.16.100.2
  -> VM1 port-forward services
  -> Kubernetes Services in k3s
```

```text
VM1: 172.16.100.2
  k3s server/control-plane
  kubectl and kubeconfig
  Docker image build
  local image import into VM1 k3s containerd
  systemd port-forward services for frontend and backend

VM2: 172.16.100.3
  k3s worker/agent
  imported PolliSense images
  scheduled application pods
```

Application flow:

```text
pollisense-simulator -> pollisense-backend ingestion API -> PostgreSQL
                     -> backend read APIs -> pollisense-frontend dashboard
```

Version 1 uses static OpenNebula VMs. Dynamic VM autoscaling is future work.

## Before You Start

You need two Ubuntu VMs in OpenNebula. VM1 must reach VM2 over the private network. VM2 must reach VM1 on port `6443`.

Clone the repository on both VMs or copy the scripts there:

```bash
git clone https://github.com/seidasoeun/pollisense.git
cd pollisense
cp scripts/opennebula-k3s/env.example scripts/opennebula-k3s/.env.local
vi scripts/opennebula-k3s/.env.local
```

Set at least:

```text
VM1_IP=172.16.100.2
VM2_IP=172.16.100.3
SSH_USER=root
```

`.env.local` is VM-specific and should stay local.

## VM1 Setup

Run on VM1:

```bash
VM_HOSTNAME=pollisense-vm1 bash scripts/opennebula-k3s/00-vm-bootstrap.sh
bash scripts/opennebula-k3s/01-vm1-install-docker-k3s-server.sh
```

The bootstrap script sets the hostname, fixes `/etc/hosts`, selects a working DNS resolver, updates apt, and installs base tools. It also enables root/debug login for the isolated lab VMs; do not use that setting outside the lab.

After k3s is installed, print the worker join token:

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

Check VM1:

```bash
kubectl get nodes -o wide
kubectl get storageclass
```

## VM2 Setup

Run on VM2:

```bash
VM_HOSTNAME=pollisense-vm2 bash scripts/opennebula-k3s/00-vm-bootstrap.sh
K3S_TOKEN='<token-from-vm1>' bash scripts/opennebula-k3s/03-vm2-install-k3s-agent.sh
```

VM2 joins as a k3s agent. Normal `kubectl` work is done on VM1 because VM1 has the server kubeconfig.

Back on VM1:

```bash
kubectl get nodes -o wide
```

Both nodes should be `Ready`.

## Deploy PolliSense

Run on VM1:

```bash
bash scripts/opennebula-k3s/02-vm1-deploy-pollisense.sh
```

The script:

- clones or updates the repository under `APP_DIR`
- validates Docker Compose and the Kubernetes manifests
- builds backend, simulator, and frontend images
- imports the images into VM1 k3s containerd
- applies `k8s/`
- waits for PostgreSQL, backend, simulator, and frontend rollouts

For a clean redeploy, namespace deletion requires an explicit second confirmation:

```bash
CLEAN_NAMESPACE=true CONFIRM_CLEAN_NAMESPACE=true bash scripts/opennebula-k3s/02-vm1-deploy-pollisense.sh
```

Do not use this during the demo unless you intentionally want to remove the running namespace.

## Copy and Import Images to VM2

Version 1 does not use a registry. VM2 cannot pull `pollisense-backend:latest`, `pollisense-simulator:latest`, or `pollisense-frontend:latest` unless they are imported locally.

Run on VM1:

```bash
bash scripts/opennebula-k3s/04-vm1-copy-images-to-vm2.sh
```

Then check where pods are scheduled:

```bash
kubectl get pods -n pollisense -o wide
```

## Access Through SOCKS

From Windows, keep this tunnel open:

```bash
ssh -D 127.0.0.1:8888 -p 5033 <user>@<main-server>
```

Configure Firefox to use SOCKS5 `127.0.0.1:8888`.

Run on VM1:

```bash
bash scripts/opennebula-k3s/05-vm1-setup-portforward-services.sh
```

Open:

```text
http://172.16.100.2:9999
http://172.16.100.2:8080/actuator/health
```

Do not use `localhost:9999` from Windows. In that context, `localhost` is the Windows laptop, not VM1.

## After Reboot

Start VM1 first, then VM2. Run on VM1:

```bash
bash scripts/opennebula-k3s/06-vm1-after-reboot.sh
```

The script starts k3s, waits for the PolliSense rollouts, and restarts the systemd port-forward services. If the services are not installed, it starts temporary `nohup` port-forwards bound to the VM1 private IP.

## Verify the Deployment

Run on VM1:

```bash
bash scripts/opennebula-k3s/07-vm1-verify-deployment.sh
```

The verification script checks nodes, pods, services, PVCs, secrets, NetworkPolicies, simulator logs, backend APIs, backend scaling, and PostgreSQL persistence after a pod restart.

For the demo sequence, use [demo-runbook.md](demo-runbook.md).

## Collect Evidence

Run on VM1:

```bash
bash scripts/opennebula-k3s/08-vm1-collect-evidence.sh
```

Evidence is saved under:

```text
~/pollisense-evidence/YYYYMMDD-HHMMSS/
```

The script saves Kubernetes status, simulator logs, backend API responses, systemd port-forward status, and listening ports. It does not dump secret values.

## Cleanup

Delete only the PolliSense namespace:

```bash
CONFIRM_DELETE=true bash scripts/opennebula-k3s/09-vm1-clean-pollisense.sh
```

Full k3s removal is for disposable VMs only:

```bash
CONFIRM_DELETE=true FULL_RESET=true CONFIRM_FULL_RESET=true bash scripts/opennebula-k3s/09-vm1-clean-pollisense.sh
```

Do not run cleanup during the demo unless you intend to remove the deployment.

## Troubleshooting

DNS fails during apt or downloads:

```bash
VM_HOSTNAME=pollisense-vm1 bash scripts/opennebula-k3s/00-vm-bootstrap.sh
```

The bootstrap script keeps the working DNS selection logic and tests several resolvers against `archive.ubuntu.com`.

`sudo: unable to resolve host`:

Check `/etc/hosts`. It should contain a `127.0.1.1` line for the VM hostname.

`kubectl` on VM2 tries `localhost:8080`:

This is expected when VM2 has no kubeconfig. Use `kubectl` on VM1.

Pods on VM2 show `ImagePullBackOff`:

Run `04-vm1-copy-images-to-vm2.sh` from VM1 so VM2 has the local images in k3s containerd.

Windows browser cannot open the frontend:

Check that Firefox uses SOCKS5 `127.0.0.1:8888`, the SSH tunnel is still open, and the port-forward service listens on `172.16.100.2:9999`.

PVC is not `Bound`:

Check the default StorageClass:

```bash
kubectl get storageclass
```

If the OpenNebula lab does not provide dynamic provisioning, create a matching static PersistentVolume for the `postgres-data` claim.

NetworkPolicy does not appear to block traffic:

The objects can exist without enforcement if the installed CNI does not support NetworkPolicy. Note that caveat in the report instead of claiming enforcement that was not observed.
