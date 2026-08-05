#!/bin/bash
# Healthcare Queue DB Backup Script
# Usage: ./backup.sh [output_dir]

set -e

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DB_NAME:-healthcare_queue_db}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5433}"
DB_USER="${DB_USER:-postgres}"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup of $DB_NAME..."

PGPASSWORD="${DB_PASSWORD:?DB_PASSWORD required}" pg_dump \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=custom \
  --compress=9 \
  -f "$BACKUP_DIR/healthcare_${TIMESTAMP}.dump"

echo "[$(date)] Backup completed: $BACKUP_DIR/healthcare_${TIMESTAMP}.dump"

# Keep only last 7 backups
cd "$BACKUP_DIR"
ls -t healthcare_*.dump 2>/dev/null | tail -n +8 | xargs -r rm --
echo "[$(date)] Old backups cleaned (keeping last 7)."
