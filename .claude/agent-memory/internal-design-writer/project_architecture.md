---
name: project-architecture
description: 個人書店購買フローWebアプリの技術スタック・ポート・ファイル配置の概要
metadata:
  type: project
---

# プロジェクトアーキテクチャ

- Frontend: Next.js 14 + TypeScript, App Router, `src/app/` 配下, port 3000
- Backend: Express + TypeScript, エントリポイント `backend/src/index.ts`, port 4000
- Database: MySQL 8, 初期化SQL `mysql/init/01_init.sql`, 起動時自動実行
- 通信: `NEXT_PUBLIC_API_URL=http://localhost:4000` 経由
- インフラ: Docker Compose 3サービス構成

**Why:** CLAUDE.md と docker-compose.yml で確定している構成
**How to apply:** ファイルパス・ポート番号を設計書に記載するとき必ずこの構成を参照する
