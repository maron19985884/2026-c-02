# 2026-c-02

# Git ブランチ作成〜Docker起動 手順書

---

## 1. リポジトリをクローン（初回のみ）

すでにローカルにある場合はスキップ。

```bash
git clone <リポジトリのURL>
cd <リポジトリ名>
```

---

## 2. 最新のmainブランチを取得

```bash
git checkout main
git pull origin main
```

---

## 3. 新規ブランチを作成してチェックアウト

```bash
# ブランチを作成して同時に切り替える
git checkout -b feature/作業内容
```

**ブランチ名の例：**
```bash
git checkout -b feature/add-user-api
git checkout -b fix/login-bug
git checkout -b chore/update-docker-config
```

作成されたか確認：
```bash
git branch
# * feature/作業内容  ← * がついているのが現在のブランチ
```

---

## 4. 環境変数ファイルを作成

`.env` はGit管理対象外なので、チェックアウトのたびに手動で作成する。

```bash
cp .env.example .env
```

必要に応じて `.env` の中身を編集する。

---

## 5. Docker起動

```bash
docker compose up --build
```

> ソースコードに変更がない場合は `--build` 不要
> ```bash
> docker compose up
> ```

---

## 6. 動作確認

| 確認先 | URL | 正常時の表示 |
|---|---|---|
| フロントエンド | http://localhost:3000 | 「Frontend 起動確認 🚀」 |
| バックエンドAPI | http://localhost:4000/health | `{ "status": "ok" }` |

MySQL接続確認：
```bash
docker compose exec mysql mysql -u appuser -ppassword appdb
# mysql> が出れば成功。exit で抜ける
```

---

## 7. 作業後：変更をコミットしてプッシュ

```bash
# 変更ファイルを確認
git status

# ステージングに追加
git add .

# コミット
git commit -m "feat: 作業内容を簡潔に書く"

# リモートにプッシュ
git push origin feature/作業内容
```

---

## 8. 作業終了：Dockerを停止

```bash
docker compose down
```

---

## 9. Lint（静的解析）

各パッケージにESLintを導入済み。

```bash
cd frontend && npm run lint   # eslint-config-next (next/core-web-vitals) ベース
cd backend && npm run lint    # @eslint/js + typescript-eslint ベース
```

- 導入時点（2026-07-08）はbackend側で`any`型7件を検出。すべてmysql2の型（`RowDataPacket` / `ResultSetHeader`）への置き換え、またはテストモック部分へのeslint-disableコメントで解消済み
- frontend側で`@next/next/no-img-element`警告3件（`page.tsx` / `cart/page.tsx` / `books/[id]/page.tsx`の`<img>`タグ）を検出。`next/image`への置き換えは挙動（読み込み最適化・width/height必須化等）に触れる可能性があるため「要注意」として今回は未対応。次回対応時に検討すること
- 対象外: `mysql/init/*.sql`（SQL linter未導入）、`frontend/Dockerfile` / `backend/Dockerfile`（hadolint等未導入）。必要になった際に別途検討する
- CI設定（GitHub Actions等）自体がまだこのリポジトリに存在しないため、lintのCI組み込みは未実施。CIを導入する際はビルド/テストの後段にlintステップを追加すること

---

## トラブルシューティング

### コンテナ名が競合してエラーになる
```bash
docker rm -f $(docker ps -aq)
docker compose up --build
```

### ブランチを間違えた・元に戻したい
```bash
# mainに戻る
git checkout main

# 作成したブランチを削除する（必要な場合）
git branch -d feature/作業内容
```

### 最新のmainをブランチに取り込みたい
```bash
git fetch origin
git merge origin/main
```