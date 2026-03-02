#!/bin/bash
# Browser-Use Wrapper for AIOS
# Usage: bu <command> [args]
# Example: bu open https://example.com

export PYTHONIOENCODING=utf-8
export UV_CACHE_DIR="D:/workspace/.aios-tools/uv-cache"

source D:/workspace/.aios-tools/browser-use/.venv/Scripts/activate
browser-use "$@"
