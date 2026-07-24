import {
  Body,
  Controller,
  Example,
  Header,
  Post,
  Route,
  Tags,
} from 'tsoa';

import {
  CreateDailyEntryRequest,
  CreateDailyEntryResponse,
} from './dailyentries.write.dto.js';

import { createDailyEntry } from './dailyentries.write.service.js';

import { ApiResponse } from '../../common/responses/api.response.js';
import { success } from '../../common/responses/response.js';
import { SuccessCode } from '../../common/responses/success.code.js';

@Route('daily-entries')
@Tags('DailyEntries')
export class DailyEntriesWriteController extends Controller {
  /**
   * 해당 날짜의 회고와 업무를 업무 일지로 저장합니다.
   *
   * @summary 업무 일지 생성
   * @param authorization Bearer Access Token
   */
  @Post()
  @Example<CreateDailyEntryRequest>({
    entryDate: '2026-07-24',
    reflectionContent:
      '오늘 업무 결과 API 구현과 Swagger 문서화를 완료했다.',
  })
  @Example<ApiResponse<CreateDailyEntryResponse>>({
    success: true,
    code: 'S201',
    message: '업무 일지가 저장되었습니다.',
    result: {
      dailyEntryId:
        '550e8400-e29b-41d4-a716-446655440000',
      entryDate: '2026-07-24',
      reflectionContent:
        '오늘 업무 결과 API 구현과 Swagger 문서화를 완료했다.',
      linkedTaskCount: 3,
      createdAt: new Date(
        '2026-07-24T10:00:00.000Z',
      ),
    },
  })
  public async create(
    @Header('authorization')
    authorization: string,

    @Body()
    body: CreateDailyEntryRequest,
  ): Promise<ApiResponse<CreateDailyEntryResponse>> {
    const data = await createDailyEntry(
      authorization,
      body,
    );

    this.setStatus(201);

    return success(
      SuccessCode.CREATED.code,
      '업무 일지가 저장되었습니다.',
      data,
    );
  }
}