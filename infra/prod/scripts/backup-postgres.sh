#!/usr/bin/env bash
set -euo pipefail

: "${BACKUP_DIR:?BACKUP_DIR is required}"
: "${DB_NAME:?DB_NAME is required}"
: "${DB_USER:?DB_USER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"

RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
FILENAME="${DB_NAME}-${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

pg_dump \
  --host=127.0.0.1 \
  --port=5432 \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --format=plain \
  --no-owner \
  --no-privileges \
  | gzip > "$BACKUP_DIR/$FILENAME"

find "$BACKUP_DIR" -type f -name "${DB_NAME}-*.sql.gz" -mtime "+$RETENTION_DAYS" -delete

echo "Backup complete: $BACKUP_DIR/$FILENAME"
