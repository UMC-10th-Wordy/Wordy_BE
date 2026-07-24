/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UsersController } from './../modules/users/users.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TaskController } from './../modules/tasks/task.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TaskResultController } from './../modules/task-results/task-result.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TagController } from './../modules/tags/tag.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { HomeController } from './../modules/home/home.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DashboardController } from './../modules/dashboard.week/dashboard.week.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MonthlyDashboardController } from './../modules/dashboard.month/dashboard.month.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DailyEntriesWriteController } from './../modules/dailyentries/dailyentries.write.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DailyEntriesController } from './../modules/dailyentries/dailyentries.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../modules/auth/auth.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PerformanceController } from './../modules/ai/performance/performance.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { KpiController } from './../modules/ai/kpi/kpi.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DashboardAiController } from './../modules/ai/dashboard/dashboard.controller';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "ApiResponse__userId-string--email-string__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string","required":true},"userId":{"dataType":"string","required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "YearsOfService": {
        "dataType": "refEnum",
        "enums": ["UNDER_1","ONE_TO_3","THREE_TO_5","FIVE_TO_10","OVER_10"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "JobRole": {
        "dataType": "refEnum",
        "enums": ["PRODUCT_PLANNING","DEVELOPMENT","DESIGN","MARKETING_SALES","DATA_ANALYSIS","CUSTOMER_SUPPORT","HR","FINANCE_ACCOUNTING","EDUCATION_RESEARCH","FREELANCER","STUDENT","ETC"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompleteProfileRequest": {
        "dataType": "refObject",
        "properties": {
            "userName": {"dataType":"string","required":true},
            "profileImgUrl": {"dataType":"string"},
            "yearsOfService": {"ref":"YearsOfService","required":true},
            "jobRole": {"ref":"JobRole","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserProfileData": {
        "dataType": "refObject",
        "properties": {
            "userId": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "userName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "profileImgUrl": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "yearsOfService": {"dataType":"union","subSchemas":[{"ref":"YearsOfService"},{"dataType":"enum","enums":[null]}],"required":true},
            "jobRole": {"dataType":"union","subSchemas":[{"ref":"JobRole"},{"dataType":"enum","enums":[null]}],"required":true},
            "createdAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_UserProfileData_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"UserProfileData"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskResultResponse": {
        "dataType": "refObject",
        "properties": {
            "taskResultId": {"dataType":"string","required":true},
            "taskId": {"dataType":"string","required":true},
            "content": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskPriority": {
        "dataType": "refEnum",
        "enums": ["MUST_DO","SHOULD_DO","COULD_DO"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskStatus": {
        "dataType": "refEnum",
        "enums": ["IN_PROGRESS","COMPLETED"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskTagResponse": {
        "dataType": "refObject",
        "properties": {
            "tagId": {"dataType":"string","required":true},
            "tagName": {"dataType":"string","required":true},
            "color": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "projectName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskWithResultResponse": {
        "dataType": "refObject",
        "properties": {
            "taskId": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "priority": {"ref":"TaskPriority","required":true},
            "memo": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "status": {"ref":"TaskStatus","required":true},
            "taskDate": {"dataType":"datetime","required":true},
            "completedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "userId": {"dataType":"string","required":true},
            "tagId": {"dataType":"string","required":true},
            "tag": {"ref":"TaskTagResponse"},
            "taskResult": {"dataType":"union","subSchemas":[{"ref":"TaskResultResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_TaskWithResultResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"TaskWithResultResponse"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskResponse": {
        "dataType": "refObject",
        "properties": {
            "taskId": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "priority": {"ref":"TaskPriority","required":true},
            "memo": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "status": {"ref":"TaskStatus","required":true},
            "taskDate": {"dataType":"datetime","required":true},
            "completedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "userId": {"dataType":"string","required":true},
            "tagId": {"dataType":"string","required":true},
            "tag": {"ref":"TaskTagResponse"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_TaskResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"TaskResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateTaskRequest": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string","required":true},
            "priority": {"ref":"TaskPriority","required":true},
            "taskDate": {"dataType":"string","required":true},
            "tagId": {"dataType":"string","required":true},
            "memo": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_TaskWithResultResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"TaskWithResultResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateTaskRequest": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string"},
            "priority": {"ref":"TaskPriority"},
            "status": {"ref":"TaskStatus"},
            "taskDate": {"dataType":"string"},
            "tagId": {"dataType":"string"},
            "memo": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_null_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":[null]},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_TaskResultResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"TaskResultResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpsertTaskResultRequest": {
        "dataType": "refObject",
        "properties": {
            "content": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TagResponse": {
        "dataType": "refObject",
        "properties": {
            "tagId": {"dataType":"string","required":true},
            "tagName": {"dataType":"string","required":true},
            "color": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "projectName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "projectPurpose": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "expectedOutcome": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "expectedStartDate": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "expectedEndDate": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "kpis": {"dataType":"any","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "userId": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_TagResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"TagResponse"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_TagResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"TagResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateTagRequest": {
        "dataType": "refObject",
        "properties": {
            "tagName": {"dataType":"string","required":true},
            "color": {"dataType":"string"},
            "projectName": {"dataType":"string"},
            "projectPurpose": {"dataType":"string"},
            "expectedOutcome": {"dataType":"string"},
            "expectedStartDate": {"dataType":"string"},
            "expectedEndDate": {"dataType":"string"},
            "kpis": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateTagRequest": {
        "dataType": "refObject",
        "properties": {
            "tagName": {"dataType":"string"},
            "color": {"dataType":"string"},
            "projectName": {"dataType":"string"},
            "projectPurpose": {"dataType":"string"},
            "expectedOutcome": {"dataType":"string"},
            "expectedStartDate": {"dataType":"string"},
            "expectedEndDate": {"dataType":"string"},
            "kpis": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PlanType": {
        "dataType": "refEnum",
        "enums": ["FREE","PRO"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LandingHomeData": {
        "dataType": "refObject",
        "properties": {
            "screenType": {"dataType":"enum","enums":["landing"],"required":true},
            "plan": {"ref":"PlanType","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskSummary": {
        "dataType": "refObject",
        "properties": {
            "taskId": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "priority": {"ref":"TaskPriority","required":true},
            "status": {"ref":"TaskStatus","required":true},
            "tag": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"color":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"tagName":{"dataType":"string","required":true},"tagId":{"dataType":"string","required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DayRecord": {
        "dataType": "refObject",
        "properties": {
            "date": {"dataType":"string","required":true},
            "hasRecord": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DayTasks": {
        "dataType": "refObject",
        "properties": {
            "date": {"dataType":"string","required":true},
            "tasks": {"dataType":"array","array":{"dataType":"refObject","ref":"TaskSummary"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DashboardHomeData": {
        "dataType": "refObject",
        "properties": {
            "screenType": {"dataType":"enum","enums":["dashboard"],"required":true},
            "plan": {"ref":"PlanType","required":true},
            "userName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "todayTasks": {"dataType":"array","array":{"dataType":"refObject","ref":"TaskSummary"},"required":true},
            "streakDays": {"dataType":"double","required":true},
            "weekRecords": {"dataType":"array","array":{"dataType":"refObject","ref":"DayRecord"},"required":true},
            "weekTasks": {"dataType":"array","array":{"dataType":"refObject","ref":"DayTasks"},"required":true},
            "recentRecord": {"dataType":"union","subSchemas":[{"ref":"DayTasks"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HomeData": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"LandingHomeData"},{"ref":"DashboardHomeData"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_HomeData_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"HomeData"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DailyEntryItem": {
        "dataType": "refObject",
        "properties": {
            "dailyEntryId": {"dataType":"string","required":true},
            "entryDate": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EligibilityResponse": {
        "dataType": "refObject",
        "properties": {
            "eligible": {"dataType":"boolean","required":true},
            "journalDays": {"dataType":"double","required":true},
            "requiredDays": {"dataType":"double","required":true},
            "weekStart": {"dataType":"string","required":true},
            "weekEnd": {"dataType":"string","required":true},
            "entries": {"dataType":"array","array":{"dataType":"refObject","ref":"DailyEntryItem"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_EligibilityResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"EligibilityResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DashboardListItem": {
        "dataType": "refObject",
        "properties": {
            "dashboardId": {"dataType":"string","required":true},
            "startDate": {"dataType":"string","required":true},
            "endDate": {"dataType":"string","required":true},
            "summary": {"dataType":"string","required":true},
            "createdAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_DashboardListItem-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"DashboardListItem"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Insight": {
        "dataType": "refObject",
        "properties": {
            "journalDays": {"dataType":"double","required":true},
            "performanceCount": {"dataType":"double","required":true},
            "tagCount": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Kpi": {
        "dataType": "refObject",
        "properties": {
            "kpiName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "progress": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TagAnalysis": {
        "dataType": "refObject",
        "properties": {
            "goal": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "expectedOutcome": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "taskCount": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "periodStart": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "periodEnd": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "achievementStatus": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "WeeklyReflection": {
        "dataType": "refObject",
        "properties": {
            "workSummary": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "resourcesUsed": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "learning": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PerformanceItemDto": {
        "dataType": "refObject",
        "properties": {
            "output": {"dataType":"any","required":true},
            "impact": {"dataType":"any","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PerformanceDto": {
        "dataType": "refObject",
        "properties": {
            "achievementRate": {"dataType":"double","required":true},
            "summary": {"dataType":"string","required":true},
            "growthInsight": {"dataType":"any","required":true},
            "nextAction": {"dataType":"any","required":true},
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"PerformanceItemDto"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DashboardDetail": {
        "dataType": "refObject",
        "properties": {
            "dashboardId": {"dataType":"string","required":true},
            "startDate": {"dataType":"string","required":true},
            "endDate": {"dataType":"string","required":true},
            "summary": {"dataType":"string","required":true},
            "journalDays": {"dataType":"double","required":true},
            "performanceCount": {"dataType":"double","required":true},
            "tagCount": {"dataType":"double","required":true},
            "insights": {"dataType":"array","array":{"dataType":"refObject","ref":"Insight"},"required":true},
            "kpis": {"dataType":"array","array":{"dataType":"refObject","ref":"Kpi"},"required":true},
            "tagAnalyses": {"dataType":"array","array":{"dataType":"refObject","ref":"TagAnalysis"},"required":true},
            "weeklyReflections": {"dataType":"array","array":{"dataType":"refObject","ref":"WeeklyReflection"},"required":true},
            "performances": {"dataType":"array","array":{"dataType":"refObject","ref":"PerformanceDto"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_DashboardDetail_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"DashboardDetail"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_any_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"any"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateWeeklyReflectionRequest": {
        "dataType": "refObject",
        "properties": {
            "workSummary": {"dataType":"string"},
            "resourcesUsed": {"dataType":"string"},
            "learning": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "WeeklyDashboardItem": {
        "dataType": "refObject",
        "properties": {
            "dashboardId": {"dataType":"string","required":true},
            "startDate": {"dataType":"string","required":true},
            "endDate": {"dataType":"string","required":true},
            "summary": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyEligibilityResponse": {
        "dataType": "refObject",
        "properties": {
            "eligible": {"dataType":"boolean","required":true},
            "weeklyDashboardCount": {"dataType":"double","required":true},
            "requiredCount": {"dataType":"double","required":true},
            "monthStart": {"dataType":"string","required":true},
            "monthEnd": {"dataType":"string","required":true},
            "weeklyDashboards": {"dataType":"array","array":{"dataType":"refObject","ref":"WeeklyDashboardItem"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_MonthlyEligibilityResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"MonthlyEligibilityResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyDashboardListItem": {
        "dataType": "refObject",
        "properties": {
            "dashboardId": {"dataType":"string","required":true},
            "startDate": {"dataType":"string","required":true},
            "endDate": {"dataType":"string","required":true},
            "summary": {"dataType":"string","required":true},
            "createdAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_MonthlyDashboardListItem-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"MonthlyDashboardListItem"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyInsight": {
        "dataType": "refObject",
        "properties": {
            "journalDays": {"dataType":"double","required":true},
            "performanceCount": {"dataType":"double","required":true},
            "tagCount": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyKpi": {
        "dataType": "refObject",
        "properties": {
            "kpiName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "progress": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyTagAnalysis": {
        "dataType": "refObject",
        "properties": {
            "goal": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "expectedOutcome": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "taskCount": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "periodStart": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "periodEnd": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "achievementStatus": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyReflectionItem": {
        "dataType": "refObject",
        "properties": {
            "workSummary": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "resourcesUsed": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "learning": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyPerformanceItemDto": {
        "dataType": "refObject",
        "properties": {
            "output": {"dataType":"any","required":true},
            "impact": {"dataType":"any","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyPerformanceDto": {
        "dataType": "refObject",
        "properties": {
            "achievementRate": {"dataType":"double","required":true},
            "summary": {"dataType":"string","required":true},
            "growthInsight": {"dataType":"any","required":true},
            "nextAction": {"dataType":"any","required":true},
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"MonthlyPerformanceItemDto"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyDashboardDetail": {
        "dataType": "refObject",
        "properties": {
            "dashboardId": {"dataType":"string","required":true},
            "startDate": {"dataType":"string","required":true},
            "endDate": {"dataType":"string","required":true},
            "summary": {"dataType":"string","required":true},
            "journalDays": {"dataType":"double","required":true},
            "performanceCount": {"dataType":"double","required":true},
            "tagCount": {"dataType":"double","required":true},
            "insights": {"dataType":"array","array":{"dataType":"refObject","ref":"MonthlyInsight"},"required":true},
            "kpis": {"dataType":"array","array":{"dataType":"refObject","ref":"MonthlyKpi"},"required":true},
            "tagAnalyses": {"dataType":"array","array":{"dataType":"refObject","ref":"MonthlyTagAnalysis"},"required":true},
            "weeklyReflections": {"dataType":"array","array":{"dataType":"refObject","ref":"MonthlyReflectionItem"},"required":true},
            "performances": {"dataType":"array","array":{"dataType":"refObject","ref":"MonthlyPerformanceDto"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_MonthlyDashboardDetail_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"MonthlyDashboardDetail"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateMonthlyReflectionRequest": {
        "dataType": "refObject",
        "properties": {
            "workSummary": {"dataType":"string"},
            "resourcesUsed": {"dataType":"string"},
            "learning": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateDailyEntryResponse": {
        "dataType": "refObject",
        "properties": {
            "dailyEntryId": {"dataType":"string","required":true},
            "entryDate": {"dataType":"string","required":true},
            "reflectionContent": {"dataType":"string","required":true},
            "linkedTaskCount": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_CreateDailyEntryResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"CreateDailyEntryResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateDailyEntryRequest": {
        "dataType": "refObject",
        "properties": {
            "entryDate": {"dataType":"string","required":true},
            "reflectionContent": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyCountCard": {
        "dataType": "refObject",
        "properties": {
            "count": {"dataType":"double","required":true},
            "diffFromLastMonth": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StreakCard": {
        "dataType": "refObject",
        "properties": {
            "currentStreak": {"dataType":"double","required":true},
            "maxStreak": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TopCategoryCard": {
        "dataType": "refObject",
        "properties": {
            "tagName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "color": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "percentage": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DailyEntriesSummaryResponse": {
        "dataType": "refObject",
        "properties": {
            "monthlyCount": {"ref":"MonthlyCountCard","required":true},
            "streak": {"ref":"StreakCard","required":true},
            "topCategory": {"ref":"TopCategoryCard","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_DailyEntriesSummaryResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"DailyEntriesSummaryResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TagChip": {
        "dataType": "refObject",
        "properties": {
            "tagName": {"dataType":"string","required":true},
            "color": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyRecordItem": {
        "dataType": "refObject",
        "properties": {
            "yearMonth": {"dataType":"string","required":true},
            "year": {"dataType":"double","required":true},
            "month": {"dataType":"double","required":true},
            "totalDays": {"dataType":"double","required":true},
            "tags": {"dataType":"array","array":{"dataType":"refObject","ref":"TagChip"},"required":true},
            "summary": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_MonthlyRecordItem-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"MonthlyRecordItem"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DailyRecordItem": {
        "dataType": "refObject",
        "properties": {
            "dailyEntryId": {"dataType":"string","required":true},
            "entryDate": {"dataType":"string","required":true},
            "day": {"dataType":"double","required":true},
            "tags": {"dataType":"array","array":{"dataType":"refObject","ref":"TagChip"},"required":true},
            "mainTaskTitle": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "extraTaskCount": {"dataType":"double","required":true},
            "summary": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_DailyRecordItem-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"DailyRecordItem"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SearchResultItem": {
        "dataType": "refObject",
        "properties": {
            "dailyEntryId": {"dataType":"string","required":true},
            "entryDate": {"dataType":"string","required":true},
            "tags": {"dataType":"array","array":{"dataType":"refObject","ref":"TagChip"},"required":true},
            "title": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DailyEntriesSearchResponse": {
        "dataType": "refObject",
        "properties": {
            "keyword": {"dataType":"string","required":true},
            "entryCount": {"dataType":"double","required":true},
            "tagCount": {"dataType":"double","required":true},
            "results": {"dataType":"array","array":{"dataType":"refObject","ref":"SearchResultItem"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_DailyEntriesSearchResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"DailyEntriesSearchResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AttachmentItem": {
        "dataType": "refObject",
        "properties": {
            "fileType": {"dataType":"string","required":true},
            "fileUrl": {"dataType":"string","required":true},
            "fileName": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskResultItem": {
        "dataType": "refObject",
        "properties": {
            "taskResultId": {"dataType":"string","required":true},
            "content": {"dataType":"string","required":true},
            "attachments": {"dataType":"array","array":{"dataType":"refObject","ref":"AttachmentItem"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DailyEntriesTaskItem": {
        "dataType": "refObject",
        "properties": {
            "taskId": {"dataType":"string","required":true},
            "tag": {"dataType":"union","subSchemas":[{"ref":"TagChip"},{"dataType":"enum","enums":[null]}],"required":true},
            "title": {"dataType":"string","required":true},
            "memo": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "priority": {"dataType":"string","required":true},
            "status": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"TaskResultItem"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DailyEntriesDetailResponse": {
        "dataType": "refObject",
        "properties": {
            "dailyEntryId": {"dataType":"string","required":true},
            "entryDate": {"dataType":"string","required":true},
            "reflectionContent": {"dataType":"string","required":true},
            "completedCount": {"dataType":"double","required":true},
            "incompleteCount": {"dataType":"double","required":true},
            "tasks": {"dataType":"array","array":{"dataType":"refObject","ref":"DailyEntriesTaskItem"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_DailyEntriesDetailResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"DailyEntriesDetailResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse__dailyEntryId-string__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"dailyEntryId":{"dataType":"string","required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse__email-string__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string","required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AgreementType": {
        "dataType": "refEnum",
        "enums": ["TERMS_OF_SERVICE","PRIVACY_POLICY","AGE_OVER_14","MARKETING"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AgreementInput": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"AgreementType","required":true},
            "isAgreed": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SignupRequest": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
            "agreements": {"dataType":"array","array":{"dataType":"refObject","ref":"AgreementInput"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse__accessToken-string--refreshToken-string--email-string__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string","required":true},"refreshToken":{"dataType":"string","required":true},"accessToken":{"dataType":"string","required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginRequest": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LogoutRequest": {
        "dataType": "refObject",
        "properties": {
            "refreshToken": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse__accessToken-string--refreshToken-string__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"refreshToken":{"dataType":"string","required":true},"accessToken":{"dataType":"string","required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RefreshRequest": {
        "dataType": "refObject",
        "properties": {
            "refreshToken": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GoogleCallbackResult": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string","required":true},"refreshToken":{"dataType":"string","required":true},"accessToken":{"dataType":"string","required":true},"status":{"dataType":"enum","enums":["login"],"required":true}}},{"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string","required":true},"pendingToken":{"dataType":"string","required":true},"status":{"dataType":"enum","enums":["pending"],"required":true}}}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_GoogleCallbackResult_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"ref":"GoogleCallbackResult"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GoogleCompleteSignupRequest": {
        "dataType": "refObject",
        "properties": {
            "token": {"dataType":"string","required":true},
            "agreements": {"dataType":"array","array":{"dataType":"refObject","ref":"AgreementInput"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SupplementQuestionDto": {
        "dataType": "refObject",
        "properties": {
            "question": {"dataType":"string","required":true},
            "reason": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskPerformanceDto": {
        "dataType": "refObject",
        "properties": {
            "taskId": {"dataType":"string","required":true},
            "output": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "impact": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PerformanceResponseDto": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["QUESTION_REQUIRED"]},{"dataType":"enum","enums":["COMPLETED"]}],"required":true},
            "supplementQuestions": {"dataType":"array","array":{"dataType":"refObject","ref":"SupplementQuestionDto"}},
            "summary": {"dataType":"string"},
            "growthInsights": {"dataType":"array","array":{"dataType":"string"}},
            "nextActions": {"dataType":"array","array":{"dataType":"string"}},
            "taskPerformances": {"dataType":"array","array":{"dataType":"refObject","ref":"TaskPerformanceDto"}},
            "reflectionSnapshotId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskDto": {
        "dataType": "refObject",
        "properties": {
            "taskId": {"dataType":"string","required":true},
            "taskResultId": {"dataType":"string"},
            "priority": {"ref":"TaskPriority","required":true},
            "completed": {"dataType":"boolean","required":true},
            "title": {"dataType":"string","required":true},
            "memo": {"dataType":"string"},
            "result": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProjectTagDto": {
        "dataType": "refObject",
        "properties": {
            "projectTagId": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "kpis": {"dataType":"array","array":{"dataType":"string"}},
            "purpose": {"dataType":"string"},
            "expectedOutcome": {"dataType":"string"},
            "period": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PerformanceRequestDto": {
        "dataType": "refObject",
        "properties": {
            "dailyEntryId": {"dataType":"string","required":true},
            "tasks": {"dataType":"array","array":{"dataType":"refObject","ref":"TaskDto"},"required":true},
            "reflectionContent": {"dataType":"string","required":true},
            "projectTag": {"ref":"ProjectTagDto"},
            "userJob": {"ref":"JobRole","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "QuestionAnswerDto": {
        "dataType": "refObject",
        "properties": {
            "question": {"dataType":"string","required":true},
            "answer": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PerformanceQuestionRequestDto": {
        "dataType": "refObject",
        "properties": {
            "reflectionSnapshotId": {"dataType":"string","required":true},
            "originalRequest": {"ref":"PerformanceRequestDto","required":true},
            "answers": {"dataType":"array","array":{"dataType":"refObject","ref":"QuestionAnswerDto"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "KpiResponseDto": {
        "dataType": "refObject",
        "properties": {
            "kpiRecommendations": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "KpiRequestDto": {
        "dataType": "refObject",
        "properties": {
            "tagName": {"dataType":"string","required":true},
            "projectName": {"dataType":"string","required":true},
            "goal": {"dataType":"string","required":true},
            "expectedOutcome": {"dataType":"string","required":true},
            "period": {"dataType":"string"},
            "userJob": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DashboardKpiDto": {
        "dataType": "refObject",
        "properties": {
            "kpiName": {"dataType":"string","required":true},
            "progress": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DashboardTagAnalysisDto": {
        "dataType": "refObject",
        "properties": {
            "tagName": {"dataType":"string","required":true},
            "objective": {"dataType":"string","required":true},
            "expectedOutcome": {"dataType":"string","required":true},
            "achievementStatus": {"dataType":"string","required":true},
            "insight": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DashboardResponseDto": {
        "dataType": "refObject",
        "properties": {
            "dashboardId": {"dataType":"string","required":true},
            "startDate": {"dataType":"string","required":true},
            "endDate": {"dataType":"string","required":true},
            "summary": {"dataType":"string","required":true},
            "journalDays": {"dataType":"double","required":true},
            "performanceCount": {"dataType":"double","required":true},
            "tagCount": {"dataType":"double","required":true},
            "kpis": {"dataType":"array","array":{"dataType":"refObject","ref":"DashboardKpiDto"},"required":true},
            "tagAnalyses": {"dataType":"array","array":{"dataType":"refObject","ref":"DashboardTagAnalysisDto"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DashboardRequestDto": {
        "dataType": "refObject",
        "properties": {
            "userId": {"dataType":"string","required":true},
            "startDate": {"dataType":"string","required":true},
            "endDate": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsUsersController_completeProfile: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"Authorization","required":true,"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"undefined"}]},
                body: {"in":"body","name":"body","required":true,"ref":"CompleteProfileRequest"},
        };
        app.post('/users/profile',
            ...(fetchMiddlewares<RequestHandler>(UsersController)),
            ...(fetchMiddlewares<RequestHandler>(UsersController.prototype.completeProfile)),

            async function UsersController_completeProfile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsersController_completeProfile, request, response });

                const controller = new UsersController();

              await templateService.apiHandler({
                methodName: 'completeProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUsersController_getMyProfile: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"Authorization","required":true,"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"undefined"}]},
        };
        app.get('/users/profile',
            ...(fetchMiddlewares<RequestHandler>(UsersController)),
            ...(fetchMiddlewares<RequestHandler>(UsersController.prototype.getMyProfile)),

            async function UsersController_getMyProfile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsersController_getMyProfile, request, response });

                const controller = new UsersController();

              await templateService.apiHandler({
                methodName: 'getMyProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTaskController_getTasksByDate: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"authorization","required":true,"dataType":"string"},
                date: {"in":"query","name":"date","required":true,"dataType":"string"},
        };
        app.get('/tasks',
            ...(fetchMiddlewares<RequestHandler>(TaskController)),
            ...(fetchMiddlewares<RequestHandler>(TaskController.prototype.getTasksByDate)),

            async function TaskController_getTasksByDate(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTaskController_getTasksByDate, request, response });

                const controller = new TaskController();

              await templateService.apiHandler({
                methodName: 'getTasksByDate',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTaskController_createTask: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"authorization","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"CreateTaskRequest"},
        };
        app.post('/tasks',
            ...(fetchMiddlewares<RequestHandler>(TaskController)),
            ...(fetchMiddlewares<RequestHandler>(TaskController.prototype.createTask)),

            async function TaskController_createTask(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTaskController_createTask, request, response });

                const controller = new TaskController();

              await templateService.apiHandler({
                methodName: 'createTask',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTaskController_getTask: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"authorization","required":true,"dataType":"string"},
                taskId: {"in":"path","name":"taskId","required":true,"dataType":"string"},
        };
        app.get('/tasks/:taskId',
            ...(fetchMiddlewares<RequestHandler>(TaskController)),
            ...(fetchMiddlewares<RequestHandler>(TaskController.prototype.getTask)),

            async function TaskController_getTask(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTaskController_getTask, request, response });

                const controller = new TaskController();

              await templateService.apiHandler({
                methodName: 'getTask',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTaskController_updateTask: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"authorization","required":true,"dataType":"string"},
                taskId: {"in":"path","name":"taskId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateTaskRequest"},
        };
        app.patch('/tasks/:taskId',
            ...(fetchMiddlewares<RequestHandler>(TaskController)),
            ...(fetchMiddlewares<RequestHandler>(TaskController.prototype.updateTask)),

            async function TaskController_updateTask(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTaskController_updateTask, request, response });

                const controller = new TaskController();

              await templateService.apiHandler({
                methodName: 'updateTask',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTaskController_deleteTask: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"authorization","required":true,"dataType":"string"},
                taskId: {"in":"path","name":"taskId","required":true,"dataType":"string"},
        };
        app.delete('/tasks/:taskId',
            ...(fetchMiddlewares<RequestHandler>(TaskController)),
            ...(fetchMiddlewares<RequestHandler>(TaskController.prototype.deleteTask)),

            async function TaskController_deleteTask(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTaskController_deleteTask, request, response });

                const controller = new TaskController();

              await templateService.apiHandler({
                methodName: 'deleteTask',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTaskResultController_upsertTaskResult: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"authorization","required":true,"dataType":"string"},
                taskId: {"in":"path","name":"taskId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpsertTaskResultRequest"},
        };
        app.put('/tasks/:taskId/result',
            ...(fetchMiddlewares<RequestHandler>(TaskResultController)),
            ...(fetchMiddlewares<RequestHandler>(TaskResultController.prototype.upsertTaskResult)),

            async function TaskResultController_upsertTaskResult(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTaskResultController_upsertTaskResult, request, response });

                const controller = new TaskResultController();

              await templateService.apiHandler({
                methodName: 'upsertTaskResult',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTagController_getTags: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"Authorization","required":true,"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"undefined"}]},
        };
        app.get('/tags',
            ...(fetchMiddlewares<RequestHandler>(TagController)),
            ...(fetchMiddlewares<RequestHandler>(TagController.prototype.getTags)),

            async function TagController_getTags(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTagController_getTags, request, response });

                const controller = new TagController();

              await templateService.apiHandler({
                methodName: 'getTags',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTagController_createTag: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"Authorization","required":true,"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"undefined"}]},
                body: {"in":"body","name":"body","required":true,"ref":"CreateTagRequest"},
        };
        app.post('/tags',
            ...(fetchMiddlewares<RequestHandler>(TagController)),
            ...(fetchMiddlewares<RequestHandler>(TagController.prototype.createTag)),

            async function TagController_createTag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTagController_createTag, request, response });

                const controller = new TagController();

              await templateService.apiHandler({
                methodName: 'createTag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTagController_getTag: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"Authorization","required":true,"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"undefined"}]},
                tagId: {"in":"path","name":"tagId","required":true,"dataType":"string"},
        };
        app.get('/tags/:tagId',
            ...(fetchMiddlewares<RequestHandler>(TagController)),
            ...(fetchMiddlewares<RequestHandler>(TagController.prototype.getTag)),

            async function TagController_getTag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTagController_getTag, request, response });

                const controller = new TagController();

              await templateService.apiHandler({
                methodName: 'getTag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTagController_updateTag: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"Authorization","required":true,"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"undefined"}]},
                tagId: {"in":"path","name":"tagId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateTagRequest"},
        };
        app.patch('/tags/:tagId',
            ...(fetchMiddlewares<RequestHandler>(TagController)),
            ...(fetchMiddlewares<RequestHandler>(TagController.prototype.updateTag)),

            async function TagController_updateTag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTagController_updateTag, request, response });

                const controller = new TagController();

              await templateService.apiHandler({
                methodName: 'updateTag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTagController_deleteTag: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"Authorization","required":true,"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"undefined"}]},
                tagId: {"in":"path","name":"tagId","required":true,"dataType":"string"},
        };
        app.delete('/tags/:tagId',
            ...(fetchMiddlewares<RequestHandler>(TagController)),
            ...(fetchMiddlewares<RequestHandler>(TagController.prototype.deleteTag)),

            async function TagController_deleteTag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTagController_deleteTag, request, response });

                const controller = new TagController();

              await templateService.apiHandler({
                methodName: 'deleteTag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsHomeController_getHome: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"Authorization","required":true,"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"undefined"}]},
        };
        app.get('/home',
            ...(fetchMiddlewares<RequestHandler>(HomeController)),
            ...(fetchMiddlewares<RequestHandler>(HomeController.prototype.getHome)),

            async function HomeController_getHome(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsHomeController_getHome, request, response });

                const controller = new HomeController();

              await templateService.apiHandler({
                methodName: 'getHome',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardController_getEligibility: Record<string, TsoaRoute.ParameterSchema> = {
                baseDate: {"in":"query","name":"baseDate","dataType":"string"},
        };
        app.get('/dashboards/eligibility',
            ...(fetchMiddlewares<RequestHandler>(DashboardController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardController.prototype.getEligibility)),

            async function DashboardController_getEligibility(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardController_getEligibility, request, response });

                const controller = new DashboardController();

              await templateService.apiHandler({
                methodName: 'getEligibility',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardController_getList: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/dashboards',
            ...(fetchMiddlewares<RequestHandler>(DashboardController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardController.prototype.getList)),

            async function DashboardController_getList(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardController_getList, request, response });

                const controller = new DashboardController();

              await templateService.apiHandler({
                methodName: 'getList',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardController_getDetail: Record<string, TsoaRoute.ParameterSchema> = {
                dashboardId: {"in":"path","name":"dashboardId","required":true,"dataType":"string"},
        };
        app.get('/dashboards/:dashboardId',
            ...(fetchMiddlewares<RequestHandler>(DashboardController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardController.prototype.getDetail)),

            async function DashboardController_getDetail(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardController_getDetail, request, response });

                const controller = new DashboardController();

              await templateService.apiHandler({
                methodName: 'getDetail',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardController_createReflection: Record<string, TsoaRoute.ParameterSchema> = {
                dashboardId: {"in":"path","name":"dashboardId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"CreateWeeklyReflectionRequest"},
        };
        app.post('/dashboards/:dashboardId/reflection',
            ...(fetchMiddlewares<RequestHandler>(DashboardController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardController.prototype.createReflection)),

            async function DashboardController_createReflection(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardController_createReflection, request, response });

                const controller = new DashboardController();

              await templateService.apiHandler({
                methodName: 'createReflection',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardController_updateReflection: Record<string, TsoaRoute.ParameterSchema> = {
                dashboardId: {"in":"path","name":"dashboardId","required":true,"dataType":"string"},
                reflectionId: {"in":"path","name":"reflectionId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"CreateWeeklyReflectionRequest"},
        };
        app.patch('/dashboards/:dashboardId/reflection/:reflectionId',
            ...(fetchMiddlewares<RequestHandler>(DashboardController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardController.prototype.updateReflection)),

            async function DashboardController_updateReflection(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardController_updateReflection, request, response });

                const controller = new DashboardController();

              await templateService.apiHandler({
                methodName: 'updateReflection',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardController_createDashboard: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"endDate":{"dataType":"string","required":true},"startDate":{"dataType":"string","required":true}}},
        };
        app.post('/dashboards',
            ...(fetchMiddlewares<RequestHandler>(DashboardController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardController.prototype.createDashboard)),

            async function DashboardController_createDashboard(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardController_createDashboard, request, response });

                const controller = new DashboardController();

              await templateService.apiHandler({
                methodName: 'createDashboard',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMonthlyDashboardController_getEligibility: Record<string, TsoaRoute.ParameterSchema> = {
                baseDate: {"in":"query","name":"baseDate","dataType":"string"},
        };
        app.get('/dashboards/monthly/eligibility',
            ...(fetchMiddlewares<RequestHandler>(MonthlyDashboardController)),
            ...(fetchMiddlewares<RequestHandler>(MonthlyDashboardController.prototype.getEligibility)),

            async function MonthlyDashboardController_getEligibility(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonthlyDashboardController_getEligibility, request, response });

                const controller = new MonthlyDashboardController();

              await templateService.apiHandler({
                methodName: 'getEligibility',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMonthlyDashboardController_getList: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/dashboards/monthly',
            ...(fetchMiddlewares<RequestHandler>(MonthlyDashboardController)),
            ...(fetchMiddlewares<RequestHandler>(MonthlyDashboardController.prototype.getList)),

            async function MonthlyDashboardController_getList(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonthlyDashboardController_getList, request, response });

                const controller = new MonthlyDashboardController();

              await templateService.apiHandler({
                methodName: 'getList',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMonthlyDashboardController_getDetail: Record<string, TsoaRoute.ParameterSchema> = {
                dashboardId: {"in":"path","name":"dashboardId","required":true,"dataType":"string"},
        };
        app.get('/dashboards/monthly/:dashboardId',
            ...(fetchMiddlewares<RequestHandler>(MonthlyDashboardController)),
            ...(fetchMiddlewares<RequestHandler>(MonthlyDashboardController.prototype.getDetail)),

            async function MonthlyDashboardController_getDetail(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonthlyDashboardController_getDetail, request, response });

                const controller = new MonthlyDashboardController();

              await templateService.apiHandler({
                methodName: 'getDetail',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMonthlyDashboardController_createReflection: Record<string, TsoaRoute.ParameterSchema> = {
                dashboardId: {"in":"path","name":"dashboardId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"CreateMonthlyReflectionRequest"},
        };
        app.post('/dashboards/monthly/:dashboardId/reflection',
            ...(fetchMiddlewares<RequestHandler>(MonthlyDashboardController)),
            ...(fetchMiddlewares<RequestHandler>(MonthlyDashboardController.prototype.createReflection)),

            async function MonthlyDashboardController_createReflection(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonthlyDashboardController_createReflection, request, response });

                const controller = new MonthlyDashboardController();

              await templateService.apiHandler({
                methodName: 'createReflection',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMonthlyDashboardController_createDashboard: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"endDate":{"dataType":"string","required":true},"startDate":{"dataType":"string","required":true}}},
        };
        app.post('/dashboards/monthly',
            ...(fetchMiddlewares<RequestHandler>(MonthlyDashboardController)),
            ...(fetchMiddlewares<RequestHandler>(MonthlyDashboardController.prototype.createDashboard)),

            async function MonthlyDashboardController_createDashboard(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMonthlyDashboardController_createDashboard, request, response });

                const controller = new MonthlyDashboardController();

              await templateService.apiHandler({
                methodName: 'createDashboard',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDailyEntriesWriteController_create: Record<string, TsoaRoute.ParameterSchema> = {
                authorization: {"in":"header","name":"authorization","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"CreateDailyEntryRequest"},
        };
        app.post('/daily-entries',
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesWriteController)),
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesWriteController.prototype.create)),

            async function DailyEntriesWriteController_create(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDailyEntriesWriteController_create, request, response });

                const controller = new DailyEntriesWriteController();

              await templateService.apiHandler({
                methodName: 'create',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDailyEntriesController_getSummary: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/daily-entries/summary',
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesController)),
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesController.prototype.getSummary)),

            async function DailyEntriesController_getSummary(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDailyEntriesController_getSummary, request, response });

                const controller = new DailyEntriesController();

              await templateService.apiHandler({
                methodName: 'getSummary',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDailyEntriesController_getMonthly: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/daily-entries/monthly',
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesController)),
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesController.prototype.getMonthly)),

            async function DailyEntriesController_getMonthly(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDailyEntriesController_getMonthly, request, response });

                const controller = new DailyEntriesController();

              await templateService.apiHandler({
                methodName: 'getMonthly',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDailyEntriesController_getMonthlyEntries: Record<string, TsoaRoute.ParameterSchema> = {
                yearMonth: {"in":"path","name":"yearMonth","required":true,"dataType":"string"},
        };
        app.get('/daily-entries/monthly/:yearMonth',
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesController)),
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesController.prototype.getMonthlyEntries)),

            async function DailyEntriesController_getMonthlyEntries(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDailyEntriesController_getMonthlyEntries, request, response });

                const controller = new DailyEntriesController();

              await templateService.apiHandler({
                methodName: 'getMonthlyEntries',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDailyEntriesController_search: Record<string, TsoaRoute.ParameterSchema> = {
                query: {"in":"query","name":"query","required":true,"dataType":"string"},
                sort: {"default":"latest","in":"query","name":"sort","dataType":"union","subSchemas":[{"dataType":"enum","enums":["latest"]},{"dataType":"enum","enums":["oldest"]}]},
        };
        app.get('/daily-entries/search',
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesController)),
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesController.prototype.search)),

            async function DailyEntriesController_search(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDailyEntriesController_search, request, response });

                const controller = new DailyEntriesController();

              await templateService.apiHandler({
                methodName: 'search',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDailyEntriesController_getDetail: Record<string, TsoaRoute.ParameterSchema> = {
                dailyEntryId: {"in":"path","name":"dailyEntryId","required":true,"dataType":"string"},
        };
        app.get('/daily-entries/:dailyEntryId',
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesController)),
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesController.prototype.getDetail)),

            async function DailyEntriesController_getDetail(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDailyEntriesController_getDetail, request, response });

                const controller = new DailyEntriesController();

              await templateService.apiHandler({
                methodName: 'getDetail',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDailyEntriesController_deleteDailyEntry: Record<string, TsoaRoute.ParameterSchema> = {
                dailyEntryId: {"in":"path","name":"dailyEntryId","required":true,"dataType":"string"},
        };
        app.delete('/daily-entries/:dailyEntryId',
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesController)),
            ...(fetchMiddlewares<RequestHandler>(DailyEntriesController.prototype.deleteDailyEntry)),

            async function DailyEntriesController_deleteDailyEntry(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDailyEntriesController_deleteDailyEntry, request, response });

                const controller = new DailyEntriesController();

              await templateService.apiHandler({
                methodName: 'deleteDailyEntry',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_signup: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"SignupRequest"},
        };
        app.post('/auth/signup',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.signup)),

            async function AuthController_signup(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_signup, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'signup',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_verifyEmail: Record<string, TsoaRoute.ParameterSchema> = {
                token: {"in":"query","name":"token","required":true,"dataType":"string"},
        };
        app.get('/auth/verify-email',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.verifyEmail)),

            async function AuthController_verifyEmail(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_verifyEmail, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'verifyEmail',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_login: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"LoginRequest"},
        };
        app.post('/auth/login',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.login)),

            async function AuthController_login(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_login, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_logout: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"LogoutRequest"},
        };
        app.post('/auth/logout',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.logout)),

            async function AuthController_logout(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_logout, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'logout',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_refresh: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"RefreshRequest"},
        };
        app.post('/auth/refresh',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.refresh)),

            async function AuthController_refresh(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_refresh, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'refresh',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_googleLogin: Record<string, TsoaRoute.ParameterSchema> = {
                redirect: {"in":"res","name":"302","required":true,"dataType":"void"},
        };
        app.get('/auth/google',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.googleLogin)),

            async function AuthController_googleLogin(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_googleLogin, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'googleLogin',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_googleCallback: Record<string, TsoaRoute.ParameterSchema> = {
                code: {"in":"query","name":"code","required":true,"dataType":"string"},
        };
        app.get('/auth/google/callback',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.googleCallback)),

            async function AuthController_googleCallback(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_googleCallback, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'googleCallback',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_completeGoogleSignup: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"GoogleCompleteSignupRequest"},
        };
        app.post('/auth/google/complete',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.completeGoogleSignup)),

            async function AuthController_completeGoogleSignup(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_completeGoogleSignup, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'completeGoogleSignup',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPerformanceController_createPerformancePreview: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"ref":"PerformanceRequestDto"},
        };
        app.post('/ai/performance-preview',
            ...(fetchMiddlewares<RequestHandler>(PerformanceController)),
            ...(fetchMiddlewares<RequestHandler>(PerformanceController.prototype.createPerformancePreview)),

            async function PerformanceController_createPerformancePreview(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPerformanceController_createPerformancePreview, request, response });

                const controller = new PerformanceController();

              await templateService.apiHandler({
                methodName: 'createPerformancePreview',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPerformanceController_completePerformancePreview: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"ref":"PerformanceQuestionRequestDto"},
        };
        app.post('/ai/performance-preview/complete',
            ...(fetchMiddlewares<RequestHandler>(PerformanceController)),
            ...(fetchMiddlewares<RequestHandler>(PerformanceController.prototype.completePerformancePreview)),

            async function PerformanceController_completePerformancePreview(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPerformanceController_completePerformancePreview, request, response });

                const controller = new PerformanceController();

              await templateService.apiHandler({
                methodName: 'completePerformancePreview',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsKpiController_createKpiRecommendation: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"ref":"KpiRequestDto"},
        };
        app.post('/ai/project-tags/kpi-recommendation',
            ...(fetchMiddlewares<RequestHandler>(KpiController)),
            ...(fetchMiddlewares<RequestHandler>(KpiController.prototype.createKpiRecommendation)),

            async function KpiController_createKpiRecommendation(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsKpiController_createKpiRecommendation, request, response });

                const controller = new KpiController();

              await templateService.apiHandler({
                methodName: 'createKpiRecommendation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardAiController_createDashboard: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"ref":"DashboardRequestDto"},
        };
        app.post('/ai/dashboard/weekly',
            ...(fetchMiddlewares<RequestHandler>(DashboardAiController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardAiController.prototype.createDashboard)),

            async function DashboardAiController_createDashboard(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardAiController_createDashboard, request, response });

                const controller = new DashboardAiController();

              await templateService.apiHandler({
                methodName: 'createDashboard',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardAiController_createMonthlyDashboard: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"ref":"DashboardRequestDto"},
        };
        app.post('/ai/dashboard/monthly',
            ...(fetchMiddlewares<RequestHandler>(DashboardAiController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardAiController.prototype.createMonthlyDashboard)),

            async function DashboardAiController_createMonthlyDashboard(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardAiController_createMonthlyDashboard, request, response });

                const controller = new DashboardAiController();

              await templateService.apiHandler({
                methodName: 'createMonthlyDashboard',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
