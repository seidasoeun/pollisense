# Two-VM OpenNebula/k3s Deployment

This guide is the deployment path used for the final version of PolliSense. It assumes two fresh OpenNebula Ubuntu VMs. The deployment is script-based: each step points to a script under `scripts/opennebula-k3s/`. The scripts are included so the deployment can be repeated without manually retyping the commands used during development.

## 1. What This Guide Deploys

In version 1, OpenNebula provides two static VMs:

- VM1: k3s server/control-plane.
- VM2: k3s worker/agent.
- PolliSense runs as Kubernetes workloads.
- PostgreSQL stores data through a Kubernetes PVC.
- Frontend and backend access use VM1 systemd port-forward services.

Application flow:

```text
pollisense-simulator -> pollisense-backend ingestion API -> PostgreSQL
                     -> backend read APIs -> pollisense-frontend dashboard
```

Dynamic OpenNebula worker autoscaling is future work.

## 2. Network Access Used in the Lab

From Windows, open a SOCKS tunnel to the main OpenNebula server:

```bash
ssh -D 127.0.0.1:8888 -p 5033 <user>@<main-server>
```

From the main server, SSH into the private VM IPs:

```bash
ssh root@172.16.100.2
ssh root@<VM2_IP>
```

Firefox on Windows uses SOCKS5 `127.0.0.1:8888`.

Use these URLs through SOCKS:

```text
Frontend: http://172.16.100.2:9999
Backend:  http://172.16.100.2:8080/actuator/health
```

Do not open `localhost:9999` from Windows. With SOCKS, `localhost` is the Windows laptop, not VM1.

## 3. Clone Repository on VM1

On VM1:

```bash
ssh root@172.16.100.2
git clone https://github.com/seidasoeun/pollisense.git
cd pollisense
```

If the repository already exists:

```bash
cd ~/pollisense
git pull origin master
```

## 4. Prepare Environment File

On each VM, copy the example file and edit it:

```bash
cp scripts/opennebula-k3s/env.example scripts/opennebula-k3s/.env.local
nano scripts/opennebula-k3s/.env.local
```

Useful fields:

- `VM1_IP`: VM1 private IP. In our lab run this was `172.16.100.2`.
- `VM2_IP`: VM2 private IP.
- `VM1_HOSTNAME`: hostname for VM1, usually `pollisense-vm1`.
- `VM2_HOSTNAME`: hostname for VM2, usually `pollisense-vm2`.
- `SSH_USER`: SSH user used by VM1 when copying images to VM2.
- `NAMESPACE`: Kubernetes namespace, normally `pollisense`.
- `FRONTEND_PORT`: VM1 frontend port, normally `9999`.
- `BACKEND_PORT`: VM1 backend port, normally `8080`.

`.env.local` is VM-specific and should not be committed.

## 5. VM1 Setup from a Fresh VM

Run these on VM1:

```bash
sudo VM_HOSTNAME=pollisense-vm1 bash scripts/opennebula-k3s/00-vm-bootstrap.sh
bash scripts/opennebula-k3s/01-vm1-install-docker-k3s-server.sh
bash scripts/opennebula-k3s/02-vm1-deploy-pollisense.sh
```

What the scripts do:

- `00-vm-bootstrap.sh`: fixes hostname and `/etc/hosts`, selects a working DNS resolver, updates apt, and installs basic tools.
- `01-vm1-install-docker-k3s-server.sh`: installs Docker and the k3s server/control-plane.
- `02-vm1-deploy-pollisense.sh`: validates the local config, builds images, imports them into VM1 k3s containerd, and applies the Kubernetes manifests.

## 6. Get VM1 k3s Token

On VM1:

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

Save the token. VM2 needs it to join the k3s cluster.

## 7. VM2 Setup from a Fresh VM

Run these on VM2:

```bash
ssh root@<VM2_IP>
git clone https://github.com/seidasoeun/pollisense.git
cd pollisense
cp scripts/opennebula-k3s/env.example scripts/opennebula-k3s/.env.local
nano scripts/opennebula-k3s/.env.local
sudo VM_HOSTNAME=pollisense-vm2 bash scripts/opennebula-k3s/00-vm-bootstrap.sh
K3S_TOKEN='<token-from-vm1>' bash scripts/opennebula-k3s/03-vm2-install-k3s-agent.sh
```

`03-vm2-install-k3s-agent.sh` joins VM2 to VM1 at `https://VM1_IP:6443`.

Normal `kubectl` work is done from VM1 because VM1 has the k3s server kubeconfig. VM2 does not normally use `kubectl`.

Back on VM1, check the nodes:

```bash
kubectl get nodes -o wide
```

Expected: VM1 and VM2 are `Ready`.

## 8. Copy Images from VM1 to VM2

Back on VM1:

```bash
bash scripts/opennebula-k3s/04-vm1-copy-images-to-vm2.sh
```

Version 1 does not use a registry. The Kubernetes manifests use local image names, so each k3s node must have the PolliSense images in containerd. The script saves the images on VM1, copies the tar files to VM2, and imports them there.

A shared registry would be a future improvement.

## 9. Enable Frontend and Backend Access After Reboot

On VM1:

```bash
bash scripts/opennebula-k3s/05-vm1-setup-portforward-services.sh
```

This creates systemd services on VM1:

- Frontend port-forward: `172.16.100.2:9999`.
- Backend port-forward: `172.16.100.2:8080`.

The services restart after reboot so the dashboard and health endpoint are reachable again after the VMs start.

## 10. Verify Deployment

On VM1:

```bash
bash scripts/opennebula-k3s/07-vm1-verify-deployment.sh
```

Manual checks:

```bash
kubectl get nodes -o wide
kubectl get pods -n pollisense -o wide
kubectl get pvc -n pollisense
curl http://172.16.100.2:8080/actuator/health
```

The verification script also checks backend APIs, simulator logs, backend scaling, and PostgreSQL persistence after a pod restart.

NetworkPolicy objects are applied, but enforcement depends on the Kubernetes CNI.

## 11. Browser Check from Windows

With Firefox SOCKS configured, open:

```text
http://172.16.100.2:9999
```

Expected:

- The dashboard loads.
- Records appear.
- Alerts appear.
- Refresh still works.

## 12. After Shutdown or Startup

Start VM1 first, then VM2. k3s services should start automatically.

On VM1:

```bash
bash scripts/opennebula-k3s/06-vm1-after-reboot.sh
```

Or check the port-forward services:

```bash
sudo systemctl status pollisense-frontend-portforward --no-pager
sudo systemctl status pollisense-backend-portforward --no-pager
```

## 13. Collect Evidence

On VM1:

```bash
bash scripts/opennebula-k3s/08-vm1-collect-evidence.sh
```

The script saves command outputs under:

```text
~/pollisense-evidence/<timestamp>/
```

It saves Kubernetes status, simulator logs, backend API responses, systemd service status, and listening ports. It does not dump secret values.

## 14. Cleanup

On VM1:

```bash
CONFIRM_DELETE=true bash scripts/opennebula-k3s/09-vm1-clean-pollisense.sh
```

By default this deletes only the `pollisense` namespace.

Full k3s reset requires extra confirmation and should only be used on disposable VMs:

```bash
CONFIRM_DELETE=true FULL_RESET=true CONFIRM_FULL_RESET=true bash scripts/opennebula-k3s/09-vm1-clean-pollisense.sh
```

## 15. Troubleshooting

DNS failure during apt update:

Run `00-vm-bootstrap.sh` again. It tests several resolvers and keeps the first one that can resolve `archive.ubuntu.com`.

`sudo: unable to resolve host`:

Check `/etc/hosts`. It should contain a `127.0.1.1` entry for the VM hostname.

`k3s: command not found`:

Run `01-vm1-install-docker-k3s-server.sh` on VM1 or `03-vm2-install-k3s-agent.sh` on VM2.

`kubectl` on VM2 tries `localhost:8080`:

Use `kubectl` on VM1. VM2 is a worker node and normally has no kubeconfig.

`ImagePullBackOff` on VM2:

Run `04-vm1-copy-images-to-vm2.sh` from VM1 so VM2 has the local images in k3s containerd.

`localhost:9999` does not work from Windows through SOCKS:

Open `http://172.16.100.2:9999`. `localhost` is the Windows laptop in this setup.

PVC is not `Bound`:

Check the default StorageClass:

```bash
kubectl get storageclass
```

If the lab environment does not provide dynamic provisioning, create a matching static PersistentVolume for the `postgres-data` claim.
