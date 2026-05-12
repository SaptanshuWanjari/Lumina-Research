#!/usr/bin/env bash
set -euo pipefail

# Required env:
# API_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, EMAIL, PASSWORD

require_env() {
  local key="$1"
  if [[ -z "${!key:-}" ]]; then
    echo "Missing required environment variable: $key" >&2
    exit 1
  fi
}

json_get() {
  local json_input="$1"
  local field_path="$2"
  python3 - "$json_input" "$field_path" <<'PY'
import json
import sys

raw = sys.argv[1] if len(sys.argv) > 1 else ""
path = sys.argv[2].split(".") if len(sys.argv) > 2 else []
if not raw.strip():
    print("")
    raise SystemExit(0)
try:
    data = json.loads(raw)
except json.JSONDecodeError:
    print("")
    raise SystemExit(0)

for part in path:
    if part.endswith("]") and "[" in part:
        name, idx = part[:-1].split("[", 1)
        if name:
            data = data.get(name, [])
        data = data[int(idx)] if isinstance(data, list) and len(data) > int(idx) else ""
    elif isinstance(data, dict):
        data = data.get(part, "")
    else:
        data = ""
        break

print("" if data is None else data)
PY
}

require_env API_BASE_URL
require_env SUPABASE_URL
require_env SUPABASE_ANON_KEY
require_env EMAIL
require_env PASSWORD

API_BASE_URL="${API_BASE_URL%/}"
POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-2}"
SOURCE_TIMEOUT_SECONDS="${SOURCE_TIMEOUT_SECONDS:-120}"
RUN_TIMEOUT_SECONDS="${RUN_TIMEOUT_SECONDS:-240}"

token_body="$(curl -sS -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")"
TOKEN="$(json_get "$token_body" "access_token")"
if [[ -z "$TOKEN" ]]; then
  echo "Failed to get token" >&2
  echo "$token_body" >&2
  exit 1
fi

me_tmp="$(mktemp)"
me_status="$(curl -sS -o "$me_tmp" -w "%{http_code}" -H "Authorization: Bearer ${TOKEN}" "${API_BASE_URL}/api/v1/me")"
me_body="$(cat "$me_tmp")"
rm -f "$me_tmp"
if [[ "$me_status" -lt 200 || "$me_status" -ge 300 ]]; then
  echo "Failed API token check on /api/v1/me" >&2
  echo "HTTP ${me_status}" >&2
  echo "$me_body" >&2
  exit 1
fi

case_tmp="$(mktemp)"
case_status="$(curl -sS -o "$case_tmp" -w "%{http_code}" -X POST "${API_BASE_URL}/api/v1/cases/" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Simple smoke test","question":"Should we expand into a new market?","priority":"normal","tags":["simple-smoke"]}')"
case_body="$(cat "$case_tmp")"
rm -f "$case_tmp"
CASE_ID="$(json_get "$case_body" "id")"
if [[ "$case_status" -lt 200 || "$case_status" -ge 300 || -z "$CASE_ID" ]]; then
  echo "Failed to create case" >&2
  echo "HTTP ${case_status}" >&2
  echo "$case_body" >&2
  exit 1
fi

tmp_file="$(mktemp /tmp/lumina-simple-XXXXXX.txt)"
trap 'rm -f "$tmp_file"' EXIT
printf '%s\n' "Regional demand is rising. Logistics speed affects retention." >"$tmp_file"

source_body="$(curl -sS -X POST "${API_BASE_URL}/api/v1/cases/${CASE_ID}/sources" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@${tmp_file};type=text/plain")"
SOURCE_ID="$(json_get "$source_body" "id")"
if [[ -z "$SOURCE_ID" ]]; then
  echo "Failed to upload source" >&2
  echo "$source_body" >&2
  exit 1
fi

SOURCE_STATUS="pending"
source_deadline=$((SECONDS + SOURCE_TIMEOUT_SECONDS))
while true; do
  sources_body="$(curl -sS -H "Authorization: Bearer ${TOKEN}" \
    "${API_BASE_URL}/api/v1/cases/${CASE_ID}/sources")"
  SOURCE_STATUS="$(python3 - "$sources_body" "$SOURCE_ID" <<'PY'
import json
import sys

raw = sys.argv[1] if len(sys.argv) > 1 else ""
source_id = sys.argv[2] if len(sys.argv) > 2 else ""
try:
    rows = json.loads(raw) if raw.strip() else []
except json.JSONDecodeError:
    rows = []
status = ""
if isinstance(rows, list):
    for row in rows:
        if str(row.get("id")) == source_id:
            status = row.get("status") or ""
            break
print(status)
PY
)"
  if [[ "$SOURCE_STATUS" == "indexed" || "$SOURCE_STATUS" == "failed" ]]; then
    break
  fi
  if (( SECONDS >= source_deadline )); then
    echo "Source polling timed out (last status: ${SOURCE_STATUS})" >&2
    exit 1
  fi
  sleep "$POLL_INTERVAL_SECONDS"
done

run_body="$(curl -sS -X POST "${API_BASE_URL}/api/v1/cases/${CASE_ID}/runs" \
  -H "Authorization: Bearer ${TOKEN}")"
RUN_ID="$(json_get "$run_body" "id")"
if [[ -z "$RUN_ID" ]]; then
  echo "Failed to start run" >&2
  echo "$run_body" >&2
  exit 1
fi

RUN_STATUS="queued"
run_deadline=$((SECONDS + RUN_TIMEOUT_SECONDS))
while true; do
  run_state_body="$(curl -sS -H "Authorization: Bearer ${TOKEN}" \
    "${API_BASE_URL}/api/v1/cases/${CASE_ID}/runs/${RUN_ID}")"
  RUN_STATUS="$(json_get "$run_state_body" "status")"
  case "$RUN_STATUS" in
    needs_review)
      curl -sS -X POST "${API_BASE_URL}/api/v1/runs/${RUN_ID}/approve" \
        -H "Authorization: Bearer ${TOKEN}" >/dev/null
      ;;
    failed|complete|completed|published|success|succeeded)
      break
      ;;
  esac
  if (( SECONDS >= run_deadline )); then
    echo "Run polling timed out (last status: ${RUN_STATUS})" >&2
    exit 1
  fi
  sleep "$POLL_INTERVAL_SECONDS"
done

echo "OK"
echo "CASE_ID=${CASE_ID}"
echo "SOURCE_ID=${SOURCE_ID}"
echo "SOURCE_STATUS=${SOURCE_STATUS}"
echo "RUN_ID=${RUN_ID}"
echo "RUN_STATUS=${RUN_STATUS}"
