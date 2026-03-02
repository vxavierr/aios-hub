@echo off
:: Browser-Use Wrapper for AIOS
:: Usage: bu <command> [args]
:: Example: bu open https://example.com

set PYTHONIOENCODING=utf-8
set UV_CACHE_DIR=D:\workspace\.aios-tools\uv-cache

call D:\workspace\.aios-tools\browser-use\.venv\Scripts\activate.bat
browser-use %*
