#!/bin/sh
set -eu
export PATH="$HOME/.local/node/node-v22.17.0-darwin-arm64/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

if [ ! -d "node_modules/next" ]; then
  npm install
fi

exec npm run dev -- -p 3000
