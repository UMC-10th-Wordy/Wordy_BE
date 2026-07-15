/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UsersController } from './../modules/users/users.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DashboardController } from './../modules/dashboard.week/dashboard.week.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MonthlyDashboardController } from './../modules/dashboard.month/dashboard.month.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../modules/auth/auth.controller';
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
            "output": {"dataType":"string","required":true},
            "impact": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PerformanceDto": {
        "dataType": "refObject",
        "properties": {
            "achievementRate": {"dataType":"double","required":true},
            "summary": {"dataType":"string","required":true},
            "growthInsight": {"dataType":"string","required":true},
            "nextAction": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
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
            "output": {"dataType":"string","required":true},
            "impact": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyPerformanceDto": {
        "dataType": "refObject",
        "properties": {
            "achievementRate": {"dataType":"double","required":true},
            "summary": {"dataType":"string","required":true},
            "growthInsight": {"dataType":"string","required":true},
            "nextAction": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
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

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
