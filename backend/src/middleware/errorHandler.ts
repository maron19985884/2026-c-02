import { NextFunction, Request, Response } from "express";

export type ErrorCode = "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL_ERROR";

export interface ErrorFields {
  name?: string;
  address?: string;
  email?: string;
  items?: string;
}

/**
 * ルート層から投げる既知のアプリケーションエラー。
 * errorHandler が共通形式 { error, message, fields? } に整形する。
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly fields?: ErrorFields;

  constructor(status: number, code: ErrorCode, message: string, fields?: ErrorFields) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export const notFound = (message = "not found"): AppError =>
  new AppError(404, "NOT_FOUND", message);

export const validationError = (message: string, fields?: ErrorFields): AppError =>
  new AppError(400, "VALIDATION_ERROR", message, fields);

/** 404 (ルート未一致) 用ハンドラ */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: "NOT_FOUND", message: "route not found" });
};

/** 集約エラーハンドラ（4引数シグネチャで Express がエラーミドルウェアとして認識する） */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    const body: { error: ErrorCode; message: string; fields?: ErrorFields } = {
      error: err.code,
      message: err.message,
    };
    if (err.fields) body.fields = err.fields;
    res.status(err.status).json(body);
    return;
  }

  // 想定外の例外
  const message = err instanceof Error ? err.message : "unexpected error";
  // eslint-disable-next-line no-console
  console.error("[errorHandler]", err);
  res.status(500).json({ error: "INTERNAL_ERROR", message });
};
