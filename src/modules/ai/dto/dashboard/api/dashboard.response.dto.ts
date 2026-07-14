export interface DashboardResponseDto {
    dashboardId:string;
    startDate:string;
    endDate:string;
    summary:string;
    journalDays:number;
    performanceCount:number;
    tagCount:number;
    kpis:DashboardKpiDto[];
    tagAnalyses:DashboardTagAnalysisDto[];
    weeklyReflection:WeeklyReflectionDto;
}

export interface DashboardKpiDto {
    kpiName:string;
    progress:string;
}

export interface DashboardTagAnalysisDto {
    goal:string;
    expectedOutcome:string;
    taskCount:number;
    achievementStatus:string;
}

export interface WeeklyReflectionDto {
    workSummary:string;
    resourcesUsed:string;
    learning:string;
}