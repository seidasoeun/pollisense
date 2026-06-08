# Two-VM OpenNebula k3s Deployment

This guide describes the reproducible two-VM PolliSense deployment used for the course demo.

## Topology

```text
Windows browser
  -> Firefox SOCKS5 127.0.0.1:8888
  -> ssh -D tunnel to OpenNebula/main server
  -> VM1 private IP 172.16.100.2
  -> k3s services and port-forwards

VM1 pollisense-vm1, 172.16.100.2
  - Docker
  - k3s server/control-plane
  - kubectl
  - local image build/import
  - frontend/backend port-forward systemd services

VM2 pollisense-vm2, 172.16.100.3
  - k3s agent/worker
  - imported PolliSense images
  - scheduled application pods
```

Application flow:

```text
pollisense-simulator -> pollisense-backend -> PostgreSQL -> backend read APIs -> pollisense-frontend
```

## Prerequisites

- Two Ubuntu VMs created with OpenNebula.
- VM1 can reach VM2 over the private network.
- VM2 can reach VM1 on port `6443`.
- Windows can reach the OpenNebula/main server with SSH dynamic forwarding.
- Firefox on Windows is configured to use SOCKS5 proxy `127.0.0.1:8888`.
- The scripts are run on the Linux VMs, not on Windows.

Clone the repository on each VM or copy the scripts there:

```bash
git clone https://github.com/seidasoeun/pollisense.git
cd pollisense
cp scripts/opennebula-k3s/env.example scripts/opennebula-k3s/.env.local
vi scripts/opennebula-k3s/.env.local
```

Set the correct `VM1_IP`, `VM2_IP`, and `SSH_USER`.

## VM1 Setup

Bootstrap VM1:

```bash
VM_HOSTNAME=pollisense-vm1 bash scripts/opennebula-k3s/00-vm-bootstrap.sh
```

This sets the hostname, fixes `/etc/hosts`, selects a working DNS resolver, updates apt, and installs only basic tools.

Install Docker and the k3s server:

```bash
bash scripts/opennebula-k3s/01-vm1-install-docker-k3s-server.sh
```

At the end, copy the node token:

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

Check VM1:

```bash
kubectl get nodes -o wide
kubectl get storageclass
```

## VM2 Setup

Bootstrap VM2:

```bash
VM_HOSTNAME=pollisense-vm2 bash scripts/opennebula-k3s/00-vm-bootstrap.sh
```

Join VM2 to the cluster:

```bash
K3S_TOKEN='<token-from-vm1>' bash scripts/opennebula-k3s/03-vm2-install-k3s-agent.sh
```

VM2 runs the k3s agent. Use `kubectl` on VM1 for normal cluster operations.

## Deployment

On VM1:

```bash
bash scripts/opennebula-k3s/02-vm1-deploy-pollisense.sh
```

The script clones or pulls the repository, validates Docker Compose and Kubernetes manifests, builds the three images, imports them into VM1 k3s containerd, applies `k8s/`, and waits for rollouts.

Optional namespace cleanup is explicit:

```bash
CLEAN_NAMESPACE=true bash scripts/opennebula-k3s/02-vm1-deploy-pollisense.sh
```

## Image Copy and Import

Because the manifests use local image names such as `pollisense-backend:latest`, VM2 cannot pull them from a registry. Copy and import them from VM1:

```bash
bash scripts/opennebula-k3s/04-vm1-copy-images-to-vm2.sh
```

Then check scheduling:

```bash
kubectl get nodes -o wide
kubectl get pods -n pollisense -o wide
```

## External Access Through SOCKS

On Windows:

```bash
ssh -D 127.0.0.1:8888 -p 5033 <user>@<main-server>
```

Configure Firefox SOCKS5 proxy `127.0.0.1:8888`.

On VM1, create systemd port-forward services:

```bash
bash scripts/opennebula-k3s/05-vm1-setup-portforward-services.sh
```

Open:

```text
http://172.16.100.2:9999
http://172.16.100.2:8080/actuator/health
```

Do not open `localhost` from Windows. The port-forward binds to `172.16.100.2` so traffic can cross the SOCKS tunnel.

## Validation

Run the verification script on VM1:

```bash
bash scripts/opennebula-k3s/07-vm1-verify-deployment.sh
```

It checks nodes, pods, services, PVCs, secrets, NetworkPolicies, simulator logs, backend APIs, backend scaling, and PostgreSQL persistence after a pod restart.

## After Reboot

Start VM1 first, then VM2. On VM1:

```bash
bash scripts/opennebula-k3s/06-vm1-after-reboot.sh
```

If the port-forward services are installed, the script restarts them. Otherwise it starts temporary `nohup` port-forwards bound to the VM1 private IP.

## Evidence Collection

On VM1:

```bash
bash scripts/opennebula-k3s/08-vm1-collect-evidence.sh
```

Evidence is saved under:

```text
~/pollisense-evidence/YYYYMMDD-HHMMSS/
```

## Cleanup

Delete only the PolliSense namespace:

```bash
CONFIRM_DELETE=true bash scripts/opennebula-k3s/09-vm1-clean-pollisense.sh
```

Do not use full reset unless the VM is disposable:

```bash
CONFIRM_DELETE=true FULL_RESET=true CONFIRM_FULL_RESET=true bash scripts/opennebula-k3s/09-vm1-clean-pollisense.sh
```

## Troubleshooting

DNS failure:
Run `00-vm-bootstrap.sh` again. It tests `168.63.129.16`, `1.1.1.1`, `8.8.8.8`, and `9.9.9.9` against `archive.ubuntu.com`.

`sudo: unable to resolve host`:
Check `/etc/hosts`. It should contain a `127.0.1.1` line for the VM hostname.

`k3s: command not found`:
Run `01-vm1-install-docker-k3s-server.sh` on VM1 or `03-vm2-install-k3s-agent.sh` on VM2.

`kubectl` on VM2 tries `localhost:8080`:
That is normal when VM2 has no kubeconfig. Use `kubectl` from VM1.

`ImagePullBackOff` on VM2:
Run `04-vm1-copy-images-to-vm2.sh` from VM1 so VM2 has the local images in k3s containerd.

Port-forward to `localhost` does not work from Windows:
Bind the port-forward to `172.16.100.2` and browse to `http://172.16.100.2:9999` through SOCKS.

PVC is not `Bound`:
Check the default StorageClass with `kubectl get storageclass`. If the OpenNebula environment has no dynamic storage class, a matching static PV is needed.
