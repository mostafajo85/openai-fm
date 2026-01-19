#!/bin/bash
# Build Verification Script
# Run this to verify the fixes work correctly

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Installing Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm install

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Local Build Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build

echo ""
echo "✅ Local build succeeded!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Docker Build Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker build -t openai-fm:test .

echo ""
echo "✅ Docker build succeeded!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Docker Run Test (optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "To test the container, run:"
echo "  docker run -p 3000:3000 -e OPENAI_API_KEY=your_key openai-fm:test"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo "✅ All verification steps complete!"
