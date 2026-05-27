# PolliSense: A Cloud-Native Prototype for Modular Pollinator Monitoring

## Abstract
PolliSense is a prototype system for modular insect monitoring designed primarily for research use. The project combines a researcher-oriented dashboard with a backend platform for ingesting, storing, and serving processed ecological observations together with device health information. The broader vision of the system is a field-deployable monitoring station composed of modular hardware layers for sensing, computation, communication, and power. In the current stage of the project, however, the focus is not on delivering a finished hardware product. Instead, the goal is to validate the end-to-end software workflow before full hardware integration.

To achieve this, the project proposes a cloud-native architecture composed of a frontend dashboard, a Java Spring Boot backend, a PostgreSQL database, and a simulator that emulates field devices by producing realistic processed JSON records. This approach makes it possible to demonstrate data ingestion, storage, analytics, alert generation, and dashboard interaction without requiring the physical hardware to be fully available during development. The project also includes explicit security mechanisms, such as Kubernetes Secrets, internal-only service exposure, and network policies that restrict communication between components.

The main contribution of PolliSense is not species-level classification or raw video analysis. Rather, it is a systems-level prototype that connects processed ecological observations, environmental context, and operational reliability into one coherent research workflow. In this way, PolliSense addresses both the biological and infrastructural dimensions of long-term field monitoring.

## 1. Introduction
Ecological field monitoring often depends on instruments that work under difficult environmental conditions for extended periods of time. In this context, the quality of the collected data is not determined only by the sensing or vision pipeline, but also by the reliability of the monitoring infrastructure itself. A field station that loses connectivity, suffers battery degradation, or partially fails at the sensing level can silently undermine the quality and continuity of the research data.

PolliSense is motivated by this practical challenge. The system is envisioned as a modular insect monitoring station that can be deployed in outdoor environments and used mainly by researchers interested in insect activity, environmental conditions, and long-term monitoring continuity. The hardware concept follows a stacked modular design. The top layer contains sensing and vision components such as the OAK-1 Lite camera and environmental sensors. The middle layer contains embedded compute and communication components, such as a Raspberry Pi Zero 2 W and a SIM7070G communication module. The bottom layer contains the battery and power management subsystem. This design supports maintenance, replacement, and future upgrades more easily than a fully integrated device.

Even though the long-term vision includes real edge hardware, the software side of the project is already rich enough to be studied independently. The dashboard prototype has already been designed to reflect the needs of a researcher-facing monitoring workflow. The next logical step is therefore to integrate a backend and data pipeline that can support a realistic demonstration of the system architecture. This project is proposed precisely at that stage: not as a finished commercial product, but as a cloud-native prototype that validates the architecture, data flow, security model, and user-facing logic of the platform.

## 2. Problem Statement
Existing monitoring solutions often focus on detection quality, hardware design, or domain-specific sensing, but they may be harder to deploy, maintain, and interpret in real-world field conditions. For researchers, a key difficulty is that biological observations alone are not enough. To trust a monitoring dataset, they must also know whether the corresponding monitoring station was healthy when the data was collected.

This means that several practical questions become essential:

- Was the station online when activity dropped, or was connectivity interrupted?
- Was the battery level too low to trust the sensing interval?
- Did the vision module work correctly, or did the system partially fail?
- Are environmental variables aligned with the observed biological trends?
- Can different researchers tailor the dashboard to different target-group interests without losing a shared scientific baseline?

PolliSense addresses these issues by combining two perspectives that are often treated separately: ecological monitoring and operational reliability. The system is built around processed compact JSON records rather than raw video transfer. This design keeps the data pipeline lightweight and makes the project more realistic for edge deployment. At the same time, the system stores device-health information alongside ecological and environmental data so that the researcher can interpret observations in the context of station reliability.

The project does not attempt full species-level classification and does not claim a production-ready hardware platform. Instead, it focuses on a limited set of supported target groups—honeybee, bumblebee, butterfly, and hoverfly—and on a realistic software prototype that can demonstrate how such a system would operate in practice.

## 3. Objectives
The main objective of the project is to design and implement a secure cloud-native prototype for a modular pollinator-monitoring workflow. More specifically, the project has the following goals.

First, it aims to integrate the current frontend prototype with a real backend and persistent data storage so that the dashboard is no longer driven only by local mock data. Second, it aims to simulate the edge collection layer in a controlled way, allowing the team to test ingestion and analytics without requiring access to all planned hardware modules. Third, it aims to separate ecological records from operational reliability records while keeping them linked through station identity, device identity, and time. Finally, it aims to deploy the whole prototype using cloud-native technologies that reflect the course topics, including containers, Kubernetes orchestration, and security mechanisms.

In practical terms, the project should be able to demonstrate the following:

1. ingestion of processed records from simulated field stations;
2. backend persistence and retrieval of ecological and device-health data;
3. analytics and alerts exposed through backend APIs;
4. a researcher dashboard consuming real backend endpoints;
5. secure communication policies between the system components.

## 4. Scope and System Positioning
It is important to define the project scope carefully. PolliSense is not presented as a full production platform and not as a complete substitute for a physical deployment. The current version is best described as a prototype used to validate system logic, information architecture, and cloud-native integration before full hardware-backed deployment.

This distinction matters for two reasons. On the one hand, it keeps the project realistic and honest. On the other hand, it makes the project academically meaningful because it highlights the architectural and workflow questions that arise before the final hardware integration stage.

The primary target user is a researcher carrying out long-term field monitoring. Secondary users, such as technical operators, institutions, or farmers, may exist in future scenarios, but they are not the main focus of the present prototype. The dashboard and backend are therefore designed first around research workflows: activity trends, environmental context, target-group filtering, alerting, station reliability, and configurable researcher preferences.

## 5. Proposed Architecture
The system is organized into three main logical layers: the edge collection and processing layer, the backend platform layer, and the dashboard layer.

### 5.1 Edge Collection and Processing Layer
In the final vision of PolliSense, this layer corresponds to modular outdoor devices that collect visual and environmental data, process them locally, and transmit only compact processed JSON records. Because the project currently does not rely on full hardware availability, the implementation will include a simulator service that emulates multiple virtual field stations.

The simulator will generate realistic processed records for ecological activity and device health. The ecological part will include counts or activity estimates for the supported target groups together with temperature, humidity, and light conditions. The operational part will include battery level, signal quality, connectivity mode, last sync, and module health indicators. The simulator will periodically send these records to the backend ingestion endpoint, enabling end-to-end testing of the platform.

### 5.2 Backend Platform Layer
The backend will be implemented as a Java Spring Boot modular monolith. This is a deliberate design choice. At this stage, the project does not need a complex microservice architecture, which would introduce unnecessary operational overhead. A modular monolith is easier to implement, easier to debug, and still compatible with a future transition toward service-oriented or microservice decomposition if the system grows.

The backend will be organized into the following functional modules:

- **Device Ingestion**, responsible for accepting processed JSON records from simulated stations;
- **Station and Device Management**, responsible for metadata about stations, devices, and deployment state;
- **Processed Record Service**, responsible for storing and retrieving ecological and environmental observations;
- **Analytics Service**, responsible for summary views, correlations, and dashboard-oriented aggregations;
- **Alert Service**, responsible for tracking conditions such as low battery, missing sync, or degraded module health;
- **Preferences Service**, responsible for storing dashboard configuration settings for researchers.

The backend will expose REST APIs consumed by the dashboard. These APIs will serve both raw processed records and dashboard-ready aggregated views.

### 5.3 Storage Layer
The persistence layer will be based on PostgreSQL. The schema will distinguish ecological records from device-health records, while linking both through station identifiers, device identifiers, and timestamps. This separation is important because biological observations and operational reliability are conceptually different, even though they must be interpreted together.

### 5.4 Frontend Dashboard Layer
The frontend is already available as a prototype built with React, TypeScript, Vite, Tailwind, Recharts, and lucide-react. It includes sections such as Overview, Activity, Environment, Correlations, Insights, Data, Status, and Research Preferences. In the project implementation, the frontend will be connected to backend APIs so that its content is no longer static. The dashboard will continue to reflect the core design principle already validated through feedback: a shared scientific baseline combined with a configurable researcher layer.

## 6. Implementation Plan
The implementation is intentionally scoped so that it remains feasible within the course timeline while still demonstrating meaningful technical depth.

### 6.1 Frontend Integration
The current frontend already provides the system context, realistic dashboard logic, and domain-aware views. The implementation work on the frontend side will therefore focus mainly on replacing local mock data with real API calls and adjusting the application state so that dashboard widgets react to backend responses.

This part of the project is not intended to redesign the entire interface. Instead, the goal is to preserve the structure that has already been developed and use it as a realistic client for the backend. The dashboard will remain researcher-oriented, with filters for supported target groups, customizable preferences, and explicit emphasis on both ecological and operational information.

### 6.2 Backend Development
The backend will be built using Spring Boot with a layered structure including controllers, services, repositories, and entities. The team will define domain models for stations, devices, processed records, health snapshots, alerts, and preferences. The API design will remain relatively small and focused, prioritizing endpoints that are necessary for the dashboard and the simulator.

A first set of endpoints is expected to cover ingestion, station listing, processed activity retrieval, environment retrieval, alert access, and preference updates. Rather than building a large number of generic endpoints, the implementation will prioritize the data flows needed for the demo and the research use case.

### 6.3 Edge Simulator
The simulator is one of the most important implementation components because it allows the system to behave like a realistic end-to-end prototype. The simulator will emulate several stations and produce periodic records with controlled variation. This makes it possible to reproduce different monitoring scenarios, such as normal activity, environmental variation, connectivity degradation, battery issues, or module failure.

From an engineering point of view, the simulator also acts as a test harness. It makes the backend easier to validate and enables repeatable demo scenarios. This is much stronger than static JSON files because the simulator can actively drive changes in the system state during the demo.

### 6.4 Containerization and Orchestration
The system components will be packaged as Docker containers. At minimum, this will include the backend service, the frontend service, the simulator service, and PostgreSQL. The deployment target will be Kubernetes, using separate deployments and internal services for the main components.

This design is aligned with the course’s cloud-native and orchestration topics. It also supports a realistic deployment workflow in which application services are independently packaged and managed through declarative manifests.

## 7. Security Design
The course requires each project to include at least one concrete security-related element, and PolliSense will include several.

The first mechanism is the use of Kubernetes Secrets to manage sensitive configuration such as database credentials and ingestion tokens. This avoids hardcoding sensitive values in source code or configuration files.

The second mechanism is the use of internal-only communication where appropriate. PostgreSQL will not be directly exposed outside the cluster, and the backend will serve as the controlled access point for dashboard interactions.

The third mechanism is the use of Kubernetes NetworkPolicy to restrict network communication between components. The intended policy is to allow only the necessary flows: the simulator should be able to reach the ingestion endpoint, the frontend should be able to reach the backend, and the backend should be able to reach PostgreSQL. Other unnecessary internal communication should be denied.

A fourth security improvement, if feasible within the time available, is to run the application containers as non-root and adopt minimal base images where practical. These measures are simple but meaningful examples of hardening in containerized environments.

## 8. Deployment Strategy
The core deployment target will be Kubernetes. This provides the orchestration layer required to demonstrate service separation, container lifecycle management, configuration injection, and internal networking. The project is intentionally not designed around a large and fragile infrastructure stack. Instead, the deployment should remain small enough to be repeatable and robust during the final demo.

To align with the course emphasis on both IaaS and PaaS, the project can optionally include an infrastructure note or a lightweight deployment experiment based on VMs provisioned through OpenNebula. However, the project should not depend on a complex OpenNebula setup in order to be successful. The main implementation value lies in the platform itself: ingestion, storage, analytics, orchestration, and security.

This balance is important. A project that is too infrastructure-heavy risks becoming difficult to complete and difficult to demonstrate reliably. A project that is only a frontend, on the other hand, risks being too shallow. PolliSense aims to stay in the middle: realistic, technically rich, but still achievable.

## 9. Expected Results
By the end of the implementation, the project is expected to demonstrate a functional prototype with the following properties.

First, the frontend dashboard should retrieve data from the backend rather than relying only on embedded mock values. Second, the simulator should continuously or periodically inject realistic processed records into the backend. Third, the backend should store and serve both ecological and device-health information. Fourth, the dashboard should visibly reflect not only biological activity but also system reliability and alert conditions. Fifth, the system should run as a containerized deployment with at least one explicit security policy in place.

The final result will therefore be more than a graphical prototype. It will be a small but coherent cloud-native platform that shows how field-device logic, backend services, and researcher-facing analytics can be integrated before complete hardware deployment.

## 10. Evaluation and Demo Strategy
The project will be evaluated mainly through a live demonstration and code inspection. For this reason, the implementation should prioritize robustness and clarity over unnecessary feature expansion.

A possible demo flow is the following. The presentation begins with the Overview page to introduce the dashboard as a researcher interface built around processed data rather than raw video. It then moves to the Activity and Environment sections to show supported target-group filtering and ecological context. Next, it moves to the Status section to emphasize the role of operational continuity and station health. Finally, the Research Preferences section is used to show the configurable layer built on top of the shared scientific baseline.

To make the demo more dynamic, the simulator can be used to inject new records or trigger a fault scenario such as low battery or connectivity degradation. This allows the team to show that the system reacts to changing input, rather than simply displaying static data.

## 11. Limitations and Future Work
The project has several intentional limitations. It does not implement full species-level classification. It does not expose raw video streams. It does not claim to replace final hardware integration. It also does not aim to become a fully distributed microservice architecture at this stage.

These limitations are deliberate and appropriate for the project scope. The current goal is to validate workflow, backend integration, cloud-native deployment, and researcher-oriented monitoring logic. Once these are stable, future work could extend the project in several directions. One direction is full integration with the actual modular hardware stack. Another is validation sessions with researchers to refine trust indicators, data quality views, and interface priorities. A third is a gradual evolution of the backend into more explicitly separated services if system complexity grows. A fourth is stronger infrastructure integration using OpenNebula-provisioned environments.

## 12. Conclusion
PolliSense is best understood as a cloud-native prototype for field-monitoring workflow validation. Its value does not lie in claiming a finished product, but in showing how modular edge devices, processed ecological records, infrastructure health data, backend services, and a researcher-facing dashboard can be brought together coherently.

By combining a dashboard prototype with a real backend, a realistic simulator, secure containerized deployment, and persistent storage, the project becomes substantial enough to demonstrate the technologies and concepts expected in the course. At the same time, it remains feasible for a two-person team within the available time. In this sense, PolliSense is both a practical software implementation and a systems-oriented study of how reliable ecological monitoring could be supported by cloud-native design.
