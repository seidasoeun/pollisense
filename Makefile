COMPOSE ?= docker compose
KUBECTL ?= kubectl
NAMESPACE ?= pollisense

.PHONY: compose-up compose-down k8s-build-minikube k8s-deploy k8s-status k8s-port-forward-frontend k8s-port-forward-backend k8s-check k8s-clean

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
