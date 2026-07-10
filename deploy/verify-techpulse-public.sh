#!/usr/bin/env sh
set -eu

BASE_URL="${TECHPULSE_PUBLIC_URL:-https://techpulse.attodigitalhk.com}"
TMP_DIR="${TMPDIR:-/tmp}/techpulse-verify"
mkdir -p "$TMP_DIR"

check_head() {
  path="$1"
  url="${BASE_URL}${path}"
  curl --fail --silent --show-error --max-time 20 --head "$url" >/dev/null
  echo "OK HEAD ${url}"
}

check_body_contains() {
  path="$1"
  pattern="$2"
  url="${BASE_URL}${path}"
  output="${TMP_DIR}/$(printf '%s' "$path" | tr '/?=&' '____').html"
  curl --fail --silent --show-error --max-time 25 "$url" -o "$output"
  if ! grep -q "$pattern" "$output"; then
    echo "Missing '${pattern}' in ${url}" >&2
    exit 1
  fi
  echo "OK BODY ${url}"
}

check_head "/health.json"
check_head "/assets/logo-mark.png"
check_head "/assets/og-image.png"
check_head "/site.webmanifest"
check_head "/robots.txt"
check_head "/sitemap.xml"

check_body_contains "/" "TechPulse"
check_body_contains "/" "科技脉动"
check_body_contains "/topics.html" "话题"
check_body_contains "/search.html" "TechPulse"
check_body_contains "/subscribe.html" "订阅"
check_body_contains "/pricing.html" "会员"

echo "TechPulse public verification passed: ${BASE_URL}"
