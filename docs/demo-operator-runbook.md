# Demo Operator Runbook

Use this on demo day as the practical sequence.

## Start VMs

Start VM1 first, then VM2.

VM1:

```text
172.16.100.2
```

VM2:

```text
172.16.100.3
```

## Connect

From Windows, keep the SOCKS tunnel open:

```bash
ssh -D 127.0.0.1:8888 -p 5033 <user>@<main-server>
```

From the main server:

```bash
ssh root@172.16.100.2
```

## Recover After Startup

On VM1:

```bash
cd ~/pollisense
bash scripts/opennebula-k3s/06-vm1-after-reboot.sh
```

## Check k3s

```bash
kubectl get nodes -o wide
kubectl get storageclass
```

Expected: VM1 and VM2 are `Ready`.

## Check Pods

```bash
kubectl get all -n pollisense -o wide
kubectl get pvc -n pollisense
kubectl get networkpolicy -n pollisense
```

Expected: PostgreSQL, backend, simulator, and frontend are running. The PVC is `Bound`.

## Check Port-Forward Services

```bash
systemctl status pollisense-frontend-portforward.service --no-pager
systemctl status pollisense-backend-portforward.service --no-pager
ss -lntp | grep -E ':(9999|8080)\b'
```

Expected:

```text
172.16.100.2:9999
172.16.100.2:8080
```

## Open Dashboard

In Firefox on Windows with SOCKS enabled:

```text
http://172.16.100.2:9999
```

Do not use `localhost`.

## Show Records and Alerts

On VM1:

```bash
curl http://172.16.100.2:8080/actuator/health
curl http://172.16.100.2:8080/api/records
curl http://172.16.100.2:8080/api/alerts
curl http://172.16.100.2:8080/api/summary
kubectl logs -n pollisense deployment/pollisense-simulator --tail=50
```

## Scale Backend

```bash
kubectl scale deployment pollisense-backend -n pollisense --replicas=3
kubectl rollout status deployment/pollisense-backend -n pollisense --timeout=180s
kubectl get pods -n pollisense -o wide -l app=pollisense-backend
```

Then return to one replica:

```bash
kubectl scale deployment pollisense-backend -n pollisense --replicas=1
kubectl rollout status deployment/pollisense-backend -n pollisense --timeout=180s
```

## Persistence Test

```bash
curl http://172.16.100.2:8080/api/records
kubectl delete pod -n pollisense -l app=postgres --wait=false
kubectl rollout status deployment/postgres -n pollisense --timeout=180s
curl http://172.16.100.2:8080/api/records
```

Expected: records are still available after the PostgreSQL pod is recreated because data is stored on the PVC.

## Collect Evidence

```bash
bash scripts/opennebula-k3s/08-vm1-collect-evidence.sh
```

Save the printed folder path for the report.

## Shutdown

Stop demo traffic first if needed:

```bash
systemctl stop pollisense-frontend-portforward.service
systemctl stop pollisense-backend-portforward.service
```

Then shut down VM2 first, VM1 second from OpenNebula or the VM shell.
