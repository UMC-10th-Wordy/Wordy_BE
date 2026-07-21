import { NextFunction, Request, Response } from "express";
import { ApiError } from "./api.error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
      result: null,
    });
  }

  return res.status(500).json({
    success: false,
    code: "E500",
    message: "서버 내부 오류입니다.",
    result: null,
  });
};