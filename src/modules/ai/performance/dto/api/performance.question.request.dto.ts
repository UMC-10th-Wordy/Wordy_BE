import { PerformanceRequestDto } from "./performance.request.dto";
import { Example } from "tsoa";

export class PerformanceQuestionRequestDto {
  reflectionSnapshotId!: string;
  originalRequest!: PerformanceRequestDto;
  answers!: QuestionAnswerDto[];
}

export class QuestionAnswerDto {
  @Example("이번 작업에서 가장 어려웠던 점은 무엇인가요?")
  question!: string;

  @Example("Swagger 예시를 추가하는 방법을 찾는 것이었습니다.")
  answer!: string;
}