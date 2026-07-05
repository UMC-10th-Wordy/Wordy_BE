export const SuccessCode = {
  OK: {
    code: "S200",
    message: "요청에 성공했습니다.",
  },

  GET_SUCCESS: {
    code: "S200",
    message: "조회에 성공했습니다.",
  },

  CREATED: {
    code: "S201",
    message: "생성에 성공했습니다.",
  },

  UPDATED: {
    code: "S200",
    message: "수정에 성공했습니다.",
  },

  DELETED: {
    code: "S200",
    message: "삭제에 성공했습니다.",
  },
} as const;