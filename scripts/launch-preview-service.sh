#!/bin/zsh
set -euo pipefail
umask 077

ROLE="${1:-}"
DEFAULT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="${CLAUDIA_SITE_ROOT:-${DEFAULT_ROOT}}"
NODE="/opt/homebrew/bin/node"
RUNTIME_DATA_DIR="${HOME}/Library/Application Support/ClaudiaSite"
LEGACY_ROOT_DIR="${HOME}/Desktop/Sito Web Claudia"
LEGACY_DATA_DIR="${LEGACY_ROOT_DIR}/data"

export PUBLIC_PREVIEW_HOST="127.0.0.1"
export PUBLIC_PREVIEW_DATA_DIR="${RUNTIME_DATA_DIR}"
export PUBLIC_PREVIEW_LEGACY_ROOT_DIR="${LEGACY_ROOT_DIR}"
export PUBLIC_PREVIEW_LEGACY_DATA_DIR="${LEGACY_DATA_DIR}"

cd "${ROOT}"

case "${ROLE}" in
  public)
    export PUBLIC_PREVIEW_PORT="4322"
    unset PUBLIC_EDITOR_HOST PUBLIC_EDITOR_TOKEN || true
    ;;
  editor)
    export PUBLIC_PREVIEW_PORT="4324"
    export PUBLIC_EDITOR_HOST="claudia-editor.alessandroguardascione.com"
    export PUBLIC_EDITOR_TOKEN="$(/usr/bin/security find-generic-password -a "${USER}" -s "claudia-editor-token" -w)"
    if [[ -z "${PUBLIC_EDITOR_TOKEN}" ]]; then
      print -u2 "Token editor assente nel Portachiavi"
      exit 1
    fi
    ;;
  *)
    print -u2 "Uso: $0 public|editor"
    exit 64
    ;;
esac

exec "${NODE}" scripts/public-preview-server.mjs
