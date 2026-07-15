#!/usr/bin/env bash
# PreToolUse hook: Edit/Write の対象パスを許可リストで検査するガードレール。
# 許可外は exit 2 でブロック（stderr が Claude にフィードバックされる）。
# 許可内は exit 0 とし、ワークフローのリマインダーを注入する。
# 判定不能な入力はブロックしない（フェイルオープン）。

input=$(cat)

# JSON から tool_input.file_path を抽出（jq 非依存の簡易抽出）
file=$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
[ -z "$file" ] && exit 0

# パス区切りを / に統一（JSON エスケープの \\ も含む）
file=$(printf '%s' "$file" | sed 's/\\\\/\//g; s/\\/\//g')

# リポジトリルート（Git Bash では pwd -W が C:/... 形式を返す）
cwd=$(pwd -W 2>/dev/null || pwd)

file_l=$(printf '%s' "$file" | tr '[:upper:]' '[:lower:]')
cwd_l=$(printf '%s' "$cwd" | tr '[:upper:]' '[:lower:]')

case "$file_l" in
  "$cwd_l"/*)
    rel=$(printf '%s' "$file" | cut -c $((${#cwd} + 2))-)
    ;;
  [a-z]:/*|/*)
    # リポジトリ外の絶対パス（プランファイル・スクラッチパッド等）は対象外
    exit 0
    ;;
  *)
    rel=$file
    ;;
esac

ok=0
case "$rel" in
  backend/src/*|frontend/src/*|docs/*|mysql/init/*|.claude/*) ok=1 ;;
  CLAUDE.md|*/CLAUDE.md) ok=1 ;;
  .env.example) ok=1 ;;
  *.md) case "$rel" in */*) ;; *) ok=1 ;; esac ;;  # ルート直下の Markdown のみ許可
esac

if [ "$ok" -ne 1 ]; then
  {
    echo "編集が許可されていないパスです: $rel"
    echo "許可対象: backend/src/, frontend/src/, docs/, mysql/init/, .claude/ / ルート直下の *.md / 各ディレクトリの CLAUDE.md / .env.example"
    echo "このパスの変更が必要な場合はユーザーに提案して承認を得ること。"
  } >&2
  exit 2
fi

echo "リマインダー: CLAUDE.md の決定事項に違反していないか確認すること。要件未定義の仕様に遭遇したら独自判断せず docs/decisions.md に決定案を追記して確認を求めること。"
exit 0
