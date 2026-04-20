## 1. 後端 - 領域模型與實體設置

- [x] 1.1 在 Domain/Abstractions/ 中建立 IAuditable 介面，包含 CreatedAt、CreatedBy、UpdatedAt、UpdatedBy 屬性
- [x] 1.2 在 Domain/Entities/ 中建立 Baby 聚合根實體，繼承 AggregateRoot 並實現 IAuditable 介面
- [x] 1.3 在 Baby 實體中添加 AvatarUrl 屬性用於存儲上傳的頭像路徑
- [x] 1.4 在 Domain/Entities/ 中建立 BabyParent 關聯實體
- [x] 1.5 建立 Baby 相關的值對象（如 Gender 枚舉、BabyName 等）
- [x] 1.6 建立 Baby 查詢規範（如 BabiesByNannySpecification、BabiesByParentSpecification）

## 2. 後端 - 基礎設施與資料庫

- [x] 2.1 在 Infrastructure/Persistence/Configurations/ 中建立 Baby 實體配置類
- [x] 2.2 在 Infrastructure/Persistence/Configurations/ 中建立 BabyParent 實體配置類
- [x] 2.3 更新 AppDbContext，添加 DbSet<Baby> 和 DbSet<BabyParent>
- [x] 2.4 修改 AppDbContext.SaveChangesAsync()，自動填充 IAuditable 欄位（從 ClaimsPrincipal 讀取）
- [x] 2.5 建立 Baby 和 BabyParent 表的資料庫遷移
- [x] 2.6 驗證遷移包含審計欄位（CreatedAt、CreatedBy、UpdatedAt、UpdatedBy）

## 3. 後端 - 應用服務與 DTOs

- [x] 3.1 在 Application/Dtos/ 中建立 BabyResponseDto，包含所有寶寶資訊、審計欄位和 AvatarUrl
- [x] 3.2 在 Application/Dtos/ 中建立 CreateBabyRequestDto，用於 POST 請求
- [x] 3.3 在 Application/Dtos/ 中建立 UpdateBabyRequestDto，用於 PUT 請求
- [x] 3.4 在 Application/Services/ 中建立 IBabyService 介面，定義 CRUD 和查詢方法
- [x] 3.5 在 Application/Services/ 中實現 BabyService 類，包含所有 IBabyService 方法
- [x] 3.6 實現 BabyService 方法：GetAllBabies、GetBabyById、CreateBaby、UpdateBaby、DeleteBaby
- [x] 3.7 建立 BabyAuthorizationService 檢查用戶對寶寶的訪問權限
- [x] 3.8 在 BabyService 中實現基於角色的過濾邏輯（SystemAdmin 看全部、Nanny 看自己負責、Parent 看自己的）
- [x] 3.9 在 BabyService 中添加 UploadAvatarAsync 方法用於處理頭像上傳

## 4. 後端 - API 端點

- [x] 4.1 在 Api/Controllers/ 中建立 BabyController，依賴注入 BabyService 和 BabyAuthorizationService
- [x] 4.2 實現 GET /api/babies 端點，包含基於角色的過濾
- [x] 4.3 實現 GET /api/babies/{id} 端點，包含授權檢查
- [x] 4.4 實現 POST /api/babies 端點，用於建立新寶寶
- [x] 4.5 實現 PUT /api/babies/{id} 端點，用於編輯寶寶資訊
- [x] 4.6 實現 DELETE /api/babies/{id} 端點，用於刪除寶寶（僅 SystemAdmin）
- [x] 4.7 為所有需要認證的端點添加 [Authorize] 屬性
- [x] 4.8 添加回應驗證和錯誤處理（400、403、404、500）
- [x] 4.9 實現 POST /api/babies/{id}/avatar 端點用於上傳寶寶頭像
- [x] 4.10 在頭像上傳中添加檔案驗證（格式：JPG/PNG/GIF，大小限制：5MB）
- [x] 4.11 為頭像上傳添加授權檢查（僅 SystemAdmin 和寶寶的保母可上傳）

## 5. 後端 - 附加 API 端點

- [x] 5.1 建立 GET /api/users/nannies 端點用於前端下拉選單中提取保母列表
- [x] 5.2 建立 GET /api/users/parents 端點用於多選中提取家長列表
- [x] 5.3 建立 GET /api/babies/stats/count 端點用於獲取按用戶角色過濾的寶寶數量

## 6. 後端 - 檔案存儲與頭像管理

- [x] 6.1 在 appsettings.json 中添加 FileStorage 配置段（包含上傳路徑、允許的副檔名、大小限制、靜態檔案訪問 URL 前綴）
- [x] 6.2 建立 IFileStorageService 介面用於檔案上傳/下載操作
- [x] 6.3 實現 FileStorageService 以處理頭像上傳到專案靜態檔案資料夾（appsettings 配置路徑）
- [x] 6.4 建立檔案驗證的輔助方法（副檔名、MIME 類型、大小等）
- [x] 6.5 實現當上傳新頭像時清理舊頭像檔案的邏輯
- [x] 6.6 配置靜態檔案中介軟體以提供對上傳檔案的訪問（Startup 配置）
- [x] 6.7 實現檔案路徑轉為可訪問 URL 的方法（如 /static/uploads/babies/{babyId}/avatar.jpg）

## 7. 前端 - API 服務與 DTOs

- [x] 7.1 在 src/api/dtos/ 中建立 Baby DTOs（IBaby、ICreateBabyRequest、IUpdateBabyRequest、IBabyResponseDto）
- [x] 7.2 在 src/api/services/ 中建立 babyService，包含 API 調用方法（getBabies、getBabyById、createBaby、updateBaby、deleteBaby、uploadAvatar）
- [x] 7.3 建立 userService 用於提取保母和家長列表
- [x] 7.4 實現錯誤處理和 API 回應類型檢查
- [x] 7.5 添加頭像上傳服務方法，包含檔案驗證和進度追蹤

## 8. 前端 - 自訂 Hooks

- [x] 8.1 在 src/hooks/queries/ 中建立 useGetBabies hook，使用 TanStack Query
- [x] 8.2 建立 useGetBabyById hook 用於提取單個寶寶詳細資訊
- [x] 8.3 建立 useCreateBaby mutation hook
- [x] 8.4 建立 useUpdateBaby mutation hook
- [x] 8.5 建立 useDeleteBaby mutation hook
- [x] 8.6 建立 useGetNannies hook 用於提取保母列表
- [x] 8.7 建立 useGetParents hook 用於提取家長列表
- [x] 8.8 建立 useUploadBabyAvatar mutation hook 用於上傳頭像，包含進度追蹤

## 9. 前端 - 寶寶管理頁面（後台）

- [x] 9.1 在 src/pages/admin/ 中建立 AdminBabiesPage 組件
- [x] 9.2 使用 Mantine UI 實現寶寶列表展示（表格或卡片布局）
- [x] 9.3 實現搜尋和過濾功能（按名稱、保母等）
- [x] 9.4 根據需要實現分頁或虛擬滾動
- [x] 9.5 添加「新增寶寶」按鈕連結至建立表單
- [x] 9.6 為每個寶寶添加編輯和刪除操作
- [x] 9.7 添加刪除時的確認 modal
- [x] 9.8 實現基於角色的可見性（僅 SystemAdmin 和 Nanny 可見）

## 10. 前端 - 寶寶編輯表單

- [x] 10.1 在 src/components/ 中建立 BabyForm 組件，支援建立和編輯兩種模式
- [x] 10.2 實現表單欄位：名稱（TextInput）、出生日期（DateInput）、性別（Select）、保母（Select）、家長（MultiSelect）
- [x] 10.3 實現保母智能預帶邏輯（如果系統中只有 1 位保母或 1 位管理員）
- [x] 10.4 添加頭像上傳欄位，包含檔案預覽和驗證
- [x] 10.5 使用表單庫進行表單驗證
- [x] 10.6 實現提交處理程式，根據模式調用建立或更新 API
- [x] 10.7 添加取消按鈕和返回寶寶列表的導航
- [x] 10.8 提交時顯示加載狀態
- [x] 10.9 顯示成功/錯誤的 toast 通知
- [x] 10.10 顯示已上傳頭像預覽，支援替換/移除選項

## 11. 前端 - 寶寶詳細資訊頁面

- [x] 11.1 在 src/pages/ 中建立 BabyDetailPage 組件
- [x] 11.2 顯示寶寶資訊，包含已上傳的頭像或預設頭像
- [x] 11.3 顯示保母資訊和家長列表
- [x] 11.4 如果用戶有權限則添加編輯按鈕
- [x] 11.5 如果用戶是 SystemAdmin 則添加刪除按鈕
- [x] 11.6 為編輯/刪除按鈕實現基於角色的授權

## 12. 前端 - 首頁寶寶故事列

- [x] 12.1 在 src/components/ 中建立 BabyStoryList 組件
- [x] 12.2 實現根據用戶角色動態顯示寶寶頭像
- [x] 12.3 實現基於性別的預設頭像顏色（男性藍色、女性粉色、其他灰色）
- [x] 12.4 如果可用則顯示已上傳的頭像，否則使用預設頭像
- [x] 12.5 添加點擊頭像導航至寶寶詳細頁面的處理
- [x] 12.6 將 BabyStoryList 整合到 HomePage 組件中
- [x] 12.7 實現響應式設計（行動裝置上使用水平滾動）

## 13. 前端 - 後台側邊欄導航

- [x] 13.1 更新 AdminLayout 組件，添加「寶寶管理」導航項目
- [x] 13.2 使導航項目僅對 SystemAdmin 和 Nanny 角色可見
- [x] 13.3 將導航項目連結至 /admin/babies 路由

## 14. 後端 - 測試

- [x] 14.1 為 Baby 聚合根建立單元測試
- [x] 14.2 為 BabyAuthorizationService 授權邏輯建立單元測試
- [x] 14.3 為 BabyService 方法建立單元測試
- [x] 14.4 為 BabyController 端點建立整合測試
- [x] 14.5 為基於角色的訪問控制場景建立整合測試
- [x] 14.6 測試 SaveChangesAsync 中審計欄位的自動填充
- [x] 14.7 測試檔案上傳驗證（格式、大小限制）
- [x] 14.8 測試頭像檔案清理邏輯

## 15. 前端 - 測試與驗證

- [x] 15.1 使用範例數據測試寶寶列表頁面渲染
- [x] 15.2 測試建立寶寶表格提交和驗證
- [x] 15.3 使用預填數據測試編輯寶寶表格
- [x] 15.4 測試後台頁面的基於角色的可見性（Nanny vs Parent）
- [x] 15.5 測試首頁故事列為每個角色的顯示
- [x] 15.6 測試頁面之間的導航
- [x] 15.7 測試頭像上傳功能（不同檔案格式和大小）
- [x] 15.8 測試預設頭像的顯示邏輯

## 16. 組態管理

- [x] 16.1 在 appsettings.json 中添加 FileStorage 配置段（包含上傳路徑、允許的副檔姓、大小限制、靜态檔案訪問 URL 前綶）
- [x] 16.2 在 appsettings.Development.json 中添加開發環境特定配置
- [x] 16.3 在 Program.cs 中註冊 FileStorageService 和相關配置
- [x] 16.4 配置靜态檔案中䮳軟體以支援上傳檔案的訪問
- [x] 16.5 驗證檔案路徑配置的安全性（確保路徑在專案內部）

## 17. 資料庫與部署

- [x] 17.1 審查並測試遷移指令碩
- [x] 17.2 備份生產資料库
- [x] 17.3 在開發環境上執行遷移
- [x] 17.4 在預發佈環境上執行遷移
- [x] 17.5 驗證審計欄位在資料库中的正確填充
- [x] 17.6 在生產環境上執行遷移
- [x] 17.7 驗證遷移後資料完整性

## 18. 文件與最終任務

- [x] 18.1 在 API 文件中記錄新的 API 端點
- [x] 18.2 更新資料库架構文件
- [x] 18.3 為後台寶寶管理功能建立或更新用戶指南
- [x] 18.4 記錄 IAuditable 模式用於未來開發
- [x] 18.5 記錄檔案存儲配置方法（appsettings 用法）
- [x] 18.6 驗證所有 spec 中的需求都已實現
- [x] 18.7 審查代碼以確保與後端架構和前端架構 spec 的一致性
- [x] 18.8 進行跨所有模組的最終整合測試
- [x] 18.9 準備回滾計畫文檔
