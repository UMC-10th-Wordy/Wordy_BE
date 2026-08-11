INSERT INTO Workspace (
    workspace_id,
    name,
    is_default,
    created_at,
    updated_at,
    user_id
)
SELECT
    UUID(),
    CONCAT(p.user_name, '의 워크스페이스'),
    true,
    NOW(),
    NOW(),
    u.user_id
FROM User u
JOIN Profile p ON p.user_id = u.user_id
WHERE NOT EXISTS (
    SELECT 1
    FROM Workspace w
    WHERE w.user_id = u.user_id
);

UPDATE Tag t
JOIN Workspace w
  ON w.user_id = t.user_id
 AND w.is_default = true
SET t.workspace_id = w.workspace_id
WHERE t.workspace_id IS NULL;

UPDATE Task t
JOIN Workspace w
  ON w.user_id = t.user_id
 AND w.is_default = true
SET t.workspace_id = w.workspace_id
WHERE t.workspace_id IS NULL;

UPDATE DailyEntry d
JOIN Workspace w
  ON w.user_id = d.user_id
 AND w.is_default = true
SET d.workspace_id = w.workspace_id
WHERE d.workspace_id IS NULL;

UPDATE DailyPerformance d
JOIN Workspace w
  ON w.user_id = d.user_id
 AND w.is_default = true
SET d.workspace_id = w.workspace_id
WHERE d.workspace_id IS NULL;

UPDATE Dashboard d
JOIN Workspace w
  ON w.user_id = d.user_id
 AND w.is_default = true
SET d.workspace_id = w.workspace_id
WHERE d.workspace_id IS NULL;

UPDATE ReflectionDraft r
JOIN Workspace w
  ON w.user_id = r.user_id
 AND w.is_default = true
SET r.workspace_id = w.workspace_id
WHERE r.workspace_id IS NULL;