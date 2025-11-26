#!/bin/bash

# Deployment script for vanilla shell
# Usage: ./scripts/deploy.sh [dev|staging|prod]

set -e

ENVIRONMENT=${1:-dev}

echo "🚀 Building vanilla shell for environment: $ENVIRONMENT"

# Copy the appropriate manifest
if [ -f "public/federation.manifest.$ENVIRONMENT.json" ]; then
  echo "📋 Using federation.manifest.$ENVIRONMENT.json"
  cp "public/federation.manifest.$ENVIRONMENT.json" "public/federation.manifest.json"
else
  echo "⚠️  Warning: federation.manifest.$ENVIRONMENT.json not found, using existing manifest"
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Display build info
echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Build output:"
ls -lh dist/

echo ""
echo "📋 Federation manifest:"
cat dist/federation.manifest.json

echo ""
echo "🎉 Ready to deploy the dist/ directory to your hosting service"
