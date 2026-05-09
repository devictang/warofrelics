#!/bin/bash
# 神器戰爭 — Deploy script
# Run after git pull + npm install (if needed)

set -e
cd /root/.hermes/profiles/builder/home/projects/warofrelics

echo "🔨 Building..."
npm run build

echo "📦 Copying to web root..."
rm -rf /var/www/warofrelics/*
cp -r dist/* /var/www/warofrelics/
chown -R www-data:www-data /var/www/warofrelics/

echo "✅ Deploy complete: https://warofrelics.oyx.app"
