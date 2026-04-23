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

### 需求：「+」按鈕建立寶寶活動 ("+" button to create baby activity)

系統應 (SHALL) 在底部導覽列中為授權照護者顯示一個「+」按鈕。點擊該按鈕將導覽至活動建立頁面。

#### 場景：照護者在導覽列看到「+」按鈕 (Caregiver sees "+" button in navigation)

- **當 (WHEN)** 授權照護者查看首頁時
- **則 (THEN)** 「+」按鈕出現在底部導覽列中

#### 場景：「+」按鈕開啟活動建立頁面 ("+" button opens activity creation page)

- **當 (WHEN)** 照護者點擊底部導覽列中的「+」按鈕時
- **則 (THEN)** 系統導覽至活動建立頁面，用戶可在此選擇寶寶和活動類型

#### 場景：「+」按鈕在導覽列中的位置 ("+" button position in navigation bar)

- **當 (WHEN)** 顯示底部導覽列時
- **則 (THEN)** 「+」按鈕顯眼地出現在導覽列中（居中或最右側）
- **則 (THEN)** 「+」按鈕不遮蔽現有的導覽項目（首頁、管理圖示）

#### 場景：僅照護者可見「+」按鈕 (Only caregivers see "+" button)

- **當 (WHEN)** 沒有照護者權限的用戶查看首頁時
- **則 (THEN)** 底部導覽列不顯示「+」按鈕
