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
- S3 API (MinIO)
  - URL: `http://localhost:9000` (or `S3_API_PORT`)
- S3 Console (MinIO)
  - URL: `http://localhost:9001` (or `S3_CONSOLE_PORT`)
  - Access key / Secret key: `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
  - Bucket: `S3_BUCKET` (auto-created by `minio-init`)

## 4) CORS and public-read policy

`minio-init` configures these automatically for local development:

- Bucket auto-create (`S3_BUCKET`)
- Public read (`mc anonymous set download`)
- CORS allow origin: `S3_WEB_ORIGIN`
- CORS methods: `GET`, `PUT`, `HEAD`

For AWS S3 / Cloudflare R2, apply equivalent CORS and public-read policy through each provider's bucket settings.

## 5) Stop / Cleanup

```bash
docker compose -f infra/dev/docker-compose.yml --env-file infra/dev/.env down
```

Remove volumes too:

```bash
docker compose -f infra/dev/docker-compose.yml --env-file infra/dev/.env down -v
```
