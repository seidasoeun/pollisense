# PolliSense OpenNebula k3s Scripts

These scripts document the version 1 OpenNebula deployment used for the course demo:

- static OpenNebula VM provisioning
- VM1 as the k3s server/control-plane
- VM2 as a k3s worker/agent
- local image build on VM1
- image export/copy/import to VM2
- Kubernetes manifests applied from `k8s/`
- port-forward services on VM1 for access through the Windows SOCKS proxy

Copy `env.example` to `.env.local` before running the scripts and edit at least `VM2_IP`:

```bash
cd scripts/opennebula-k3s
cp env.example .env.local
vi .env.local
```

`.env.local` is ignored by Git because it is VM-specific.

## Order

Run the scripts in this order.

On VM1:

```bash
VM_HOSTNAME=pollisense-vm1 bash scripts/opennebula-k3s/00-vm-bootstrap.sh
bash scripts/opennebula-k3s/01-vm1-install-docker-k3s-server.sh
bash scripts/opennebula-k3s/02-vm1-deploy-pollisense.sh
```

On VM2:

```bash
VM_HOSTNAME=pollisense-vm2 bash scripts/opennebula-k3s/00-vm-bootstrap.sh
K3S_TOKEN='<token-from-vm1>' bash scripts/opennebula-k3s/03-vm2-install-k3s-agent.sh
```

Back on VM1:

```bash
bash scripts/opennebula-k3s/04-vm1-copy-images-to-vm2.sh
bash scripts/opennebula-k3s/05-vm1-setup-portforward-services.sh
bash scripts/opennebula-k3s/07-vm1-verify-deployment.sh
bash scripts/opennebula-k3s/08-vm1-collect-evidence.sh
```

The same commands are available from the repository root through `make vm1-bootstrap`, `make vm1-install`, `make vm1-deploy`, `make vm2-join`, `make vm1-copy-images-vm2`, `make vm1-portforward-services`, `make vm1-verify`, and `make vm1-evidence`.

## SOCKS Access

From Windows, connect to the OpenNebula/main server with dynamic forwarding:

```bash
ssh -D 127.0.0.1:8888 -p 5033 <user>@<main-server>
```

Firefox should use SOCKS5 proxy `127.0.0.1:8888`.

Open these VM1 private-IP URLs:

```text
http://172.16.100.2:9999
http://172.16.100.2:8080/actuator/health
```

Do not open `localhost` from Windows. The Kubernetes port-forward must bind to the VM private IP so the traffic can pass through the SOCKS tunnel.

## kubectl Location

Use `kubectl` from VM1. VM2 is a k3s worker and does not need a normal kubeconfig for this demo. If `kubectl` on VM2 tries to connect to `localhost:8080`, that is expected when no kubeconfig is configured there.

## After Shutdown and Startup

Start VM1 first, then VM2. On VM1, either rely on the enabled systemd port-forward services or run:

```bash
bash scripts/opennebula-k3s/06-vm1-after-reboot.sh
```

The script starts k3s, waits for rollouts, and restarts port-forward services if they exist.

## Cleanup

Cleanup is guarded:

```bash
CONFIRM_DELETE=true bash scripts/opennebula-k3s/09-vm1-clean-pollisense.sh
```

By default this only deletes the `pollisense` namespace. A full k3s reset requires both `FULL_RESET=true` and `CONFIRM_FULL_RESET=true`.

## Limitations

- OpenNebula provisioning is static in version 1.
- Images are copied between nodes instead of pushed to a registry.
- NetworkPolicy enforcement depends on the cluster CNI.
- PostgreSQL is a single-replica prototype using one PVC.
