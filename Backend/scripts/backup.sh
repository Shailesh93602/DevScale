#!/bin/bash

# Database backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/database"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup PostgreSQL database
pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz s3://$BACKUP_BUCKET/database/

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete 