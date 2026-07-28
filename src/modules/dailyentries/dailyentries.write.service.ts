import {
  createDailyEntryWithTasks,
  findDailyEntryByUserIdAndDate,
  findTasksByUserIdAndDate,
} from './dailyentries.write.repository.js';

import {
  CreateDailyEntryRequest,
  CreateDailyEntryResponse,
} from './dailyentries.write.dto.js';

import { ApiError } from '../../common/errors/api.error.js';
import { ErrorCode } from '../../common/errors/error.code.js';
import { verifyAccessToken } from '../../auth.config.js';

class UnauthorizedError extends ApiError {
  constructor() {
    super(
      ErrorCode.UNAUTHORIZED.status,
      ErrorCode.UNAUTHORIZED.code,
      ErrorCode.UNAUTHORIZED.message,
    );
  }
}

class BadRequestError extends ApiError {
  constructor(message: string) {
    super(
      ErrorCode.BAD_REQUEST.status,
      ErrorCode.BAD_REQUEST.code,
      message,
    );
  }
}

export const createDailyEntry = async (
  authorization: string | undefined,
  body: CreateDailyEntryRequest,
): Promise<CreateDailyEntryResponse> => {
  const userId = getUserIdFromAuthorization(authorization);

  validateRequest(body);

  const entryDate = parseDate(body.entryDate);

  const existingEntry =
  await findDailyEntryByUserIdAndDate(userId, entryDate);

    if (existingEntry) {
    throw new BadRequestError(
        '해당 날짜의 업무 일지가 이미 존재합니다.',
    );
    }

    const tasks = await findTasksByUserIdAndDate(
    userId,
    entryDate,
    );

    const taskIds = tasks.map((task) => task.taskId);

    const dailyEntry = await createDailyEntryWithTasks(
    userId,
    entryDate,
    body.reflectionContent.trim(),
    taskIds,
    );

    return {
    dailyEntryId: dailyEntry.dailyEntryId,
    entryDate: body.entryDate,
    reflectionContent: dailyEntry.reflectionContent,
    linkedTaskCount: dailyEntry.reflectionTasks.length,
    createdAt: dailyEntry.createdAt,
    };
};

const getUserIdFromAuthorization = (
  authorization: string | undefined,
): string => {
  if (
    !authorization ||
    !authorization.startsWith('Bearer ')
  ) {
    throw new UnauthorizedError();
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = verifyAccessToken(token);

    return payload.userId;
  } catch {
    throw new UnauthorizedError();
  }
};

const validateRequest = (
  body: CreateDailyEntryRequest,
) => {
  if (!body.entryDate) {
    throw new BadRequestError(
      '일지 날짜는 필수입니다.',
    );
  }

  if (
    !body.reflectionContent ||
    body.reflectionContent.trim().length === 0
  ) {
    throw new BadRequestError(
      '회고 내용은 필수입니다.',
    );
  }
};

const parseDate = (date: string): Date => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BadRequestError(
      '날짜는 YYYY-MM-DD 형식으로 입력해주세요.',
    );
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new BadRequestError(
      '유효하지 않은 날짜입니다.',
    );
  }

  return parsed;
};