import {
  createDailyEntryWithTasks,
  findDailyEntryByUserIdAndDate,
  findTasksByUserIdAndDate,
  restoreDailyEntryWithTasks,
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
  workspaceId: string,
  body: CreateDailyEntryRequest,
): Promise<CreateDailyEntryResponse> => {
  const userId = getUserIdFromAuthorization(authorization);

  validateRequest(body);

  const entryDate = parseDate(body.entryDate);

  const tasks =
    await findTasksByUserIdAndDate(
      userId,
      workspaceId,
      entryDate,
    );

  const taskIds =
    tasks.map((task) => task.taskId);

  const existingEntry =
    await findDailyEntryByUserIdAndDate(
      userId,
      workspaceId,
      entryDate,
    );

  if (existingEntry) {
    const updatedEntry =
      await restoreDailyEntryWithTasks(
        existingEntry.dailyEntryId,
        workspaceId,
        body.reflectionContent.trim(),
        taskIds,
      );

  return {
    dailyEntryId: updatedEntry.dailyEntryId,
    workspaceId: updatedEntry.workspaceId,
    title: updatedEntry.title,
    entryDate: body.entryDate,
    reflectionContent:
      updatedEntry.reflectionContent,
    linkedTaskCount:
      updatedEntry.reflectionTasks.length,
    createdAt: updatedEntry.createdAt,
  };
} 

  const dailyEntry = await createDailyEntryWithTasks(
    userId,
    workspaceId,
    entryDate,
    (body.title ?? "").trim(),
    body.reflectionContent.trim(),
    taskIds,
    );

    return {
    dailyEntryId: dailyEntry.dailyEntryId,
    workspaceId: dailyEntry.workspaceId,
    title: dailyEntry.title,
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