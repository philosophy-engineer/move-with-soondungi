# Local Infra (dev)

## 1) Prepare env file

```bash
cp infra/dev/.env.template infra/dev/.env
```

## 2) Start services

Run from repository root:

```bash
docker compose -f infra/dev/docker-compose.yml --env-file infra/dev/.env up -d
```

## 3) Access

- PostgreSQL
  - Host: `localhost`
  - Port: `5432`
  - DB/User/Password: values from `infra/dev/.env`
- PGAdmin
  - URL: `http://localhost:5050`
  - Email/Password: `PGADMIN_DEFAULT_EMAIL`, `PGADMIN_DEFAULT_PASSWORD`
- MinIO API
  - URL: `http://localhost:9000`
- MinIO Console
  - URL: `http://localhost:9001`
  - ID/PW: `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`
  - Bucket: `MINIO_BUCKET` (auto-created by `minio-init`)

## 4) Stop / Cleanup

```bash
docker compose -f infra/dev/docker-compose.yml --env-file infra/dev/.env down
```

Remove volumes too:

```bash
docker compose -f infra/dev/docker-compose.yml --env-file infra/dev/.env down -v
```
