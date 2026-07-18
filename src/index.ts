import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { Express, Router, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { ValidateError } from 'tsoa';
import { RegisterRoutes } from './generated/routes';
import { ErrorCode } from './common/errors/error.code';
import { ApiError } from './common/errors/api.error';
import { apiLogMiddleware } from './common/middlewares/api.log.middleware';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLogMiddleware);

const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'generated/swagger.json'), 'utf-8'),
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const apiRouter = Router();
RegisterRoutes(apiRouter);
app.use('/api/v1', apiRouter);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidateError) {
    return res.status(ErrorCode.BAD_REQUEST.status).json({
      success: false,
      code: ErrorCode.BAD_REQUEST.code,
      message: "요청 형식이 올바르지 않습니다.",
      result: err.fields,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
      result: null,
    });
  }

  console.error(err);

  return res.status(ErrorCode.INTERNAL_SERVER_ERROR.status).json({
    success: false,
    code: ErrorCode.INTERNAL_SERVER_ERROR.code,
    message: ErrorCode.INTERNAL_SERVER_ERROR.message,
    result: null,
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
