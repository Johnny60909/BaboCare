## 背景

技術規格已更新為最終版本，包含三個標準化文檔：

**最終狀態：**
- **tech-backend.md**：定義 Clean Architecture 五層、DTO 組織、Entity 配置、DDD 模式，所有型別返回使用簡化的 TResponseDto
- **tech-identity.md**：定義 OpenIddict/PostgreSQL、密碼授予流程、Axios 攔截器、IUserContext 非同步模式
- **tech-frontend.md**：定義 React Router v7、Mantine UI v8、Tailwind CSS、TanStack Query、Zustand

**目標受眾：**
- 後端團隊：實現業務功能和 API
- 前端團隊：構建頁面和元件
- Identity 團隊：實現認證服務
- 新團隊成員：規格作為入職指南
- OpenSpec 審計：audit-and-align artifacts 需同步最新規格

## 目標/非目標

**目標：**
- 確認實現符合最終化的技術規格
- 文檔化任何已知的合理差異
- 確保新開發者能使用這些規格實現功能
- 驗證規格涵蓋所有關鍵架構領域

**非目標：**
- 更改技術規格本身 (規格已最終化)
- 建立新功能或能力
- 變更專案結構或依賴
- 此變更中的程式碼級實現

## 決策

### 決策 1：規格最終化清算
**選擇：** 將所有 tech-* 規格視為最終版本，不再進行程式碼與規格的對齁驅動改變。audit-and-align-architecture-docs 任務改為：驗證實現符合規格，或文檔化已知的合理差異。

**原因：** 經過多次迭代，三個規格現已穩定。進一步的改變應透過正式的規格版本控制而非 audit 變更。

**替代方案：**
- 持續兩向同步 (拒絕：造成無限迴圈和不確定的真相來源)
- 固化規格為 v1.0 (接受：建議未來使用)

### 決策 2：語言分層－規格用英文，工件用繁體中文
**選擇：** 技術規格 (tech-backend.md、tech-identity.md、tech-frontend.md) 採用英文撰寫，確保精確性。audit-and-align artifacts (proposal.md、design.md、tasks.md 和 specs/) 採用繁體中文撰寫。

**原因：** 技術規格作為 Authority documents 應用英文保證全球技術一致性；audit artifacts 用繁體中文改善團隊溝通和入職體驗。

### 決策 3：Audit Scope 調整
**選擇：** audit-and-align 現階段應確認：實現符合規格、所有差異已文檔化和合理、新開發者能使用這些規格。

**原因：** 規格現已穩定，進一步的更新應遵循正式的架構決策流程而非審計變更。

## 實現方法

### 第 1 階段：驗證後端規格實現
1. **確認 Clean Architecture 五層**
   - 驗證 Domain、Application、Infrastructure、Api、Identity 依賴結構
   - 確認所有文檔用繁體中文撰寫

2. **驗證 DTO 組織**
   - 確認核心業務 DTO 在 BaboCare.Application/Dtos/
   - 確認身份識別 DTO 在 BaboCare.Identity/Dtos/

3. **驗證 Entity 配置**
   - 驗證 HasComment() 的使用一致性
   - 記錄 DDD 模式應用範圍

###第 2 階段：驗證身份識別規格實現
1. **確認 OpenIddict 配置**
   - 驗證 PostgreSQL 存儲
   - 確認密碼授予流程

2. **驗證 IUserContext 模式**
   - 確認非同步實現

### 第 3 階段：驗證前端規格實現
1. **確認技術堆棧版本**
   - React Router v7、Mantine UI v8、Tailwind CSS、TanStack Query v5、Zustand v5

2. **驗證 MVVM 模式**
   - 確認 View/Logic/DTO 分離

3. **驗證狀態管理**
   - 確認 TanStack Query 用於伺服器狀態
   - 確認 Zustand 用於 UI-only 狀態

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
## 風險/權衡

| 風險 | 緩解措施 |
|------|--------|
| 規格與實現再次偏離 | 在 PR 審查中強制檢查規格合規性；排程季度審計 |
| 開發者忽視更新的規格 | 強調規格為事實來源；將規格連結添加到 PR 範本 |
| 新增 identity-module 規格遺漏覆蓋 | 由 Identity 團隊主導審查並確認 |
| 規格語言切換造成困惑 | 確認所有文檔使用繁體中文 |

## 回滾計劃

所有變更在 git 中追蹤：
1. 可使用 `openspec status` 追蹤進度
2. 可還原至先前的審計狀態
3. 無程式碼變更需要回滾
4. 零操作影響

## 開放問題

1. **是否所有規格覆蓋完整？**
   - Backend、Identity、Frontend 是否充分？
   - 是否遺漏其他架構領域？

2. **新的 identity-module 規格是否應納入主審計？**
   - 還是作為獨立變更？

3. **規格同步後的驗收標準是什麼？**
   - 實現完全符合規格？
   - 新開發者能使用規格無困惑？
   - 所有差異已文檔化和合理化？

4. **未來誰是規格決策的 SSOT (唯一事實來源)？**
   - 架構決策文檔？
   - Pull Request 審查流程？
   - 定期規格審計？
