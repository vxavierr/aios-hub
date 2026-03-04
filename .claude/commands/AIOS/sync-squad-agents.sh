#!/bin/bash
# Sync squad agent definitions to .claude/commands/AIOS/agents/
# Run after editing any agent in squads/*/agents/

SQUAD_DIR="D:/workspace/squads"
TARGET_DIR="D:/workspace/.claude/commands/AIOS/agents"

synced=0
skipped=0

for squad_path in "$SQUAD_DIR"/*/agents/*.md; do
  [ -f "$squad_path" ] || continue
  filename=$(basename "$squad_path")
  target="$TARGET_DIR/$filename"

  # Skip if target is identical
  if [ -f "$target" ] && diff -q "$squad_path" "$target" > /dev/null 2>&1; then
    skipped=$((skipped + 1))
    continue
  fi

  cp "$squad_path" "$target"
  squad_name=$(basename "$(dirname "$(dirname "$squad_path")")")
  echo "  ✓ $filename ($squad_name)"
  synced=$((synced + 1))
done

echo ""
echo "Sync: $synced updated, $skipped unchanged"
