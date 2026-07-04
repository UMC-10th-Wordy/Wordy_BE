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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'generated/swagger.json'), 'utf-8'),
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const apiRouter = Router();
RegisterRoutes(apiRouter);
app.use('/api/v1', apiRouter);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidateError) {
    const fieldMessages = Object.entries(err.fields)
      .map(([field, fieldError]) => `${field}: ${fieldError.message}`)
      .join(', ');
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: `요청 형식이 올바르지 않습니다. (${fieldMessages})`,
      data: null,
    });
    return;
  }

  if (err instanceof Error) {
    console.error(err);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: '서버 오류가 발생했습니다.',
      data: null,
    });
    return;
  }

  next(err);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
