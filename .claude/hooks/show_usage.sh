#!/usr/bin/env bash
# Usage: ~/.claude/hooks/show_usage.sh [--last N]
# Display recorded Claude Code session usage.

LOG_FILE="$HOME/.claude/usage_logs/usage.jsonl"

if [ ! -f "$LOG_FILE" ]; then
    echo "No usage log found at $LOG_FILE"
    exit 0
fi

LAST=${2:-20}
[ "$1" = "--last" ] 2>/dev/null && LAST=$2 || true

python3 - "$LOG_FILE" "$LAST" << 'PYEOF'
import json, os, sys
from datetime import datetime

log_file = sys.argv[1]
last_n   = int(sys.argv[2])

records = []
with open(log_file) as f:
    for line in f:
        line = line.strip()
        if line:
            try:
                records.append(json.loads(line))
            except Exception:
                pass

if not records:
    print("No records found.")
    sys.exit(0)

shown = records[-last_n:]

hdr = f"{'日時':<20} {'セッションID':<12} {'Input':>8} {'Output':>8} {'Total':>9} {'実行時間':>9} プロジェクト"
print(hdr)
print("─" * len(hdr.expandtabs()))

total_input  = 0
total_output = 0
total_dur    = 0

for r in shown:
    ts      = r.get("timestamp", "")[:19].replace("T", " ")
    sid     = r.get("session_id", "")[:10]
    inp     = r.get("input_tokens", 0)
    out     = r.get("output_tokens", 0)
    total   = r.get("total_tokens", inp + out)
    dur     = r.get("duration_secs", 0)
    project = os.path.basename(r.get("cwd", "—"))

    total_input  += inp
    total_output += out
    total_dur    += dur

    mins, secs = divmod(dur, 60)
    dur_str = f"{mins}m{secs:02d}s"

    print(f"{ts:<20} {sid:<12} {inp:>8,} {out:>8,} {total:>9,} {dur_str:>9} {project}")

print("─" * len(hdr.expandtabs()))
all_total = total_input + total_output
label = f"合計（{len(records)}セッション中 直近{len(shown)}件）"
print(f"{label:<34} {total_input:>8,} {total_output:>8,} {all_total:>9,}")

# 月次サマリー
print()
print("── 月次サマリー ──")
monthly: dict = {}
for r in records:
    month = r.get("timestamp", "")[:7]  # YYYY-MM
    if month not in monthly:
        monthly[month] = {"input": 0, "output": 0, "sessions": 0, "duration": 0}
    monthly[month]["input"]    += r.get("input_tokens", 0)
    monthly[month]["output"]   += r.get("output_tokens", 0)
    monthly[month]["sessions"] += 1
    monthly[month]["duration"] += r.get("duration_secs", 0)

for month, m in sorted(monthly.items()):
    mins, secs = divmod(m["duration"], 60)
    hrs = mins // 60
    mins = mins % 60
    dur_str = f"{hrs}h{mins:02d}m" if hrs else f"{mins}m{secs:02d}s"
    print(f"  {month}  sessions={m['sessions']:3d}  "
          f"input={m['input']:>10,}  output={m['output']:>8,}  "
          f"total={m['input']+m['output']:>10,}  時間={dur_str}")
PYEOF
