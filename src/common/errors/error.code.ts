export const ErrorCode = {
  BAD_REQUEST: {
    status: 400,
    code: "E400",
    message: "잘못된 요청입니다.",
  },

  UNAUTHORIZED: {
    status: 401,
    code: "E401",
    message: "인증이 필요합니다.",
  },

  FORBIDDEN: {
    status: 403,
    code: "E403",
    message: "접근 권한이 없습니다.",
  },

  NOT_FOUND: {
    status: 404,
    code: "E404",
    message: "존재하지 않는 리소스입니다.",
  },

  CONFLICT: {
    status: 409,
    code: "E409",
    message: "이미 존재하는 리소스입니다.",
},

  INTERNAL_SERVER_ERROR: {
    status: 500,
    code: "E500",
    message: "서버 내부 오류입니다.",
  },
} as const;