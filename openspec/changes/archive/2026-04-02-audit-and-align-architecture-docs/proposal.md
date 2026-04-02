## 為什麼

BaboCare 專案的技術規格已更新為最終版本 (tech-backend.md、tech-identity.md、tech-frontend.md)，但 audit-and-align-architecture-docs 變更中的 artifacts 需要同步以反映這些最新規格。此次同步確保所有設計、規格和任務與最新技術標準保持一致。

## What Changes

### Specs to add
- `backend-architecture`: Clean Architecture 五層、DTO 組織、Entity 配置、DDD 模式、Controller 簡化、Specification 模式
- `frontend-architecture`: React 技術堆梧、MVVM 策畤、狀態管理分離
- `identity-module`: OpenIddict、PostgreSQL、Password Grant、Bearer Token、IUserContext

### Specs to update
- `user-auth`: 添加認證流程要求（登入、認證、路由守衛、Token 刷新、Dashboard）

## 變更內容

### 同步後端架構文檔
- tech-backend.md 已確認使用簡化的返回型別 (TResponseDto)，DTO 組織和 Entity 配置規範已固化
- 規格文檔採用英文撰寫，提供精確的技術定義

### 同步身份識別文檔
- 新增 tech-identity.md 作為獨立規格，定義 OpenIddict、PostgreSQL 存儲、密碼供給流程
- 文檔中包含 IUserContext 非同步模式和 Axios Bearer Token 攔截器要求

### 同步前端架構文檔
- tech-frontend.md 已確認使用 Mantine UI v8 (修復 v7 參考)
- lucide-react 已確認，需驗證 @tabler/icons-react 使用情況
- 規格文檔採用英文撰寫，確保技術標準的一致性

## 能力

### 新增能力
無 - 這是文檔同步工作

### 修改的能力
- `backend-architecture`：已最終化，需同步至 audit artifacts
- `frontend-architecture`：已最終化，需同步至 audit artifacts
- `user-auth`：tech-identity.md 新增，需納入規格
- `identity-module`：新規格定義 OpenIddict、PostgreSQL、密碼授予流程

## 影響

- **受影響的檔案**：
  - `openspec/tech-backend.md`
  - `openspec/tech-identity.md` (新規格)
  - `openspec/tech-frontend.md`

- **受影響的 OpenSpec 文件**：
  - audit-and-align-architecture-docs proposal.md、design.md、tasks.md
  - specs/backend-architecture/spec.md
  - specs/identity-module/spec.md (新增)
  - specs/frontend-architecture/spec.md
  - specs/user-auth/spec.md

- **受影響的團隊**：
  - 後端開發團隊
  - 前端開發團隊
  - Identity/認證團隊
  - 入職/文檔維護

- **風險等級**：低 - 文檔同步工作，無程式碼變更

- **回滾計劃**：
  - 所有變更在 git 中追蹤，可使用 `openspec status` 追蹤進度
  - 可還原至先前的審計狀態
  - 無需資料庫遷移或部署

## 後續步驟

1. **設計階段**：確定 audit artifacts 與最新技術規格的同步方法
2. **規格階段**：為每個架構領域 (backend、identity、frontend) 建立確認規格
3. **任務階段**：生成文檔同步和驗證的實施任務
