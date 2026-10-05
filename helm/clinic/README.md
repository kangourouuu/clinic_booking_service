# Clinic Booking Helm Chart (Kubernetes & OpenShift)

A production-ready Helm chart to deploy the Clinic Booking microservices platform onto **Vanilla Kubernetes** (KinD, Minikube, EKS, GKE) or **Red Hat OpenShift** (Developer Sandbox, OpenShift Local, OCP).

---

## 📂 Chart Directory Structure

```
helm/clinic/
├── Chart.yaml                  # Chart metadata (name, version, dependencies)
├── values.yaml                 # Default configuration values for all components
├── README.md                   # This deployment and learning guide
└── templates/
    ├── _helpers.tpl            # Reusable naming and label templates
    ├── configmap.yaml          # Cluster hostnames, ports & routing endpoints
    ├── secret.yaml             # Encrypted credentials (DB passwords, Stripe, JWT)
    ├── deployment-gateway.yaml # Go API Gateway (:8080) reverse proxy & SPA server
    ├── service-gateway.yaml    # Gateway ClusterIP Service
    ├── deployment-services.yaml# Domain microservices (auth, catalog, booking, payment, medical)
    ├── service-services.yaml   # Internal ClusterIP Services for domain microservices
    ├── frontend.yaml           # React Vite frontend deployment & service
    ├── postgres.yaml           # PostgreSQL deployment, PVC storage & service
    ├── redis.yaml              # Redis cache & distributed lock deployment & service
    ├── rabbitmq.yaml           # RabbitMQ broker & management UI deployment & service
    ├── ingress.yaml            # Standard Kubernetes Ingress (NGINX/Traefik)
    ├── route.yaml              # OpenShift Native Route (with automatic edge TLS)
    └── hpa.yaml                # HorizontalPodAutoscaler (HPA) for booking-service
```

---

## 🚀 1. Inspecting & Validating Templates

Before deploying to any cluster, Helm allows you to lint and preview the rendered Kubernetes YAML:

### Validate Chart Syntax
```bash
helm lint helm/clinic
```

### Dry-Run & View Generated Kubernetes YAML
```bash
# Preview standard Kubernetes manifests
helm template clinic-booking helm/clinic

# Preview OpenShift-specific manifests (enabling native OpenShift Route)
helm template clinic-booking helm/clinic --set openshift.route.enabled=true
```

---

## ☸️ 2. Deploying to Local Kubernetes (KinD / Minikube)

### Step 1: Create a Namespace
```bash
kubectl create namespace clinic
```

### Step 2: Install the Release
```bash
helm install clinic-app helm/clinic \
  --namespace clinic \
  --set secrets.secretKey="my-local-secret-key"
```

### Step 3: Check Pod Status
```bash
kubectl get pods -n clinic
```

### Step 4: Access the API Gateway
Port-forward the API Gateway to your local machine:
```bash
kubectl port-forward svc/gateway-service 8080:8080 -n clinic
```
Now visit [http://localhost:8080](http://localhost:8080).

---

## 🔴 3. Deploying to Free Red Hat OpenShift Developer Sandbox

The [Red Hat Developer Sandbox](https://developers.redhat.com/developer-sandbox) gives you a free 30-day OpenShift 4 cluster in the cloud.

### Step 1: Login via OpenShift CLI (`oc`)
Copy the login command from your OpenShift Web Console (**Copy login command** under your username) and run:
```bash
oc login --token=<YOUR_TOKEN> --server=<YOUR_OPENSHIFT_API_URL>
```

### Step 2: Deploy Using Helm with OpenShift Route Enabled
OpenShift does not need an external Ingress Controller. By enabling `openshift.route.enabled=true`, OpenShift automatically creates an edge-terminated HTTPS URL for your application:

```bash
helm install clinic-app helm/clinic \
  --set openshift.route.enabled=true \
  --set ingress.enabled=false
```

### Step 3: View the OpenShift Public URL
```bash
oc get routes
```
OpenShift provides a public URL (e.g. `https://clinic-route-<your-namespace>.apps.sandbox.x8i4.p1.openshiftapps.com`) that can be opened directly from any browser in the world.

---

## ⚙️ 4. Useful Values Overrides

You can customize deployments without editing YAML files by using `--set`:

| Use Case | Command |
|---|---|
| **Scale Booking Service** | `helm upgrade clinic-app helm/clinic --set services.booking.replicaCount=4` |
| **Configure Stripe Keys** | `helm upgrade clinic-app helm/clinic --set secrets.stripeSecretKey="sk_test_..."` |
| **Disable Local Backing DB** *(Use Managed Cloud DB)* | `helm upgrade clinic-app helm/clinic --set postgres.enabled=false --set config.postgresHost="ep-xyz.neon.tech"` |
| **Enable OpenShift Route** | `helm upgrade clinic-app helm/clinic --set openshift.route.enabled=true` |

---

## 🧹 5. Uninstalling the Release

To cleanly tear down all pods, services, secrets, and routes:

```bash
helm uninstall clinic-app -n clinic
```
