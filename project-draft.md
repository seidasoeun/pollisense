# Project Draft

## Working title
**Secure Task Manager on Kubernetes**

## Short idea
We want to build a small but realistic 3-tier web application and deploy it in a cloud-native way.
The application will have:

- a **Vue frontend**
- a **Java Spring Boot backend**
- a **PostgreSQL database**

The goal is not to build a huge product, but to show that we can design, containerize, deploy, and secure a small distributed application using the technologies covered in the course.

## Why this project
This project fits the course topics well because it lets us work with:

- Docker for containerization
- Kubernetes for orchestration
- networking between services
- persistent storage for the database
- security mechanisms such as Secrets and NetworkPolicy

It may also realistic enough to demo properly, without becoming too large or difficult to maintain.

## Main objective
The main objective is to show how a simple application can be deployed as a secure 3-tier system in Kubernetes, with clear separation between components and controlled communication between them.

## Functional scope
The application itself will stay simple.

### Planned features
- list tasks
- add a task
- mark a task as done
- delete a task

This, may enough to demonstrate communication between all layers without spending too much time on product features.

## Architecture
The application will be split into three components:

### Frontend
- built with Vue
- user-facing component
- sends HTTP requests to the backend API

### Backend
- built with Java Spring Boot
- exposes REST endpoints
- handles business logic and talks to PostgreSQL

### Database
- PostgreSQL
- stores task data persistently
- not exposed outside the cluster

## Communication flow
The expected traffic flow is:

- user -> frontend
- frontend -> backend
- backend -> postgres

The database should only be reachable from the backend.
The backend should only be reachable by the frontend and not directly by random external services.

## Security idea
Security is one of the required parts of the project, so we want to include it from the beginning instead of adding it at the end.

### Minimum security measures
- use a **Kubernetes Secret** for database credentials
- use **NetworkPolicy** to restrict traffic between pods
- keep PostgreSQL as an internal service only

### Optional improvements
- run frontend and backend as non-root containers where practical
- avoid hardcoding credentials in the codebase
- use smaller container images if possible

## Data model
For the sample table.

### Task entity
- `id`
- `title`
- `description`
- `done`
- `created_at`

If we have time later, we can add extra fields such as priority or due date, but they are not necessary for the project to work.

## Backend plan
### Main backend components
- `TaskController`
- `TaskService`
- `TaskRepository`
- `Task` entity

### Planned API endpoints
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/{id}/done`
- `DELETE /api/tasks/{id}`

These endpoints are enough for the frontend and for a complete demo.

## Frontend plan
The frontend should stay simple and clean.

### Planned pages/components
- task list view
- add task form
- done button
- delete button

No authentication or advanced dashboard is needed unless we discover later that we still have extra time.

## Project structure
```text
project/
  frontend/
    src/
    public/
    Dockerfile
    package.json
    vite.config.js

  backend/
    src/main/java/...
    src/main/resources/application.yml
    Dockerfile
    pom.xml

  k8s/
    namespace.yaml
    postgres-secret.yaml
    postgres-pvc.yaml
    postgres-deployment.yaml
    postgres-service.yaml
    backend-configmap.yaml
    backend-deployment.yaml
    backend-service.yaml
    frontend-deployment.yaml
    frontend-service.yaml
    networkpolicy.yaml

  README.md
```

## Kubernetes plan
### `namespace.yaml`
Create a dedicated namespace, for example:
- `task-app`

### `postgres-secret.yaml`
Store database-related secrets:
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

### `postgres-pvc.yaml`
PersistentVolumeClaim for database data.

### `postgres-deployment.yaml`
Deploy PostgreSQL as a single pod.

### `postgres-service.yaml`
Expose PostgreSQL internally with `ClusterIP` only.

### `backend-configmap.yaml`
Store non-sensitive backend configuration, such as:
- database host
- database name
- backend port

### `backend-deployment.yaml`
Deploy the Spring Boot backend using values from Secret and ConfigMap.

### `backend-service.yaml`
Expose the backend internally with `ClusterIP`.

### `frontend-deployment.yaml`
Deploy the Vue frontend.

### `frontend-service.yaml`
Expose the frontend to the user.
For local testing, `NodePort` is probably enough.

### `networkpolicy.yaml`
Restrict traffic so that:
- frontend can talk to backend
- backend can talk to postgres
- other unwanted traffic is blocked

## Demo plan
### Proposed demo steps
1. show running pods and services
2. open the frontend
3. add a task
4. mark a task as done
5. show that data is stored in PostgreSQL
6. explain that the database is internal-only
7. briefly show the NetworkPolicy and Secret setup

### Optional demo addition
- scale backend replicas and show that the service still works

## What this project demonstrates
If implemented well, this project will show:

- how to package services into containers
- how to deploy a multi-component app on Kubernetes
- how to manage persistent storage for a database
- how to reduce attack surface through internal-only services
- how to control communication paths with NetworkPolicy
- how to organize a small cloud-native application in a reproducible way

## Scope control
To avoid making the project too large, we should **not** add too many extra features at the beginning.

### Things to avoid for now
- login/authentication
- CI/CD pipeline
- service mesh
- monitoring stack
- autoscaling logic
- OpenNebula integration in the first version

These could be mentioned as future improvements, but they should not be part of the first implementation.

## Proposed work split
### First phase
- define the task model
- build the backend API
- connect backend to PostgreSQL

### Second phase
- build the Vue frontend
- connect frontend to backend

### Third phase
- write Dockerfiles
- test containers locally

### Fourth phase
- create Kubernetes manifests
- deploy everything in the cluster

### Fifth phase
- add security features
- prepare README and final demo

## Final note
The strength of this project is not in the number of features, but in the fact that it is clean, realistic, reproducible, and clearly connected to the course topics.

A smaller project that works well and is easy to explain is much better than a bigger project that becomes hard to debug or defend during the exam.
