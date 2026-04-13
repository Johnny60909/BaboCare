## Context

目前的驗證碼流程分散在多個頁面：LoginPage、PendingRegisterPage 和 ActivatePage。使用者在初次註冊時會被導向 ActivatePage 輸入邀請碼，但登入頁面可能存在驗證碼相關的 UI 混亂。

**當前流程**：
1. 使用者在 `/register` 填寫註冊資料
2. 提交後導向 `/activate` 輸入邀請碼
3. 驗證碼確認後回到 `/login` 登入

**目標**：統一和簡化驗證碼流程，提供一致的使用者體驗。

## Goals / Non-Goals

**Goals:**
- 移除登入頁面的驗證碼相關 UI 元素，確保登入頁專注於帳號密碼登入
- 建立一個清晰的、獨立的驗證碼輸入流程（/activate 頁面）
- 從多個入口點（初次登入、重新驗證）導向同一個驗證碼頁面
- 確保驗證碼頁面有明確的操作按鈕和完整的使用者反饋機制

**Non-Goals:**
- 修改驗證碼的後端邏輯或認證機制
- 改變 Identity 模組的實現
- 新增額外的驗證流程（如雙因子認證）

## Decisions

1. **驗證碼頁面獨立性** → 使用專門的 `/activate` 路由，與登入流程分離
   - 替代方案考慮：在登入頁面嵌入驗證碼表單（已拒絕，會造成介面混亂）
   
2. **登入頁面移除驗證碼** → 登入頁面只保留帳號密碼表單
   - 若使用者尚未驗證，可通過連結導向 `/activate` 頁面
   - 替代方案考慮：保留驗證碼 UI 但隱藏（已拒絕，增加代碼複雜度）

3. **流程整合** → PendingRegisterPage 提交後直接導向 ActivatePage
   - 確保使用者流程連貫，避免回到登入頁再跳轉

4. **UI/UX 一致性** → ActivatePage 應有清晰的確認按鈕和完整的狀態反饋
   - 包括加載狀態、成功/失敗提示

## Risks / Trade-offs

- [使用者流程改變] → 舊流程的超連結可能失效，需要提供臨時重定向
- [路由管理] → 新增更多頁面可能增加路由複雜度，需要確保防護路由邏輯正確

## Migration Plan

1. 檢查 LoginPage，移除任何驗證碼相關 UI
2. 優化 ActivatePage，確保有完整的操作流程
3. 更新 PendingRegisterPage 的導向邏輯
4. 測試完整的使用者流程：註冊 → 驗證 → 登入

## Sequence Diagram

```
User ->> Frontend: 訪問 /register
Frontend ->> Frontend: 填寫註冊表單
User ->> Backend: POST /register
Backend ->> Frontend: 回傳 pendingUserId
Frontend ->> Frontend: 導向 /activate
User ->> Frontend: 輸入邀請碼
Frontend ->> Backend: POST /activate
Backend ->> Frontend: 驗證成功，回傳 userName
Frontend ->> Frontend: 導向 /login?activated=1&username=xxx
User ->> Frontend: 填寫登入表單
Frontend ->> Backend: POST /connect/token
Backend ->> Frontend: 回傳 Token
Frontend ->> Frontend: 儲存 Token，導向 /
```

## Open Questions

- 登入頁面目前是否已移除驗證碼 UI？需要確認當前的實現狀態
- 是否需要支援已啟用帳號重新驗證的流程？
