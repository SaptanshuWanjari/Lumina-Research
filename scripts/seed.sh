#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Seed fake Supabase auth users in a cloud Supabase project.

Required environment variables:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Optional environment variables:
  FAKE_USER_COUNT          (default: 3)
  FAKE_USER_PASSWORD       (default: LuminaTest123!)
  FAKE_USER_EMAIL_PREFIX   (default: lumina.test.user)
  FAKE_USER_EMAIL_DOMAIN   (default: example.com)
  FAKE_USER_DISPLAY_PREFIX (default: Lumina Test User)
  FAKE_USER_EMAIL_CONFIRM  (default: true)

Options:
  --count <n>        Number of users to seed
  --password <value> Password to set for every fake user
  --prefix <value>   Email prefix (before index)
  --domain <value>   Email domain
  --output <path>    Write generated credentials as env vars to a file
  --help             Show this help

Example:
  SUPABASE_URL=https://your-project-ref.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=... \
  ./scripts/seed.sh --count 2 --output /tmp/lumina-users.env
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

read_json_field() {
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

find_user_id_by_email() {
  local email="$1"
  local json_input="$2"
  python3 - "$email" "$json_input" <<'PY'
import json
import sys

target = (sys.argv[1] if len(sys.argv) > 1 else "").strip().lower()
raw = sys.argv[2] if len(sys.argv) > 2 else ""
if not target or not raw.strip():
    print("")
    raise SystemExit(0)

try:
    data = json.loads(raw)
except json.JSONDecodeError:
    print("")
    raise SystemExit(0)

users = data.get("users", [])
if not isinstance(users, list):
    print("")
    raise SystemExit(0)

for user in users:
    if not isinstance(user, dict):
        continue
    email = str(user.get("email") or "").strip().lower()
    if email == target:
        print(user.get("id") or "")
        raise SystemExit(0)

print("")
PY
}

FAKE_USER_COUNT="${FAKE_USER_COUNT:-3}"
FAKE_USER_PASSWORD="${FAKE_USER_PASSWORD:-LuminaTest123!}"
FAKE_USER_EMAIL_PREFIX="${FAKE_USER_EMAIL_PREFIX:-lumina.test.user}"
FAKE_USER_EMAIL_DOMAIN="${FAKE_USER_EMAIL_DOMAIN:-example.com}"
FAKE_USER_DISPLAY_PREFIX="${FAKE_USER_DISPLAY_PREFIX:-Lumina Test User}"
FAKE_USER_EMAIL_CONFIRM="${FAKE_USER_EMAIL_CONFIRM:-true}"
OUTPUT_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --count)
      FAKE_USER_COUNT="$2"
      shift 2
      ;;
    --password)
      FAKE_USER_PASSWORD="$2"
      shift 2
      ;;
    --prefix)
      FAKE_USER_EMAIL_PREFIX="$2"
      shift 2
      ;;
    --domain)
      FAKE_USER_EMAIL_DOMAIN="$2"
      shift 2
      ;;
    --output)
      OUTPUT_FILE="$2"
      shift 2
      ;;
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
require_env SUPABASE_URL
require_env SUPABASE_SERVICE_ROLE_KEY
assert_cloud_supabase_url "$SUPABASE_URL"

admin_headers=(
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY"
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
)

if ! [[ "$FAKE_USER_COUNT" =~ ^[0-9]+$ ]] || [[ "$FAKE_USER_COUNT" -lt 1 ]]; then
  echo "FAKE_USER_COUNT must be a positive integer" >&2
  exit 1
fi

declare -a SEEDED_EMAILS=()
declare -a SEEDED_IDS=()
declare -a SEEDED_ACTIONS=()

for i in $(seq 1 "$FAKE_USER_COUNT"); do
  email="${FAKE_USER_EMAIL_PREFIX}${i}@${FAKE_USER_EMAIL_DOMAIN}"
  display_name="${FAKE_USER_DISPLAY_PREFIX} ${i}"
  create_payload="$(python3 - "$email" "$FAKE_USER_PASSWORD" "$FAKE_USER_EMAIL_CONFIRM" "$display_name" <<'PY'
import json
import sys
email, password, confirm, display_name = sys.argv[1:]
print(json.dumps({
    "email": email,
    "password": password,
    "email_confirm": confirm.lower() == "true",
    "user_metadata": {"display_name": display_name},
}))
PY
  )"

  create_body="$(curl -sS -X POST \
    "${SUPABASE_URL}/auth/v1/admin/users" \
    "${admin_headers[@]}" \
    -H "Content-Type: application/json" \
    -d "$create_payload")"

  user_id="$(printf '%s' "$create_body" | read_json_field "id")"
  if [[ -n "$user_id" ]]; then
    action="created"
  else
    lookup_body="$(curl -sS -X GET \
      "${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=200" \
      "${admin_headers[@]}")"
    user_id="$(find_user_id_by_email "$email" "$lookup_body")"
    if [[ -z "$user_id" ]]; then
      echo "Failed creating or resolving user ${email}" >&2
      echo "$create_body" >&2
      exit 1
    fi

    update_payload="$(python3 - "$FAKE_USER_PASSWORD" "$FAKE_USER_EMAIL_CONFIRM" "$display_name" <<'PY'
import json
import sys
password, confirm, display_name = sys.argv[1:]
print(json.dumps({
    "password": password,
    "email_confirm": confirm.lower() == "true",
    "user_metadata": {"display_name": display_name},
}))
PY
)"

    update_body="$(curl -sS -X PUT \
      "${SUPABASE_URL}/auth/v1/admin/users/${user_id}" \
      "${admin_headers[@]}" \
      -H "Content-Type: application/json" \
      -d "$update_payload")"

    updated_id="$(printf '%s' "$update_body" | read_json_field "id")"
    if [[ -z "$updated_id" ]]; then
      echo "Failed updating user ${email}" >&2
      echo "$update_body" >&2
      exit 1
    fi
    action="updated"
  fi

  profile_payload="$(python3 - "$user_id" "$email" "$display_name" <<'PY'
import json
import sys
from datetime import datetime, timezone

user_id, email, display_name = sys.argv[1:]
now_iso = datetime.now(timezone.utc).isoformat()
print(json.dumps([{
    "user_id": user_id,
    "email": email,
    "display_name": display_name,
    "updated_at": now_iso,
}]))
PY
)"

  profile_tmp="$(mktemp)"
  profile_status="$(curl -sS -o "$profile_tmp" -w "%{http_code}" -X POST \
    "${SUPABASE_URL}/rest/v1/profiles?on_conflict=user_id" \
    "${admin_headers[@]}" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates,return=representation" \
    -d "$profile_payload")"
  profile_body="$(cat "$profile_tmp")"
  rm -f "$profile_tmp"

  if [[ "$profile_status" -lt 200 || "$profile_status" -ge 300 ]]; then
    echo "Failed upserting profile for ${email} (HTTP ${profile_status})" >&2
    echo "$profile_body" >&2
    exit 1
  fi

  SEEDED_EMAILS+=("$email")
  SEEDED_IDS+=("$user_id")
  SEEDED_ACTIONS+=("$action")
done

echo "Seeded fake users:"
for idx in "${!SEEDED_EMAILS[@]}"; do
  i=$((idx + 1))
  echo "  ${i}. ${SEEDED_EMAILS[$idx]} (${SEEDED_IDS[$idx]}) [${SEEDED_ACTIONS[$idx]}]"
done
echo "Password for all seeded users: ${FAKE_USER_PASSWORD}"

if [[ -n "$OUTPUT_FILE" ]]; then
  mkdir -p "$(dirname "$OUTPUT_FILE")"
  {
    echo "PRIMARY_TEST_EMAIL=${SEEDED_EMAILS[0]}"
    echo "PRIMARY_TEST_PASSWORD=${FAKE_USER_PASSWORD}"
    echo "PRIMARY_TEST_USER_ID=${SEEDED_IDS[0]}"
    for idx in "${!SEEDED_EMAILS[@]}"; do
      i=$((idx + 1))
      echo "FAKE_USER_${i}_EMAIL=${SEEDED_EMAILS[$idx]}"
      echo "FAKE_USER_${i}_PASSWORD=${FAKE_USER_PASSWORD}"
      echo "FAKE_USER_${i}_ID=${SEEDED_IDS[$idx]}"
    done
  } >"$OUTPUT_FILE"
  echo "Wrote credentials file: $OUTPUT_FILE"
fi
