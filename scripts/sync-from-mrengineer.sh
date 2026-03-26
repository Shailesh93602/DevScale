#!/bin/bash
# ============================================================
# Sync MrEngineer (Exavel) to EduScale (Personal)
# ============================================================

set -e

SOURCE_DIR="/Users/shaileshchaudhary/Desktop/Coding/Development/Exavel/MrEngineer/"
TARGET_DIR="/Users/shaileshchaudhary/Desktop/Coding/EduScale/"

echo "🔄 Syncing code from $SOURCE_DIR to $TARGET_DIR..."

rsync -vai --delete \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='playwright-report/' \
  --exclude='.env*' \
  --exclude='dist/' \
  --exclude='build/' \
  --exclude='test-results/' \
  --exclude='.DS_Store' \
  --exclude='scripts/sync-from-mrengineer.sh' \
  --exclude='scripts/apply-branding.sh' \
  "$SOURCE_DIR" "$TARGET_DIR" > /dev/null

echo "✅ Sync complete."
echo "🎨 Applying branding overrides..."

source "$TARGET_DIR/scripts/apply-branding.sh"
