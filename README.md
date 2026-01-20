# K3s Backend API

A RESTful API built with Express.js and TypeScript for managing Kubernetes pods, services, and ingresses on k3s clusters, including resource limits and domain assignment.

## Prerequisites

- Node.js 18+
- k3s cluster running and accessible
- Kubeconfig file at `~/.kube/config` or `KUBECONFIG` environment variable set

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```

### Namespaces
```
GET /api/namespaces          # List all namespaces
GET /api/namespaces/:name    # Get namespace details
```

### Pods
```
GET    /api/pods                      # List all pods
GET    /api/pods?namespace=default    # List pods in namespace
GET    /api/pods/:namespace/:name     # Get pod details
POST   /api/pods                      # Create pod with resource limits
PATCH  /api/pods/:namespace/:name     # Update pod labels
DELETE /api/pods/:namespace/:name     # Delete pod
```

### Services
```
GET    /api/services                      # List all services
GET    /api/services?namespace=default    # List services in namespace
GET    /api/services/:namespace/:name     # Get service details
POST   /api/services                      # Create service
DELETE /api/services/:namespace/:name     # Delete service
```

### Ingresses (Domain Assignment)
```
GET    /api/ingresses                      # List all ingresses
GET    /api/ingresses?namespace=default    # List ingresses in namespace
GET    /api/ingresses/:namespace/:name     # Get ingress details
POST   /api/ingresses                      # Create ingress with domain
DELETE /api/ingresses/:namespace/:name     # Delete ingress
```

## Examples

### Create Pod with Resource Limits

```bash
curl -X POST http://localhost:3000/api/pods \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-nginx",
    "namespace": "default",
    "image": "nginx:alpine",
    "resources": {
      "requests": { "cpu": "50m", "memory": "64Mi" },
      "limits": { "cpu": "200m", "memory": "256Mi" }
    },
    "labels": { "app": "my-nginx" }
  }'
```

### Create Service for Pod

```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-nginx",
    "namespace": "default",
    "selector": { "app": "my-nginx" },
    "ports": [{ "port": 80, "targetPort": 80 }]
  }'
```

### Assign Domain via Ingress

```bash
curl -X POST http://localhost:3000/api/ingresses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-nginx",
    "namespace": "default",
    "rules": [{
      "host": "my-nginx.test",
      "paths": [{
        "path": "/",
        "pathType": "Prefix",
        "serviceName": "my-nginx",
        "servicePort": 80
      }]
    }]
  }'
```

After creating the ingress, access your app at: `http://my-nginx.test`

## Resource Units

- **CPU**: Specified in millicores (e.g., `100m` = 0.1 CPU, `1000m` = 1 CPU)
- **Memory**: Specified in bytes (e.g., `128Mi`, `1Gi`, `512M`)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `KUBECONFIG` | Path to kubeconfig file | `~/.kube/config` |

## License

MIT
