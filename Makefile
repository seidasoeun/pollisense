COMPOSE ?= docker compose
KUBECTL ?= kubectl
NAMESPACE ?= pollisense

.PHONY: compose-up compose-down k8s-build-minikube k8s-deploy k8s-status k8s-port-forward-frontend k8s-port-forward-backend k8s-check k8s-clean vm1-bootstrap vm1-install vm1-deploy vm2-join vm1-copy-images-vm2 vm1-portforward-services vm1-after-reboot vm1-verify vm1-evidence vm1-clean

compose-up:
	$(COMPOSE) up --build

compose-down:
	$(COMPOSE) down

k8s-build-minikube:
	docker build -t pollisense-backend:latest ./pollisense-backend
	docker build -t pollisense-simulator:latest ./pollisense-simulator
	docker build -t pollisense-frontend:latest ./pollisense-frontend

k8s-deploy:
	$(KUBECTL) apply -f k8s/

k8s-status:
	$(KUBECTL) get all -n $(NAMESPACE)
	$(KUBECTL) get pvc,networkpolicy -n $(NAMESPACE)

k8s-port-forward-frontend:
	$(KUBECTL) port-forward -n $(NAMESPACE) svc/pollisense-frontend 8081:80

k8s-port-forward-backend:
	$(KUBECTL) port-forward -n $(NAMESPACE) svc/pollisense-backend 8080:8080

k8s-check:
	bash ./scripts/check-k8s-demo.sh

k8s-clean:
	$(KUBECTL) delete -f k8s/

vm1-bootstrap:
	bash scripts/opennebula-k3s/00-vm-bootstrap.sh

vm1-install:
	bash scripts/opennebula-k3s/01-vm1-install-docker-k3s-server.sh

vm1-deploy:
	bash scripts/opennebula-k3s/02-vm1-deploy-pollisense.sh

vm2-join:
	bash scripts/opennebula-k3s/03-vm2-install-k3s-agent.sh

vm1-copy-images-vm2:
	bash scripts/opennebula-k3s/04-vm1-copy-images-to-vm2.sh

vm1-portforward-services:
	bash scripts/opennebula-k3s/05-vm1-setup-portforward-services.sh

vm1-after-reboot:
	bash scripts/opennebula-k3s/06-vm1-after-reboot.sh

vm1-verify:
	bash scripts/opennebula-k3s/07-vm1-verify-deployment.sh

vm1-evidence:
	bash scripts/opennebula-k3s/08-vm1-collect-evidence.sh

vm1-clean:
	bash scripts/opennebula-k3s/09-vm1-clean-pollisense.sh
