#!/bin/zsh
set -euo pipefail
umask 077

PLIST_PATH="${HOME}/Library/LaunchAgents/com.claudia.editor-preview-server.plist"
SERVICE_NAME="claudia-editor-token"

if /usr/bin/security find-generic-password -a "${USER}" -s "${SERVICE_NAME}" >/dev/null 2>&1; then
  print "keychain-ready"
  exit 0
fi

if [[ ! -f "${PLIST_PATH}" ]]; then
  print -u2 "Plist editor precedente non trovato"
  exit 1
fi

legacy_command="$(/usr/bin/plutil -extract ProgramArguments.2 raw "${PLIST_PATH}")"
if [[ "${legacy_command}" != *"PUBLIC_EDITOR_TOKEN="* ]]; then
  print -u2 "Token editor non presente nel plist precedente"
  exit 1
fi

editor_token="${legacy_command#*PUBLIC_EDITOR_TOKEN=}"
editor_token="${editor_token%% *}"
if [[ ${#editor_token} -lt 32 ]]; then
  print -u2 "Token editor non valido"
  exit 1
fi

/usr/bin/security add-generic-password -U -a "${USER}" -s "${SERVICE_NAME}" -w "${editor_token}" >/dev/null
unset editor_token legacy_command

/usr/bin/security find-generic-password -a "${USER}" -s "${SERVICE_NAME}" >/dev/null 2>&1
print "keychain-ready"
