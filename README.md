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

### Ingresses (Domain Assignment with Traefik)
```
GET    /api/ingresses                      # List all ingresses
GET    /api/ingresses?namespace=default    # List ingresses in namespace
GET    /api/ingresses/:namespace/:name     # Get ingress details
POST   /api/ingresses                      # Create ingress with Traefik config
DELETE /api/ingresses/:namespace/:name     # Delete ingress
```

The API uses **Traefik** as the ingress controller with support for:
- Custom entry points (web, websecure)
- Middleware chains (headers, rate limiting, auth)
- Automatic TLS with Let's Encrypt
- Sticky sessions
- Router priorities

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

### Assign Domain via Ingress (Basic)

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

### Ingress with Traefik Features

#### HTTPS with Let's Encrypt

```bash
curl -X POST http://localhost:3000/api/ingresses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-app-secure",
    "namespace": "default",
    "rules": [{
      "host": "myapp.example.com",
      "paths": [{
        "path": "/",
        "pathType": "Prefix",
        "serviceName": "my-app",
        "servicePort": 80
      }]
    }],
    "traefik": {
      "entryPoints": ["websecure"],
      "certResolver": "letsencrypt"
    },
    "tls": [{
      "hosts": ["myapp.example.com"]
    }]
  }'
```

#### With Middlewares (Headers, Rate Limiting, etc.)

```bash
curl -X POST http://localhost:3000/api/ingresses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-app-advanced",
    "namespace": "default",
    "rules": [{
      "host": "api.example.com",
      "paths": [{
        "path": "/",
        "pathType": "Prefix",
        "serviceName": "my-api",
        "servicePort": 8080
      }]
    }],
    "traefik": {
      "entryPoints": ["websecure"],
      "certResolver": "letsencrypt",
      "middlewares": [
        "default-headers@kubernetescrd",
        "rate-limit@kubernetescrd"
      ],
      "priority": 100,
      "sticky": true,
      "passHostHeader": true
    },
    "tls": [{
      "hosts": ["api.example.com"]
    }]
  }'
```

#### HTTP to HTTPS Redirect

```bash
curl -X POST http://localhost:3000/api/ingresses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-app-redirect",
    "namespace": "default",
    "rules": [{
      "host": "myapp.example.com",
      "paths": [{
        "path": "/",
        "pathType": "Prefix",
        "serviceName": "my-app",
        "servicePort": 80
      }]
    }],
    "traefik": {
      "entryPoints": ["web", "websecure"],
      "certResolver": "letsencrypt",
      "middlewares": ["redirect-https@kubernetescrd"]
    },
    "tls": [{
      "hosts": ["myapp.example.com"]
    }]
  }'
```

## Resource Units

- **CPU**: Specified in millicores (e.g., `100m` = 0.1 CPU, `1000m` = 1 CPU)
- **Memory**: Specified in bytes (e.g., `128Mi`, `1Gi`, `512M`)

## Traefik Configuration

This API is designed to work with Traefik as the ingress controller. The following Traefik features are supported:

### Entry Points
- `web` - HTTP traffic (port 80)
- `websecure` - HTTPS traffic (port 443)

### Traefik Options

| Option | Type | Description | Example |
|--------|------|-------------|---------|
| `entryPoints` | string[] | Entry points to use | `["web", "websecure"]` |
| `middlewares` | string[] | Middleware chain to apply | `["default-headers@kubernetescrd"]` |
| `certResolver` | string | Let's Encrypt cert resolver | `"letsencrypt"` |
| `priority` | number | Router priority (higher = more priority) | `100` |
| `sticky` | boolean | Enable sticky sessions | `true` |
| `passHostHeader` | boolean | Pass host header to backend | `true` |

### Common Middleware Examples

Create these as Traefik Middleware CRDs in your cluster:

**HTTPS Redirect:**
```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: redirect-https
  namespace: default
spec:
  redirectScheme:
    scheme: https
    permanent: true
```

**Security Headers:**
```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: default-headers
  namespace: default
spec:
  headers:
    browserXssFilter: true
    contentTypeNosniff: true
    forceSTSHeader: true
    stsIncludeSubdomains: true
    stsPreload: true
    stsSeconds: 31536000
```

**Rate Limiting:**
```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: rate-limit
  namespace: default
spec:
  rateLimit:
    average: 100
    burst: 50
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `KUBECONFIG` | Path to kubeconfig file | `~/.kube/config` |

## License

MIT
