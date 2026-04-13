## 1. 前端頁面檢查與優化

- [x] 1.1 檢視 LoginPage，確認不包含任何驗證碼相關 UI
- [x] 1.2 若存在驗證碼 UI，移除相關元素（輸入框、提交按鈕、相關邏輯）
- [x] 1.3 在 LoginPage 中添加指引，說明未驗證用戶應前往 `/activate`
- [x] 1.4 確認 LoginPage 正確處理 `activated=1` 和 `username` URL 參數

## 2. 驗證碼頁面 (ActivatePage) 優化

- [x] 2.1 檢查 ActivatePage 是否有確認按鈕（「啟用帳號」），若無則添加
- [x] 2.2 確認 ActivatePage 有完整的加載狀態管理（按鈕禁用、加載文字）
- [x] 2.3 確認 ActivatePage 在邀請碼輸入框為空時禁用提交按鈕
- [x] 2.4 驗證 ActivatePage 的錯誤訊息顯示邏輯正確

## 3. 流程整合與路由

- [x] 3.1 檢查 PendingRegisterPage，確認提交後直接導向 `/activate`
- [x] 3.2 確認 ActivatePage 驗證成功後導向 `/login?activated=1&username=xxx`
- [x] 3.3 檢查路由配置，確保 `/activate` 路由正確受保護（已登入用戶不應訪問）
- [x] 3.4 驗證未驗證帳號嘗試登入時的錯誤提示邏輯

## 4. 測試與驗收

- [x] 4.1 測試新用戶完整流程：註冊 → 驗證 → 登入
- [x] 4.2 測試無效邀請碼的錯誤提示
- [x] 4.3 測試已啟用帳號直接登入流程
- [x] 4.4 測試 LoginPage 不存在驗證碼 UI，確認頁面清潔度
- [x] 4.5 測試各頁面的響應式設計（行動裝置、桌面）
- [x] 4.6 驗證所有提示文字和錯誤訊息的準確性與使用者友善性
