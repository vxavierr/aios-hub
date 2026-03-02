#!/bin/bash
# sync-framework.sh
# Propaga mudanças de .aios-core/development/ do HUB para todos os projetos em projects/
#
# Uso:
#   bash scripts/sync-framework.sh              # sincroniza todos os projetos
#   bash scripts/sync-framework.sh mindo        # sincroniza só o projeto especificado
#
# O que é sincronizado: .aios-core/development/ (agents, tasks, checklists, workflows, etc.)
# O que NÃO é tocado:   .aios-core/core-config.yaml (configuração específica de cada projeto)

HUB_DEV="D:/workspace/.aios-core/development"
PROJECTS_DIR="D:/workspace/projects"
TARGET_PROJECT="${1:-}"

echo "=== sync-framework ==="
echo "Origem: $HUB_DEV"
echo ""

synced=0
skipped=0

for project_dir in "$PROJECTS_DIR"/*/; do
  project_name=$(basename "$project_dir")

  # Se um projeto específico foi passado, pular os outros
  if [ -n "$TARGET_PROJECT" ] && [ "$project_name" != "$TARGET_PROJECT" ]; then
    continue
  fi

  target="$project_dir/.aios-core/development"

  if [ -d "$target" ]; then
    echo "→ $project_name"
    cp -rf "$HUB_DEV/." "$target/"
    echo "  ✓ sincronizado"
    ((synced++))
  else
    echo "→ $project_name"
    echo "  ⚠ .aios-core/development não encontrado — pulando"
    ((skipped++))
  fi
done

echo ""
echo "Concluído: $synced sincronizado(s), $skipped pulado(s)."
