import {
  findTrashedEntries,
  findTrashedEntryById,
  restoreEntry,
  permanentlyDeleteEntry,
} from "./trash.repository.js";

import type { TrashDailyEntryItem } from "./trash.dto.js";

import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";
import { verifyAccessToken } from "../../auth.config.js";

class UnauthorizedError extends ApiError {
  constructor() {
    super(
      ErrorCode.UNAUTHORIZED.status,
      ErrorCode.UNAUTHORIZED.code,
      ErrorCode.UNAUTHORIZED.message
    );
  }
}

const getUserIdFromAuthorization = (
  authorization: string | undefined
): string => {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new UnauthorizedError();
  }

  const token = authorization.replace("Bearer ", "");

  try {
    return verifyAccessToken(token).userId;
  } catch {
    throw new UnauthorizedError();
  }
};

// Date → "YYYY-MM-DD"
const toDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

//  목록 조회
export const getTrashedDailyEntries = async (
  authorization: string | undefined
): Promise<TrashDailyEntryItem[]> => {
  const userId = getUserIdFromAuthorization(authorization);

  const entries = await findTrashedEntries(userId);

  return entries.map((e) => ({
    dailyEntryId: e.dailyEntryId,
    entryDate: toDateStr(e.entryDate),
    reflectionContent: e.reflectionContent,
    deletedAt: e.deletedAt as Date,
  }));
};

export const restoreDailyEntry = async (
  authorization: string | undefined,
  dailyEntryId: string
): Promise<{ dailyEntryId: string }> => {
  const userId = getUserIdFromAuthorization(authorization);

  const found = await findTrashedEntryById(userId, dailyEntryId);
  if (!found) {
    throw new ApiError(
      ErrorCode.NOT_FOUND.status,
      ErrorCode.NOT_FOUND.code,
      "휴지통에서 해당 일지를 찾을 수 없습니다."
    );
  }

  await restoreEntry(dailyEntryId);
  return { dailyEntryId };
};

// 영구 삭제
export const deleteDailyEntryPermanently = async (
  authorization: string | undefined,
  dailyEntryId: string
): Promise<{ dailyEntryId: string }> => {
  const userId = getUserIdFromAuthorization(authorization);

  const found = await findTrashedEntryById(userId, dailyEntryId);
  if (!found) {
    throw new ApiError(
      ErrorCode.NOT_FOUND.status,
      ErrorCode.NOT_FOUND.code,
      "휴지통에서 해당 일지를 찾을 수 없습니다."
    );
  }

  await permanentlyDeleteEntry(dailyEntryId);
  return { dailyEntryId };
};