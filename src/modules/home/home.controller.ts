import { Controller, Get, Route, Tags, Header, Example, Response, Path } from 'tsoa';
import { HomeService } from './home.service.js';
import { HomeData, PlanType } from './home.dto.js';
import { TaskPriority, TaskStatus } from '../tasks/task.dto.js';
import { ApiResponse } from '../../common/responses/api.response.js';
import { success } from '../../common/responses/response.js';
import { SuccessCode } from '../../common/responses/success.code.js';

@Route('workspaces/{workspaceId}/home')
@Tags('Home')
export class HomeController extends Controller {
  private homeService = new HomeService();

  /**
   * 요금제가 없는 유저(첫 방문)는 랜딩 화면, 있는 유저는 대시보드 화면을 반환
   * @summary 홈 화면 조회
   */
  @Get()
  @Example<ApiResponse<HomeData>>(
    {
      success: true,
      code: 'S200',
      message: '홈 화면 조회 성공',
      result: { screenType: 'landing', plan: PlanType.FREE },
    },
    '첫 방문 - 랜딩 화면',
  )
  @Example<ApiResponse<HomeData>>(
    {
      success: true,
      code: 'S200',
      message: '홈 화면 조회 성공',
      result: {
        screenType: 'dashboard',
        plan: PlanType.FREE,
        userName: '홍길동',
        todayTasks: [
          {
            taskId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            title: 'Product Strategy Alignment 회의 준비',
            priority: TaskPriority.MUST_DO,
            status: TaskStatus.IN_PROGRESS,
            tag: { tagId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', tagName: '온보딩 리뉴얼', color: '#00C48C' },
          },
        ],
        streakDays: 4,
        weekRecords: [
          { date: '2026-08-16', hasRecord: true, isConnected: false },
          { date: '2026-08-17', hasRecord: false, isConnected: false },
          { date: '2026-08-18', hasRecord: true, isConnected: false },
          { date: '2026-08-19', hasRecord: true, isConnected: true },
          { date: '2026-08-20', hasRecord: true, isConnected: true },
          { date: '2026-08-21', hasRecord: true, isConnected: true },
          { date: '2026-08-22', hasRecord: false, isConnected: false },
        ],
        weekTasks: [
          {
            date: '2026-08-16',
            tasks: [
              {
                taskId: '1a2b3c4d-1111-4562-b3fc-2c963f66afa6',
                title: '주간 회고 정리',
                priority: TaskPriority.COULD_DO,
                status: TaskStatus.COMPLETED,
                tag: { tagId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', tagName: '온보딩 리뉴얼', color: '#00C48C' },
              },
            ],
          },
          { date: '2026-08-17', tasks: [] },
          {
            date: '2026-08-18',
            tasks: [
              {
                taskId: '2b3c4d5e-2222-4562-b3fc-2c963f66afa6',
                title: '온보딩 가이드 초안 작성',
                priority: TaskPriority.SHOULD_DO,
                status: TaskStatus.COMPLETED,
                tag: { tagId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', tagName: '온보딩 리뉴얼', color: '#00C48C' },
              },
            ],
          },
          {
            date: '2026-08-19',
            tasks: [
              {
                taskId: '3c4d5e6f-3333-4562-b3fc-2c963f66afa6',
                title: '디자인 리뷰 피드백 반영',
                priority: TaskPriority.MUST_DO,
                status: TaskStatus.COMPLETED,
                tag: { tagId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', tagName: '온보딩 리뉴얼', color: '#00C48C' },
              },
            ],
          },
          {
            date: '2026-08-20',
            tasks: [
              {
                taskId: '4c9e2b3a-1234-4562-b3fc-2c963f66afa6',
                title: '전일 업무 정리 1',
                priority: TaskPriority.SHOULD_DO,
                status: TaskStatus.IN_PROGRESS,
                tag: { tagId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', tagName: '온보딩 리뉴얼', color: '#00C48C' },
              },
              {
                taskId: '7d1f4c5b-5678-4562-b3fc-2c963f66afa6',
                title: '전일 업무 정리 2',
                priority: TaskPriority.COULD_DO,
                status: TaskStatus.IN_PROGRESS,
                tag: { tagId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', tagName: '온보딩 리뉴얼', color: '#00C48C' },
              },
            ],
          },
          {
            date: '2026-08-21',
            tasks: [
              {
                taskId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                title: 'Product Strategy Alignment 회의 준비',
                priority: TaskPriority.MUST_DO,
                status: TaskStatus.IN_PROGRESS,
                tag: { tagId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', tagName: '온보딩 리뉴얼', color: '#00C48C' },
              },
            ],
          },
          { date: '2026-08-22', tasks: [] },
        ],
        recentRecord: [
          {
            date: '2026-08-21',
            tasks: [
              {
                taskId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                title: 'Product Strategy Alignment 회의 준비',
                priority: TaskPriority.MUST_DO,
                status: TaskStatus.IN_PROGRESS,
                tag: { tagId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', tagName: '온보딩 리뉴얼', color: '#00C48C' },
              },
            ],
          },
          {
            date: '2026-08-20',
            tasks: [
              {
                taskId: '4c9e2b3a-1234-4562-b3fc-2c963f66afa6',
                title: '전일 업무 정리 1',
                priority: TaskPriority.SHOULD_DO,
                status: TaskStatus.IN_PROGRESS,
                tag: { tagId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', tagName: '온보딩 리뉴얼', color: '#00C48C' },
              },
              {
                taskId: '7d1f4c5b-5678-4562-b3fc-2c963f66afa6',
                title: '전일 업무 정리 2',
                priority: TaskPriority.COULD_DO,
                status: TaskStatus.IN_PROGRESS,
                tag: { tagId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', tagName: '온보딩 리뉴얼', color: '#00C48C' },
              },
            ],
          },
        ],
      },
    },
    '재방문 - 대시보드 화면',
  )
  @Response<ApiResponse<null>>(401, '인증이 필요합니다.', {
    success: false,
    code: 'E401',
    message: '인증이 필요합니다.',
    result: null,
  })
  public async getHome(
    @Header('Authorization') authorization: string | undefined,
    @Path() workspaceId: string,
  ): Promise<ApiResponse<HomeData>> {
    const data = await this.homeService.getHome(authorization, workspaceId);

    return success(SuccessCode.OK.code, '홈 화면 조회 성공', data);
  }
}