-- CreateTable
CREATE TABLE `User` (
    `user_id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `provider` ENUM('local', 'google') NOT NULL DEFAULT 'local',
    `password` VARCHAR(255) NULL,
    `refresh_token` VARCHAR(512) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `profile_id` CHAR(36) NOT NULL,
    `user_name` VARCHAR(5) NOT NULL,
    `profile_img_url` VARCHAR(255) NULL,
    `years_of_service` ENUM('UNDER_1', 'ONE_TO_3', 'THREE_TO_5', 'FIVE_TO_10', 'OVER_10') NOT NULL,
    `job_role` ENUM('PRODUCT_PLANNING', 'DEVELOPMENT', 'DESIGN', 'MARKETING_SALES', 'DATA_ANALYSIS', 'CUSTOMER_SUPPORT', 'HR', 'FINANCE_ACCOUNTING', 'EDUCATION_RESEARCH', 'FREELANCER', 'STUDENT', 'ETC') NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `user_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `Profile_user_id_key`(`user_id`),
    PRIMARY KEY (`profile_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAgreement` (
    `agreement_id` CHAR(36) NOT NULL,
    `type` ENUM('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'AGE_OVER_14', 'MARKETING') NOT NULL,
    `is_agreed` BOOLEAN NOT NULL,
    `agreed_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `revoke_at` DATETIME(0) NULL,
    `policy_version` VARCHAR(50) NOT NULL DEFAULT 'v1',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `user_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `UserAgreement_user_id_type_key`(`user_id`, `type`),
    PRIMARY KEY (`agreement_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `tag_id` CHAR(36) NOT NULL,
    `tag_name` VARCHAR(30) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,
    `user_id` CHAR(36) NOT NULL,

    INDEX `Tag_user_id_idx`(`user_id`),
    PRIMARY KEY (`tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `task_id` CHAR(36) NOT NULL,
    `priority` ENUM('MUST_DO', 'SHOULD_DO', 'COULD_DO') NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `memo` TEXT NULL,
    `status` ENUM('IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'IN_PROGRESS',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `completed_at` DATETIME(0) NULL,
    `task_date` DATE NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `tag_id` CHAR(36) NOT NULL,

    INDEX `Task_user_id_task_date_idx`(`user_id`, `task_date`),
    INDEX `Task_tag_id_idx`(`tag_id`),
    PRIMARY KEY (`task_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyEntry` (
    `daily_entry_id` CHAR(36) NOT NULL,
    `reflection_content` TEXT NOT NULL,
    `entry_date` DATE NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `user_id` CHAR(36) NOT NULL,

    INDEX `DailyEntry_user_id_idx`(`user_id`),
    UNIQUE INDEX `DailyEntry_user_id_entry_date_key`(`user_id`, `entry_date`),
    PRIMARY KEY (`daily_entry_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReflectionTask` (
    `task_id` CHAR(36) NOT NULL,
    `daily_entry_id` CHAR(36) NOT NULL,

    PRIMARY KEY (`task_id`, `daily_entry_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskResult` (
    `task_result_id` CHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `task_id` CHAR(36) NOT NULL,
    `daily_entry_id` CHAR(36) NOT NULL,

    INDEX `TaskResult_task_id_idx`(`task_id`),
    INDEX `TaskResult_daily_entry_id_idx`(`daily_entry_id`),
    PRIMARY KEY (`task_result_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attachment` (
    `attachment_id` CHAR(36) NOT NULL,
    `file_type` ENUM('file', 'img') NOT NULL,
    `file_url` VARCHAR(255) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,
    `task_result_id` CHAR(36) NOT NULL,

    INDEX `Attachment_task_result_id_idx`(`task_result_id`),
    PRIMARY KEY (`attachment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReflectionSnapshot` (
    `reflection_snapshot_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `daily_entry_id` CHAR(36) NOT NULL,

    INDEX `ReflectionSnapshot_daily_entry_id_idx`(`daily_entry_id`),
    PRIMARY KEY (`reflection_snapshot_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReflectionTaskSnapshot` (
    `reflection_task_snapshot_id` CHAR(36) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `priority` ENUM('MUST_DO', 'SHOULD_DO', 'COULD_DO') NOT NULL,
    `memo` TEXT NULL,
    `status` ENUM('IN_PROGRESS', 'COMPLETED') NOT NULL,
    `completed_at` DATETIME(0) NULL,
    `reflection_snapshot_id` CHAR(36) NOT NULL,
    `task_id` CHAR(36) NOT NULL,

    INDEX `ReflectionTaskSnapshot_reflection_snapshot_id_idx`(`reflection_snapshot_id`),
    INDEX `ReflectionTaskSnapshot_task_id_idx`(`task_id`),
    PRIMARY KEY (`reflection_task_snapshot_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReflectionTaskResultSnapshot` (
    `reflection_task_result_snapshot_id` CHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `reflection_task_snapshot_id` CHAR(36) NOT NULL,
    `task_result_id` CHAR(36) NOT NULL,

    INDEX `ReflectionTaskResultSnapshot_reflection_task_snapshot_id_idx`(`reflection_task_snapshot_id`),
    INDEX `ReflectionTaskResultSnapshot_task_result_id_idx`(`task_result_id`),
    PRIMARY KEY (`reflection_task_result_snapshot_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIQuestion` (
    `ai_question_id` CHAR(36) NOT NULL,
    `question_content` TEXT NOT NULL,
    `answer` TEXT NULL,
    `is_skipped` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `reflection_snapshot_id` CHAR(36) NOT NULL,

    INDEX `AIQuestion_reflection_snapshot_id_idx`(`reflection_snapshot_id`),
    PRIMARY KEY (`ai_question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIRun` (
    `ai_run_id` CHAR(36) NOT NULL,
    `prompt_type` VARCHAR(20) NOT NULL,
    `prompt_version` VARCHAR(50) NOT NULL,
    `status` ENUM('success', 'failed') NOT NULL,
    `input_tokens` INTEGER NOT NULL DEFAULT 0,
    `output_tokens` INTEGER NULL,
    `total_tokens` INTEGER NULL,
    `cost` DECIMAL(10, 4) NOT NULL DEFAULT 0,
    `error_message` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `dashboard_id` CHAR(36) NULL,
    `reflection_snapshot_id` CHAR(36) NULL,

    INDEX `AIRun_dashboard_id_idx`(`dashboard_id`),
    INDEX `AIRun_reflection_snapshot_id_idx`(`reflection_snapshot_id`),
    PRIMARY KEY (`ai_run_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RuleEngineLog` (
    `rule_engine_log_id` CHAR(36) NOT NULL,
    `rule_name` VARCHAR(100) NOT NULL,
    `before_text` TEXT NOT NULL,
    `after_text` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `ai_run_id` CHAR(36) NOT NULL,

    INDEX `RuleEngineLog_ai_run_id_idx`(`ai_run_id`),
    PRIMARY KEY (`rule_engine_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyPerformance` (
    `daily_performance_id` CHAR(36) NOT NULL,
    `achievement_rate` TINYINT NOT NULL,
    `summary` TEXT NOT NULL,
    `growth_insight` TEXT NOT NULL,
    `next_action` TEXT NULL,
    `structured_result` JSON NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `reflection_snapshot_id` CHAR(36) NOT NULL,

    INDEX `DailyPerformance_reflection_snapshot_id_idx`(`reflection_snapshot_id`),
    PRIMARY KEY (`daily_performance_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PerformanceItem` (
    `performance_item_id` CHAR(36) NOT NULL,
    `output` TEXT NOT NULL,
    `impact` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `task_id` CHAR(36) NOT NULL,
    `daily_performance_id` CHAR(36) NOT NULL,

    INDEX `PerformanceItem_task_id_idx`(`task_id`),
    INDEX `PerformanceItem_daily_performance_id_idx`(`daily_performance_id`),
    PRIMARY KEY (`performance_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dashboard` (
    `dashoard_id` CHAR(36) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `sumary` TEXT NOT NULL,
    `journal_days` INTEGER NOT NULL,
    `performance_count` INTEGER NOT NULL,
    `tag_count` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `user_id` CHAR(36) NOT NULL,

    INDEX `Dashboard_user_id_idx`(`user_id`),
    PRIMARY KEY (`dashoard_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DashboardPerformance` (
    `dashoard_id` CHAR(36) NOT NULL,
    `daily_performance_id` CHAR(36) NOT NULL,

    PRIMARY KEY (`dashoard_id`, `daily_performance_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DashboardKPI` (
    `dashboard_kpi_id` CHAR(36) NOT NULL,
    `kpi_name` VARCHAR(100) NULL,
    `progress` TEXT NULL,
    `dashoard_id` CHAR(36) NOT NULL,

    INDEX `DashboardKPI_dashoard_id_idx`(`dashoard_id`),
    PRIMARY KEY (`dashboard_kpi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DashboardInsight` (
    `dashboard_insight_id` CHAR(36) NOT NULL,
    `journal_days` INTEGER NOT NULL,
    `performance_count` INTEGER NOT NULL,
    `tag_count` INTEGER NOT NULL,
    `dashoard_id` CHAR(36) NOT NULL,

    INDEX `DashboardInsight_dashoard_id_idx`(`dashoard_id`),
    PRIMARY KEY (`dashboard_insight_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DashboardTagAnalysis` (
    `dashboard_tag_analysis_id` CHAR(36) NOT NULL,
    `goal` TEXT NULL,
    `expected_outcome` TEXT NULL,
    `task_count` INTEGER NULL,
    `period_start` DATE NULL,
    `period_end` DATE NULL,
    `achievement_status` TEXT NULL,
    `dashoard_id` CHAR(36) NOT NULL,

    INDEX `DashboardTagAnalysis_dashoard_id_idx`(`dashoard_id`),
    PRIMARY KEY (`dashboard_tag_analysis_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeeklyReflection` (
    `weekly_reflection_id` CHAR(36) NOT NULL,
    `work_summary` TEXT NULL,
    `resources_used` TEXT NULL,
    `learning` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `dashoard_id` CHAR(36) NOT NULL,

    INDEX `WeeklyReflection_dashoard_id_idx`(`dashoard_id`),
    PRIMARY KEY (`weekly_reflection_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAgreement` ADD CONSTRAINT `UserAgreement_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `Tag`(`tag_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyEntry` ADD CONSTRAINT `DailyEntry_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReflectionTask` ADD CONSTRAINT `ReflectionTask_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `Task`(`task_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReflectionTask` ADD CONSTRAINT `ReflectionTask_daily_entry_id_fkey` FOREIGN KEY (`daily_entry_id`) REFERENCES `DailyEntry`(`daily_entry_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskResult` ADD CONSTRAINT `TaskResult_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `Task`(`task_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskResult` ADD CONSTRAINT `TaskResult_daily_entry_id_fkey` FOREIGN KEY (`daily_entry_id`) REFERENCES `DailyEntry`(`daily_entry_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_task_result_id_fkey` FOREIGN KEY (`task_result_id`) REFERENCES `TaskResult`(`task_result_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReflectionSnapshot` ADD CONSTRAINT `ReflectionSnapshot_daily_entry_id_fkey` FOREIGN KEY (`daily_entry_id`) REFERENCES `DailyEntry`(`daily_entry_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReflectionTaskSnapshot` ADD CONSTRAINT `ReflectionTaskSnapshot_reflection_snapshot_id_fkey` FOREIGN KEY (`reflection_snapshot_id`) REFERENCES `ReflectionSnapshot`(`reflection_snapshot_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReflectionTaskSnapshot` ADD CONSTRAINT `ReflectionTaskSnapshot_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `Task`(`task_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReflectionTaskResultSnapshot` ADD CONSTRAINT `ReflectionTaskResultSnapshot_reflection_task_snapshot_id_fkey` FOREIGN KEY (`reflection_task_snapshot_id`) REFERENCES `ReflectionTaskSnapshot`(`reflection_task_snapshot_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReflectionTaskResultSnapshot` ADD CONSTRAINT `ReflectionTaskResultSnapshot_task_result_id_fkey` FOREIGN KEY (`task_result_id`) REFERENCES `TaskResult`(`task_result_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIQuestion` ADD CONSTRAINT `AIQuestion_reflection_snapshot_id_fkey` FOREIGN KEY (`reflection_snapshot_id`) REFERENCES `ReflectionSnapshot`(`reflection_snapshot_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIRun` ADD CONSTRAINT `AIRun_dashboard_id_fkey` FOREIGN KEY (`dashboard_id`) REFERENCES `Dashboard`(`dashoard_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIRun` ADD CONSTRAINT `AIRun_reflection_snapshot_id_fkey` FOREIGN KEY (`reflection_snapshot_id`) REFERENCES `ReflectionSnapshot`(`reflection_snapshot_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RuleEngineLog` ADD CONSTRAINT `RuleEngineLog_ai_run_id_fkey` FOREIGN KEY (`ai_run_id`) REFERENCES `AIRun`(`ai_run_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyPerformance` ADD CONSTRAINT `DailyPerformance_reflection_snapshot_id_fkey` FOREIGN KEY (`reflection_snapshot_id`) REFERENCES `ReflectionSnapshot`(`reflection_snapshot_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PerformanceItem` ADD CONSTRAINT `PerformanceItem_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `Task`(`task_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PerformanceItem` ADD CONSTRAINT `PerformanceItem_daily_performance_id_fkey` FOREIGN KEY (`daily_performance_id`) REFERENCES `DailyPerformance`(`daily_performance_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dashboard` ADD CONSTRAINT `Dashboard_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DashboardPerformance` ADD CONSTRAINT `DashboardPerformance_dashoard_id_fkey` FOREIGN KEY (`dashoard_id`) REFERENCES `Dashboard`(`dashoard_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DashboardPerformance` ADD CONSTRAINT `DashboardPerformance_daily_performance_id_fkey` FOREIGN KEY (`daily_performance_id`) REFERENCES `DailyPerformance`(`daily_performance_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DashboardKPI` ADD CONSTRAINT `DashboardKPI_dashoard_id_fkey` FOREIGN KEY (`dashoard_id`) REFERENCES `Dashboard`(`dashoard_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DashboardInsight` ADD CONSTRAINT `DashboardInsight_dashoard_id_fkey` FOREIGN KEY (`dashoard_id`) REFERENCES `Dashboard`(`dashoard_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DashboardTagAnalysis` ADD CONSTRAINT `DashboardTagAnalysis_dashoard_id_fkey` FOREIGN KEY (`dashoard_id`) REFERENCES `Dashboard`(`dashoard_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeeklyReflection` ADD CONSTRAINT `WeeklyReflection_dashoard_id_fkey` FOREIGN KEY (`dashoard_id`) REFERENCES `Dashboard`(`dashoard_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
