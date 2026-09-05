# ============================================================
# Frontend: Next.js + TypeScript
# ============================================================

# --- 開発ステージ ---
FROM node:20-alpine AS development

WORKDIR /app

# 依存関係ファイルをコピー
COPY package*.json ./

# 依存関係インストール
RUN npm install

# ソースをコピー
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]


# --- ビルドステージ ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# 本番ビルド
RUN npm run build


# --- 本番ステージ ---
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
