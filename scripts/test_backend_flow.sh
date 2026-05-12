#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Run the backend API smoke flow end-to-end:
1) Get Supabase access token
2) Create case
3) Upload source and wait for indexing
4) Start run and wait for status
5) Auto-approve run if it pauses for review (optional)

Required by default:
  API_BASE_URL
  SUPABASE_URL
  SUPABASE_ANON_KEY
  EMAIL
  PASSWORD

Alternative auth input:
  TOKEN (if set, skips login)

Optional:
  CASE_TITLE              (default: Manual backend test)
  CASE_QUESTION           (default: Should we expand into a new market?)
  CASE_PRIORITY           (default: normal; low|normal|high|urgent, or -1|0|1|2)
  CASE_TAG                (default: manual-test)
  SOURCE_FILE             (default: auto-generated temp file)
  POLL_INTERVAL_SECONDS   (default: 2)
  SOURCE_TIMEOUT_SECONDS  (default: 120)
  RUN_TIMEOUT_SECONDS     (default: 240)
  APPROVE_ON_REVIEW       (default: 1)

Auto-seed shortcut:
  AUTO_SEED_USERS=1
  SUPABASE_SERVICE_ROLE_KEY (required when AUTO_SEED_USERS=1 and EMAIL/PASSWORD absent)
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_env() {
  local key="$1"
  if [[ -z "${!key:-}" ]]; then
    echo "Missing required environment variable: $key" >&2
    exit 1
  fi
}

assert_cloud_supabase_url() {
  local url="$1"
  if [[ "$url" =~ ^https://[^/]+\.supabase\.co/?$ ]]; then
    return 0
  fi
  echo "SUPABASE_URL must be your cloud project URL (https://<project-ref>.supabase.co)" >&2
  exit 1
}

json_get() {
  local field_path="$1"
  local json_input
  json_input="$(cat)"
  python3 - "$field_path" "$json_input" <<'PY'
import json
import sys

path = sys.argv[1].split(".")
raw = sys.argv[2] if len(sys.argv) > 2 else ""
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
        data = data[int(idx)] if len(data) > int(idx) else ""
    elif isinstance(data, dict):
        data = data.get(part, "")
    else:
        data = ""
        break
print("" if data is None else data)
PY
}

call_json() {
  local method="$1"
  local url="$2"
  local data="$3"
  shift 3

  local tmp_file
  tmp_file="$(mktemp)"

  local status
  if [[ -n "$data" ]]; then
    status="$(curl -sS -o "$tmp_file" -w "%{http_code}" -X "$method" "$url" "$@" -H "Content-Type: application/json" -d "$data")"
  else
    status="$(curl -sS -o "$tmp_file" -w "%{http_code}" -X "$method" "$url" "$@")"
  fi

  local body
  body="$(cat "$tmp_file")"
  rm -f "$tmp_file"

  if [[ "$status" -lt 200 || "$status" -ge 300 ]]; then
    echo "HTTP ${status} for ${method} ${url}" >&2
    echo "$body" >&2
    exit 1
  fi

  printf '%s' "$body"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

require_cmd curl
require_cmd python3

API_BASE_URL="${API_BASE_URL:-}"
require_env API_BASE_URL
API_BASE_URL="${API_BASE_URL%/}"
CASE_TITLE="${CASE_TITLE:-Manual backend test}"
CASE_QUESTION="${CASE_QUESTION:-Should we expand into a new market?}"
CASE_PRIORITY="${CASE_PRIORITY:-normal}"
CASE_TAG="${CASE_TAG:-manual-test}"
POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-2}"
SOURCE_TIMEOUT_SECONDS="${SOURCE_TIMEOUT_SECONDS:-120}"
RUN_TIMEOUT_SECONDS="${RUN_TIMEOUT_SECONDS:-240}"
APPROVE_ON_REVIEW="${APPROVE_ON_REVIEW:-1}"

for numeric_var in POLL_INTERVAL_SECONDS SOURCE_TIMEOUT_SECONDS RUN_TIMEOUT_SECONDS; do
  value="${!numeric_var}"
  if ! [[ "$value" =~ ^[0-9]+$ ]] || [[ "$value" -lt 1 ]]; then
    echo "${numeric_var} must be a positive integer" >&2
    exit 1
  fi
done

TEMP_SOURCE_FILE=""
TEMP_SEED_ENV=""
cleanup() {
  if [[ -n "$TEMP_SOURCE_FILE" && -f "$TEMP_SOURCE_FILE" ]]; then
    rm -f "$TEMP_SOURCE_FILE"
  fi
  if [[ -n "$TEMP_SEED_ENV" && -f "$TEMP_SEED_ENV" ]]; then
    rm -f "$TEMP_SEED_ENV"
  fi
}
trap cleanup EXIT

if [[ -z "${TOKEN:-}" && ("${AUTO_SEED_USERS:-0}" == "1") && ( -z "${EMAIL:-}" || -z "${PASSWORD:-}" ) ]]; then
  require_env SUPABASE_URL
  assert_cloud_supabase_url "$SUPABASE_URL"
  require_env SUPABASE_SERVICE_ROLE_KEY
  TEMP_SEED_ENV="$(mktemp)"
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  "${script_dir}/seed.sh" --count 1 --output "$TEMP_SEED_ENV"
  # shellcheck disable=SC1090
  source "$TEMP_SEED_ENV"
  EMAIL="${PRIMARY_TEST_EMAIL}"
  PASSWORD="${PRIMARY_TEST_PASSWORD}"
fi

health_ok=0
last_health_status=""
for health_path in "/health" "/api/v1/health"; do
  if health_status="$(curl -sS -o /dev/null -w "%{http_code}" "${API_BASE_URL}${health_path}")"; then
    last_health_status="$health_status"
    if [[ "$health_status" -ge 200 && "$health_status" -lt 300 ]]; then
      health_ok=1
      break
    fi
  else
    last_health_status="curl_error"
  fi
done
if [[ "$health_ok" -ne 1 ]]; then
  echo "API health check failed for ${API_BASE_URL} (status: ${last_health_status}). Set API_BASE_URL to your deployed FastAPI base URL." >&2
  exit 1
fi

if [[ -z "${TOKEN:-}" ]]; then
  require_env SUPABASE_URL
  assert_cloud_supabase_url "$SUPABASE_URL"
  require_env SUPABASE_ANON_KEY
  require_env EMAIL
  require_env PASSWORD

  token_payload="$(python3 - "$EMAIL" "$PASSWORD" <<'PY'
import json
import sys
print(json.dumps({"email": sys.argv[1], "password": sys.argv[2]}))
PY
)"

  token_body="$(call_json POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" "$token_payload" -H "apikey: ${SUPABASE_ANON_KEY}")"
  TOKEN="$(printf '%s' "$token_body" | json_get "access_token")"
  if [[ -z "$TOKEN" ]]; then
    echo "Failed to get access token" >&2
    echo "$token_body" >&2
    exit 1
  fi
fi

case_payload="$(python3 - "$CASE_TITLE" "$CASE_QUESTION" "$CASE_PRIORITY" "$CASE_TAG" <<'PY'
import json
import sys
title, question, priority, tag = sys.argv[1:]
priority_str = str(priority).strip().lower()
priority_map = {
    "-1": "low",
    "0": "normal",
    "1": "high",
    "2": "urgent",
}
priority_value = priority_map.get(priority_str, priority_str)
allowed = {"low", "normal", "high", "urgent"}
if priority_value not in allowed:
    raise SystemExit("CASE_PRIORITY must be low|normal|high|urgent, or -1|0|1|2")
payload = {
    "title": title,
    "question": question,
    "priority": priority_value,
    "tags": [tag] if tag else [],
}
print(json.dumps(payload))
PY
)"

case_body="$(call_json POST "${API_BASE_URL}/api/v1/cases/" "$case_payload" -H "Authorization: Bearer ${TOKEN}")"
CASE_ID="$(printf '%s' "$case_body" | json_get "id")"
if [[ -z "$CASE_ID" ]]; then
  echo "Case creation did not return an id" >&2
  echo "$case_body" >&2
  exit 1
fi

if [[ -z "${SOURCE_FILE:-}" ]]; then
  TEMP_SOURCE_FILE="$(mktemp /tmp/lumina-source-XXXXXX.txt)"
  SOURCE_FILE="$TEMP_SOURCE_FILE"
  printf '%s\n' "Regional demand is rising. Logistics speed affects retention. Early market entry has upside if operations are reliable." > "$SOURCE_FILE"
fi

if [[ ! -f "$SOURCE_FILE" ]]; then
  echo "SOURCE_FILE does not exist: $SOURCE_FILE" >&2
  exit 1
fi

upload_tmp="$(mktemp)"
upload_status="$(curl -sS -o "$upload_tmp" -w "%{http_code}" -X POST \
  "${API_BASE_URL}/api/v1/cases/${CASE_ID}/sources" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@${SOURCE_FILE};type=text/plain")"
upload_body="$(cat "$upload_tmp")"
rm -f "$upload_tmp"

if [[ "$upload_status" -lt 200 || "$upload_status" -ge 300 ]]; then
  echo "Source upload failed (HTTP ${upload_status})" >&2
  echo "$upload_body" >&2
  exit 1
fi

SOURCE_ID="$(printf '%s' "$upload_body" | json_get "id")"
if [[ -z "$SOURCE_ID" ]]; then
  echo "Source upload did not return an id" >&2
  echo "$upload_body" >&2
  exit 1
fi

SOURCE_STATUS="pending"
source_deadline=$((SECONDS + SOURCE_TIMEOUT_SECONDS))
while true; do
  sources_body="$(call_json GET "${API_BASE_URL}/api/v1/cases/${CASE_ID}/sources" "" -H "Authorization: Bearer ${TOKEN}")"
  SOURCE_STATUS="$(python3 - "$SOURCE_ID" "$sources_body" <<'PY'
import json
import sys

source_id = sys.argv[1]
raw = sys.argv[2] if len(sys.argv) > 2 else ""
if not raw.strip():
    print("")
    raise SystemExit(0)
try:
    rows = json.loads(raw)
except json.JSONDecodeError:
    print("")
    raise SystemExit(0)
status = ""
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
    echo "Timed out waiting for source indexing; last status: ${SOURCE_STATUS}" >&2
    exit 1
  fi
  sleep "$POLL_INTERVAL_SECONDS"
done

if [[ "$SOURCE_STATUS" == "failed" ]]; then
  echo "Source ingestion failed for source ${SOURCE_ID}" >&2
  exit 1
fi

run_body="$(call_json POST "${API_BASE_URL}/api/v1/cases/${CASE_ID}/runs" "" -H "Authorization: Bearer ${TOKEN}")"
RUN_ID="$(printf '%s' "$run_body" | json_get "id")"
if [[ -z "$RUN_ID" ]]; then
  echo "Run creation did not return an id" >&2
  echo "$run_body" >&2
  exit 1
fi

RUN_STATUS="queued"
run_deadline=$((SECONDS + RUN_TIMEOUT_SECONDS))
while true; do
  run_state_body="$(call_json GET "${API_BASE_URL}/api/v1/cases/${CASE_ID}/runs/${RUN_ID}" "" -H "Authorization: Bearer ${TOKEN}")"
  RUN_STATUS="$(printf '%s' "$run_state_body" | json_get "status")"
  case "$RUN_STATUS" in
    needs_review|failed|complete|completed|published|success|succeeded)
      break
      ;;
  esac
  if (( SECONDS >= run_deadline )); then
    echo "Timed out waiting for run progress; last status: ${RUN_STATUS}" >&2
    exit 1
  fi
  sleep "$POLL_INTERVAL_SECONDS"
done

if [[ "$RUN_STATUS" == "failed" ]]; then
  echo "Run failed for run ${RUN_ID}" >&2
  exit 1
fi

if [[ "$RUN_STATUS" == "needs_review" && "$APPROVE_ON_REVIEW" != "0" ]]; then
  call_json POST "${API_BASE_URL}/api/v1/runs/${RUN_ID}/approve" "" -H "Authorization: Bearer ${TOKEN}" >/dev/null

  run_deadline=$((SECONDS + RUN_TIMEOUT_SECONDS))
  while true; do
    run_state_body="$(call_json GET "${API_BASE_URL}/api/v1/cases/${CASE_ID}/runs/${RUN_ID}" "" -H "Authorization: Bearer ${TOKEN}")"
    RUN_STATUS="$(printf '%s' "$run_state_body" | json_get "status")"
    case "$RUN_STATUS" in
      failed|complete|completed|published|success|succeeded|needs_review)
        break
        ;;
    esac
    if (( SECONDS >= run_deadline )); then
      echo "Timed out waiting after approval; last status: ${RUN_STATUS}" >&2
      exit 1
    fi
    sleep "$POLL_INTERVAL_SECONDS"
  done

  if [[ "$RUN_STATUS" == "failed" ]]; then
    echo "Run failed after approval for run ${RUN_ID}" >&2
    exit 1
  fi
fi

echo "Backend flow completed."
echo "CASE_ID=${CASE_ID}"
echo "SOURCE_ID=${SOURCE_ID}"
echo "SOURCE_STATUS=${SOURCE_STATUS}"
echo "RUN_ID=${RUN_ID}"
echo "RUN_STATUS=${RUN_STATUS}"
echo "Check LangSmith projects:"
echo "  - lumina-research-worker"
echo "  - lumina-research-orchestrator"
