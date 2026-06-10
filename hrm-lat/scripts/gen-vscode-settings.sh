#!/usr/bin/env bash
set -euo pipefail

# Find project root by looking for package.json
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
while [[ "$ROOT_DIR" != "/" ]]; do
  if [[ -f "$ROOT_DIR/package.json" ]]; then
    break
  fi
  ROOT_DIR="$(dirname "$ROOT_DIR")"
done

if [[ "$ROOT_DIR" == "/" ]]; then
  echo "Error: Could not find project root (package.json not found)" >&2
  exit 1
fi

VSCODE_DIR="$ROOT_DIR/.vscode"
SETTINGS_FILE="$VSCODE_DIR/settings.json"

mkdir -p "$VSCODE_DIR"

cat > "$SETTINGS_FILE" <<'JSON'
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "editor.tabSize": 2,
  "files.watcherExclude": {
    "**/routeTree.gen.ts": true
  },
  "search.exclude": {
    "**/routeTree.gen.ts": true
  },
  "files.readonlyInclude": {
    "**/routeTree.gen.ts": true
  }
}
JSON

echo "Wrote $SETTINGS_FILE"


