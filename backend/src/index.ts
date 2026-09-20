/**
 * Express アプリケーションの起動。
 *
 * 詳細設計書 DETAIL-004 §2.7 に対応。
 * ルータのマウントと共通エラーハンドリングを行う。
 */
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { booksRouter } from "./routes/books";
import { ordersRouter } from "./routes/orders";
import { ApiErrorCode, HttpError, apiError } from "./types";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 動作確認用エンドポイント
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend 起動確認 🚀" });
});

// ------------------------------------------------------------
// ルータのマウント
// ------------------------------------------------------------
app.use("/api/books", booksRouter);
app.use("/api/orders", ordersRouter);

// ------------------------------------------------------------
// 共通エラーハンドリング（research.md D-11）
//   すべてのエラー応答を { error: { code, message, details? } } に統一する。
//   本文にスタックトレース・SQL・接続情報を含めない。
// ------------------------------------------------------------

/** 未定義のパスは 404 を返す */
app.use((_req: Request, res: Response) => {
  res.status(404).json(apiError("BOOK_NOT_FOUND", "該当のリソースが見つかりません"));
});

/** 例外を共通形式へ変換する。Express のエラーハンドラは引数4つで判定される */
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json(apiError(err.code, err.message, err.details));
    return;
  }

  // express.json() が投げる JSON パースエラー
  if (err instanceof SyntaxError && "body" in err) {
    res
      .status(400)
      .json(apiError("VALIDATION_ERROR", "リクエストの形式が不正です"));
    return;
  }

  // 想定外の例外。詳細はサーバログにのみ出し、応答には含めない
  console.error("[INTERNAL_ERROR]", err);
  const code: ApiErrorCode = "INTERNAL_ERROR";
  res
    .status(500)
    .json(apiError(code, "サーバ内部でエラーが発生しました"));
});

// このファイルを直接実行したときのみ待ち受ける。
// テスト（supertest）から import された場合はサーバを起動しない。
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Backend server is running on port ${PORT}`);
  });
}

export { app };
