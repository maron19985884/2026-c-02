#!/usr/bin/env bash
# Runs as a Claude Code Stop hook.
# Reads session data from ~/.claude/projects/ and appends a usage record.

set -euo pipefail

INPUT=$(cat)
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

SESSION_ID=$(echo "$INPUT" | python3 -c \
  "import json,sys; d=json.load(sys.stdin); print(d.get('session_id',''))" 2>/dev/null || true)

[ -z "$SESSION_ID" ] && exit 0

python3 - "$SESSION_ID" "$TIMESTAMP" << 'PYEOF'
import json, os, glob, sys
from datetime import datetime

session_id = sys.argv[1]
timestamp  = sys.argv[2]

home       = os.path.expanduser("~")
proj_dir   = os.path.join(home, ".claude", "projects")
log_file   = os.path.join(home, ".claude", "usage_logs", "usage.jsonl")

input_tokens          = 0
output_tokens         = 0
cache_read_tokens     = 0
cache_creation_tokens = 0
timestamps            = []
cwd                   = ""

for jsonl_path in glob.glob(os.path.join(proj_dir, "**", "*.jsonl"), recursive=True):
    try:
        with open(jsonl_path) as f:
            entries = [json.loads(l) for l in f if l.strip()]

        # セッションIDが一致するエントリのみ処理
        session_entries = [e for e in entries if e.get("sessionId") == session_id]
        if not session_entries:
            continue

        for entry in session_entries:
            ts = entry.get("timestamp")
            if ts:
                timestamps.append(ts)
            if not cwd:
                cwd = entry.get("cwd", "")

            msg = entry.get("message")
            if not isinstance(msg, dict):
                continue
            usage = msg.get("usage", {})
            if usage:
                input_tokens          += usage.get("input_tokens", 0)
                output_tokens         += usage.get("output_tokens", 0)
                cache_read_tokens     += usage.get("cache_read_input_tokens", 0)
                cache_creation_tokens += usage.get("cache_creation_input_tokens", 0)
        break
    except Exception:
        continue

duration_secs = 0
if len(timestamps) >= 2:
    try:
        t0 = datetime.fromisoformat(timestamps[0].replace("Z", "+00:00"))
        t1 = datetime.fromisoformat(timestamps[-1].replace("Z", "+00:00"))
        duration_secs = int((t1 - t0).total_seconds())
    except Exception:
        pass

record = {
    "timestamp":            timestamp,
    "session_id":           session_id,
    "cwd":                  cwd,
    "input_tokens":         input_tokens,
    "output_tokens":        output_tokens,
    "cache_read_tokens":    cache_read_tokens,
    "cache_creation_tokens":cache_creation_tokens,
    "total_tokens":         input_tokens + output_tokens,
    "duration_secs":        duration_secs,
}

with open(log_file, "a") as f:
    f.write(json.dumps(record, ensure_ascii=False) + "\n")

mins, secs = divmod(duration_secs, 60)
print(
    f"[usage] input={input_tokens:,} output={output_tokens:,} "
    f"total={input_tokens + output_tokens:,} "
    f"time={mins}m{secs:02d}s",
    file=sys.stderr,
)
PYEOF
