#!/bin/zsh
set -euo pipefail
umask 077

PUBLIC_URL="https://claudia-preview.alessandroguardascione.com"
EDITOR_URL="https://claudia-editor.alessandroguardascione.com"
COOKIE_JAR="$(/usr/bin/mktemp -t claudia-editor-cookies)"
trap '/bin/rm -f "${COOKIE_JAR}"' EXIT

editor_token="$(/usr/bin/security find-generic-password -a "${USER}" -s "claudia-editor-token" -w)"

public_status="$(/usr/bin/curl -sS -o /dev/null -w '%{http_code}' "${PUBLIC_URL}/")"
collage_status="$(/usr/bin/curl -sS -o /dev/null -w '%{http_code}' "${PUBLIC_URL}/collage/")"
editor_hidden_status="$(/usr/bin/curl -sS -o /dev/null -w '%{http_code}' "${EDITOR_URL}/__editor/?page=collage")"
bootstrap_status="$(/usr/bin/curl -sS -o /dev/null -w '%{http_code}' -c "${COOKIE_JAR}" "${EDITOR_URL}/__editor/?page=collage&access=${editor_token}")"
editor_status="$(/usr/bin/curl -sS -o /dev/null -w '%{http_code}' -b "${COOKIE_JAR}" "${EDITOR_URL}/__editor/?page=collage")"
api_status="$(/usr/bin/curl -sS -o /dev/null -w '%{http_code}' -b "${COOKIE_JAR}" "${EDITOR_URL}/api/site-editor?page=collage")"
unset editor_token

[[ "${public_status}" == "200" ]]
[[ "${collage_status}" == "200" ]]
[[ "${editor_hidden_status}" == "404" ]]
[[ "${bootstrap_status}" == "302" ]]
[[ "${editor_status}" == "200" ]]
[[ "${api_status}" == "200" ]]

print "public=${public_status} collage=${collage_status} editor-hidden=${editor_hidden_status} editor-bootstrap=${bootstrap_status} editor=${editor_status} api=${api_status}"
