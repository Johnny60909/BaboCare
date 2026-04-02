# bottom-navigation Specification

## Purpose
TBD - synced from change 2026-04-02-admin-account-management. Update Purpose after review.

## ADDED Requirements

### Requirement: 登入後顯示底部導覽列

系統 SHALL 在用戶登入後，於所有主頁面底部顯示固定導覽列，包含以下 Icon：首頁（寶寶動態牆）、其他預留項目。導覽列使用 Mantine UI 元件配合 Tailwind CSS 實作，並以 `lucide-react` 提供 Icon。

#### Scenario: 已登入用戶看到底部導覽列

- **GIVEN** 用戶已登入並持有有效 Token
- **WHEN** 用戶瀏覽任何主頁面（`/`、`/admin/**`）
- **THEN** 頁面底部顯示導覽列，不遮蔽主內容

#### Scenario: 未登入用戶不顯示底部導覽列

- **GIVEN** 用戶未登入
- **WHEN** 用戶在登入頁（`/login`）
- **THEN** 頁面底部不顯示導覽列

### Requirement: 角色為管理員或保母時顯示後台管理入口

系統 SHALL 解析 JWT 中的 `role` Claim，若角色包含 `SystemAdmin` 或 `Nanny`，則在底部導覽列顯示「後台管理」Icon；其他角色（如 `Parent`）不顯示此 Icon。

#### Scenario: 系統管理員看到後台入口

- **GIVEN** 用戶已登入，JWT `role` Claim 包含 `SystemAdmin`
- **WHEN** 用戶查看底部導覽列
- **THEN** 底部導覽列顯示「後台管理」Icon，點擊後導向 `/admin`

#### Scenario: 保母看到後台入口

- **GIVEN** 用戶已登入，JWT `role` Claim 包含 `Nanny`
- **WHEN** 用戶查看底部導覽列
- **THEN** 底部導覽列顯示「後台管理」Icon，點擊後導向 `/admin`

#### Scenario: 家長不看到後台入口

- **GIVEN** 用戶已登入，JWT `role` Claim 為 `Parent`（不含管理員或保母）
- **WHEN** 用戶查看底部導覽列
- **THEN** 底部導覽列不顯示「後台管理」Icon
