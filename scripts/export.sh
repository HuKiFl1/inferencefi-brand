#!/usr/bin/env bash
# Writes a reproducible tarball of the tracked working tree (no .git, node_modules or dist) plus its sha256.
# Usage: scripts/export.sh [output-dir]   (default: the repository root)
# The same tracked contents always produce the same bytes: sorted paths, a fixed mtime, numeric owner 0 and gzip -n.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${1:-$root}"
name="brand-export"
mtime="2026-01-01 00:00:00Z"

cd "$root"
mkdir -p "$out_dir"
list="$(mktemp)"
trap 'rm -f "$list"' EXIT

git ls-files -z --cached --others --exclude-standard \
  | tr '\0' '\n' \
  | grep -v -E '(^|/)(node_modules|dist)(/|$)' \
  | grep -v -E "^${name}\.(tar\.gz|sha256)$" \
  | while IFS= read -r f; do [ -f "$f" ] && printf '%s\n' "$f"; done \
  | LC_ALL=C sort > "$list"

tar --create --format=gnu --sort=name --mtime="$mtime" \
  --owner=0 --group=0 --numeric-owner --mode='u+rwX,go+rX,go-w' \
  --transform "s,^,inferencefi-brand/," \
  --no-recursion --files-from="$list" \
  | gzip -n -9 > "$out_dir/$name.tar.gz"

(cd "$out_dir" && sha256sum "$name.tar.gz" > "$name.sha256")
echo "Wrote $out_dir/$name.tar.gz ($(wc -l < "$list") files)"
cat "$out_dir/$name.sha256"
