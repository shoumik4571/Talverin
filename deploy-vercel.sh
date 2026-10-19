#!/usr/bin/env bash
set -euo pipefail

export PATH="$HOME/.local/node/node-v22.17.0-darwin-arm64/bin:$PATH"
cd "$(dirname "$0")"

echo "🚀 Preparing Talverin Next.js App for Vercel Deployment..."
npx vercel --prod
