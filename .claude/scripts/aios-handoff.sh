#!/bin/bash
# =============================================================================
# AIOS Agent Handoff Script v3.1
#
# Fluxo:
#   1. Abre novo tab no WT com Claude no diretório do projeto
#   2. PS background: SetForegroundWindow(WT) imediato → WT vem à frente
#   3. Aguarda 4s para Claude inicializar
#   4. SetForegroundWindow(WT) novamente → injeta prompt via SendKeys
#
# Uso:
#   bash aios-handoff.sh --to @agent [--project PATH] [--message TEXTO] [--task TASK]
# =============================================================================

set -euo pipefail

# ── Parse args ────────────────────────────────────────────────────────────────
TO_AGENT="" PROJECT_PATH="" HANDOFF_MSG="" TASK=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --to)      TO_AGENT="$2";     shift 2 ;;
        --project) PROJECT_PATH="$2"; shift 2 ;;
        --message) HANDOFF_MSG="$2";  shift 2 ;;
        --task)    TASK="$2";         shift 2 ;;
        *) shift ;;
    esac
done

[[ -z "$TO_AGENT" ]] && {
    echo "❌ --to <agent> é obrigatório"
    exit 1
}

# ── Auto-detectar raiz do projeto ─────────────────────────────────────────────
if [[ -z "$PROJECT_PATH" ]]; then
    DIR="$(pwd)"
    while [[ "$DIR" != "/" && "$DIR" != "$(dirname "$DIR")" ]]; do
        if [[ -d "$DIR/.git" || -f "$DIR/package.json" || -d "$DIR/.aios-core" ]]; then
            PROJECT_PATH="$DIR"; break
        fi
        DIR="$(dirname "$DIR")"
    done
    PROJECT_PATH="${PROJECT_PATH:-$(pwd)}"
fi

# ── Activation prompt ─────────────────────────────────────────────────────────
ACTIVATION="${TO_AGENT}"
[[ -n "$TASK" ]] && ACTIVATION="${TO_AGENT} *task ${TASK}"

FULL_PROMPT="${ACTIVATION}"
[[ -n "$HANDOFF_MSG" ]] && FULL_PROMPT="${ACTIVATION}

Contexto do handoff:
${HANDOFF_MSG}"

# ── Log handoff ───────────────────────────────────────────────────────────────
HANDOFF_DIR="${PROJECT_PATH}/.aios-core/handoffs"
mkdir -p "$HANDOFF_DIR"
TS=$(date '+%Y%m%d-%H%M%S')
LOG_FILE="${HANDOFF_DIR}/handoff-${TS}.md"

cat > "$LOG_FILE" << EOF
# Handoff — ${TS}

**Para:** ${TO_AGENT}
**Projeto:** ${PROJECT_PATH}
**Timestamp:** $(date '+%Y-%m-%d %H:%M:%S')

## Ativação
\`\`\`
${ACTIVATION}
\`\`\`

## Contexto
${HANDOFF_MSG:-"(nenhum contexto adicional)"}
EOF

# ── Clipboard (fallback sempre ativo) ─────────────────────────────────────────
printf '%s' "$FULL_PROMPT" | clip.exe 2>/dev/null || true

# ── Converter path para Windows ───────────────────────────────────────────────
if command -v cygpath &>/dev/null; then
    WIN_PATH=$(cygpath -w "$PROJECT_PATH")
else
    WIN_PATH=$(echo "$PROJECT_PATH" | sed 's|^/d/|D:\\|;s|^/c/|C:\\|;s|^/e/|E:\\|;s|/|\\|g')
fi

PID=$$
echo "💀 Handoff → ${TO_AGENT}"
echo "📁 Projeto: ${WIN_PATH}"

# ── Capturar HWND do WT atual (para SetForegroundWindow) ──────────────────────
WT_HWND_SCRIPT="/tmp/aios-wthwnd-${PID}.ps1"
cat > "$WT_HWND_SCRIPT" << 'PSEOF'
Add-Type -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
public class WTFind {
    public delegate bool EnumWndProc(IntPtr hwnd, IntPtr lp);
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWndProc f, IntPtr lp);
    [DllImport("user32.dll", CharSet=CharSet.Auto)] public static extern int GetClassName(IntPtr h, StringBuilder sb, int n);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
    public static List<long> GetWT() {
        var r = new List<long>();
        EnumWindows((h, l) => {
            var sb = new StringBuilder(256);
            GetClassName(h, sb, 256);
            if (sb.ToString() == "CASCADIA_HOSTING_WINDOW_CLASS" && IsWindowVisible(h))
                r.Add(h.ToInt64());
            return true;
        }, IntPtr.Zero);
        return r;
    }
}
"@
$w = [WTFind]::GetWT()
if ($w.Count -gt 0) { $w[0].ToString() } else { "0" }
PSEOF

WT_HWND=$(powershell.exe -NoProfile -NonInteractive \
    -File "$(cygpath -w "$WT_HWND_SCRIPT")" 2>/dev/null | tr -d '\r\n ')
rm -f "$WT_HWND_SCRIPT"
[[ -z "$WT_HWND" ]] && WT_HWND="0"
echo "📌 HWND do WT: ${WT_HWND}"

# ── Launcher do novo terminal ──────────────────────────────────────────────────
LAUNCHER="/tmp/aios-launch-${PID}.sh"
cat > "$LAUNCHER" << SCRIPT
#!/bin/bash
cd '${PROJECT_PATH}'
claude
rm -f '${LAUNCHER}'
SCRIPT
chmod +x "$LAUNCHER"

# ── Abrir novo tab no Windows Terminal ────────────────────────────────────────
echo "🚀 Abrindo novo tab..."
if cmd.exe /c "where wt" >/dev/null 2>&1; then
    cmd.exe /c "wt new-tab -d \"${WIN_PATH}\" bash --login \"${LAUNCHER}\"" 2>/dev/null || true
else
    cmd.exe /c "start \"AIOS:${TO_AGENT}\" bash --login -c \"exec '${LAUNCHER}'\"" 2>/dev/null || true
fi

# ── PS background: traz WT à frente → aguarda Claude → injeta ─────────────────
PS_SCRIPT="/tmp/aios-inject-${PID}.ps1"
PS_WIN=$(cygpath -w "$PS_SCRIPT")

cat > "$PS_SCRIPT" << PSEOF
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class AiosInject {
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll", CharSet=CharSet.Auto)] public static extern int GetClassName(IntPtr h, StringBuilder s, int n);
}
"@
Add-Type -AssemblyName System.Windows.Forms

\$wtHwnd = New-Object System.IntPtr(${WT_HWND})

# Trazer WT à frente imediatamente (mostra o novo tab)
if (\$wtHwnd -ne [System.IntPtr]::Zero) {
    [AiosInject]::SetForegroundWindow(\$wtHwnd) | Out-Null
}

# Aguardar Claude inicializar
Start-Sleep -Seconds 4

# Trazer WT à frente novamente antes de injetar
\$fg = [AiosInject]::GetForegroundWindow()
\$sb = New-Object System.Text.StringBuilder 256
[AiosInject]::GetClassName(\$fg, \$sb, 256) | Out-Null
\$cls = \$sb.ToString()

if (\$cls -eq "CASCADIA_HOSTING_WINDOW_CLASS") {
    [AiosInject]::SetForegroundWindow(\$fg) | Out-Null
    Start-Sleep -Milliseconds 600
    [System.Windows.Forms.SendKeys]::SendWait('${ACTIVATION}~')
} elseif (\$wtHwnd -ne [System.IntPtr]::Zero) {
    # fallback: injetar no WT que conhecemos
    [AiosInject]::SetForegroundWindow(\$wtHwnd) | Out-Null
    Start-Sleep -Milliseconds 600
    [System.Windows.Forms.SendKeys]::SendWait('${ACTIVATION}~')
}

Remove-Item -LiteralPath '${PS_WIN}' -Force -ErrorAction SilentlyContinue
PSEOF

powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "$PS_WIN" &

echo ""
echo "⏳ Tab abrindo | WT vai vir à frente em ~1s | Injeção em ~5s"
echo "📋 Fallback: Ctrl+V já tem o prompt"
echo "📄 Log: ${LOG_FILE}"

exit 0
