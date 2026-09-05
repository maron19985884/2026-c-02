# ============================================================
# Backend: Node.js + TypeScript (REST API)
# ============================================================

# --- 開発ステージ ---
FROM node:20-alpine AS development

WORKDIR /app

# 依存関係ファイルをコピー
COPY package*.json ./
COPY tsconfig.json ./

# 依存関係インストール（devDependencies含む）
RUN npm install

# ソースをコピー
COPY . .

EXPOSE 4000

# ts-node-dev でホットリロード対応
CMD ["npm", "run", "dev"]


# --- ビルドステージ ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

COPY . .

# TypeScript をコンパイル
RUN npm run build


# --- 本番ステージ ---
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
