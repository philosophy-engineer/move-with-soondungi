# Production deployment (domain-variable setup)

This directory contains templates and automation for:

- Vercel Web (`https://<PUBLIC_WEB_DOMAIN>`)
- EC2 API origin (`https://<API_ORIGIN_DOMAIN>`) with host Nginx
- API container runtime via Docker Compose
- Host PostgreSQL 18 and Cloudflare R2

## 1) Required DNS records

- `<PUBLIC_WEB_DOMAIN>` -> Vercel
- `<API_ORIGIN_DOMAIN>` -> EC2 Elastic IP

`<API_ORIGIN_DOMAIN>` is internal for rewrites. End users should call only `/api/*` on `<PUBLIC_WEB_DOMAIN>`.

## 2) Vercel env variables

Set these in the Vercel project:

- `NEXT_PUBLIC_API_BASE_URL=https://<PUBLIC_WEB_DOMAIN>`
- `API_ORIGIN_URL=https://<API_ORIGIN_DOMAIN>`

## 3) API runtime env file on EC2

```bash
mkdir -p /opt/soondungi/api
cp infra/prod/.env.api.template /opt/soondungi/api/.env.api
# then fill all placeholders
```

## 4) Nginx host config

Use template: `infra/prod/nginx/origin.conf.template`

Required points:

- `server_name <API_ORIGIN_DOMAIN>`
- TLS termination on host Nginx
- proxy to `127.0.0.1:4000`
- allow only `/api/` and `/healthz`

## 5) First-time deploy on EC2

```bash
cd /opt/soondungi/api
cp <repo>/infra/prod/docker-compose.api.yml .
# API_IMAGE can be overridden by CI; keep a safe default in .env.api
API_IMAGE=ghcr.io/<OWNER>/soondungi-api:latest docker compose -f docker-compose.api.yml up -d
```

## 6) GitHub Actions secrets

Set these repository secrets:

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `GHCR_USERNAME`
- `GHCR_TOKEN`

Workflow file:

- `.github/workflows/deploy-api.yml`

Push to `main` triggers build/deploy.
Manual rollback is available via `workflow_dispatch` input `rollback_image`.

## 7) PostgreSQL backup cron

Script: `infra/prod/scripts/backup-postgres.sh`

Example cron (daily 03:10):

```cron
10 3 * * * BACKUP_DIR=/opt/soondungi/backups DB_NAME=<DB_NAME> DB_USER=<DB_USER> PGPASSWORD=<DB_PASSWORD> /opt/soondungi/repo/infra/prod/scripts/backup-postgres.sh >> /opt/soondungi/logs/backup.log 2>&1
```
