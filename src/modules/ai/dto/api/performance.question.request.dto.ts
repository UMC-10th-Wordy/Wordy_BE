import { PerformanceRequestDto } from "./performance.request.dto";

export interface PerformanceQuestionRequestDto {
  originalRequest: PerformanceRequestDto;
  answers: QuestionAnswerDto[];
}

export interface QuestionAnswerDto {
  question: string;
  answer: string;
}