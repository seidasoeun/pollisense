# OpenNebula k3s Script Index

These scripts support the version 1 two-VM OpenNebula deployment:

- VM1: k3s server/control-plane, `kubectl`, image build/import, port-forward services.
- VM2: k3s worker/agent.
- Images are copied from VM1 to VM2 because this version does not use a registry.

## Environment

Copy the example file and edit it on the VM:

```bash
cp scripts/opennebula-k3s/env.example scripts/opennebula-k3s/.env.local
vi scripts/opennebula-k3s/.env.local
```

Set `VM1_IP`, `VM2_IP`, `SSH_USER`, ports, and any VM-specific paths there. `.env.local` is ignored by Git and should stay local.

`00-vm-bootstrap.sh` can enable root/debug login for the isolated lab environment. Do not use that setting outside the course lab.

## Run Order

Run on VM1:

```bash
VM_HOSTNAME=pollisense-vm1 bash scripts/opennebula-k3s/00-vm-bootstrap.sh
bash scripts/opennebula-k3s/01-vm1-install-docker-k3s-server.sh
sudo cat /var/lib/rancher/k3s/server/node-token
```

Run on VM2:

```bash
VM_HOSTNAME=pollisense-vm2 bash scripts/opennebula-k3s/00-vm-bootstrap.sh
K3S_TOKEN='<token-from-vm1>' bash scripts/opennebula-k3s/03-vm2-install-k3s-agent.sh
```

Run on VM1:

```bash
bash scripts/opennebula-k3s/02-vm1-deploy-pollisense.sh
bash scripts/opennebula-k3s/04-vm1-copy-images-to-vm2.sh
bash scripts/opennebula-k3s/05-vm1-setup-portforward-services.sh
bash scripts/opennebula-k3s/07-vm1-verify-deployment.sh
bash scripts/opennebula-k3s/08-vm1-collect-evidence.sh
```

After VM restart, run on VM1:

```bash
bash scripts/opennebula-k3s/06-vm1-after-reboot.sh
```

Cleanup is guarded and should not be used during the demo unless you intend to remove the namespace:

```bash
CONFIRM_DELETE=true bash scripts/opennebula-k3s/09-vm1-clean-pollisense.sh
```

## Scripts

- `00-vm-bootstrap.sh`: run on VM1 and VM2. Sets hostname, fixes `/etc/hosts`, selects DNS, installs base tools.
- `01-vm1-install-docker-k3s-server.sh`: run on VM1. Installs Docker and k3s server.
- `02-vm1-deploy-pollisense.sh`: run on VM1. Validates, builds images, imports VM1 images, applies manifests.
- `03-vm2-install-k3s-agent.sh`: run on VM2. Joins VM2 to the VM1 k3s server.
- `04-vm1-copy-images-to-vm2.sh`: run on VM1. Saves image tar files, copies them to VM2, imports them into VM2 k3s containerd.
- `05-vm1-setup-portforward-services.sh`: run on VM1. Creates systemd services for frontend and backend port-forwarding.
- `06-vm1-after-reboot.sh`: run on VM1. Restarts k3s workflow and port-forward services after VM startup.
- `07-vm1-verify-deployment.sh`: run on VM1. Checks cluster state, backend APIs, scaling, and persistence.
- `08-vm1-collect-evidence.sh`: run on VM1. Saves demo evidence without dumping secret values.
- `09-vm1-clean-pollisense.sh`: run on VM1. Deletes the namespace only when confirmation variables are set.

## Access

From Windows:

```bash
ssh -D 127.0.0.1:8888 -p 5033 <user>@<main-server>
```

Firefox should use SOCKS5 `127.0.0.1:8888`.

Open VM1 private-IP URLs:

```text
http://172.16.100.2:9999
http://172.16.100.2:8080/actuator/health
```

Do not use `localhost` from Windows; it points to the laptop, not VM1.
