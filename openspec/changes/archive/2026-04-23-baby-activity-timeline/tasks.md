## 1. 後端 - 領域與資料模型

- [x] 1.1 在 Domain 中建立 Activity 實體，包含 Activity 類型枚舉（餵奶、進食、尿布、睡眠、心情）
- [x] 1.2 建立 ActivityOptions 值物件以處理類型特定選項（JSON 結構）
- [x] 1.3 定義 Activity 聚合根及照片需求和選項驗證的不變式
- [x] 1.4 建立 ActivitySpecification 以查詢特定寶寶和建立日期的活動

## 2. 後端 - 資料庫與持久化

- [x] 2.1 為 Activity 表建立資料庫遷移，包含欄位：Id、BabyId、CreatedAt、Type、PhotoUrl、Notes、OptionsJson
- [x] 2.2 配置 EF Core 對 Activity 實體和 ActivityOptions 值物件的映射
- [-] 2.3 建立實現 IRepository<Activity> 模式的 ActivityRepository（跳過：架構不使用 Repository pattern，直接注入 IAppDbContext）
- [x] 2.4 在 BabyId 和 CreatedAt 上新增資料庫索引以最佳化動態牆查詢

## 3. 後端 - DTO 與 API 模型

- [x] 3.1 建立 CreateActivityRequest DTO 及驗證（BabyId、Type、Options、PhotoUrl、Notes）
- [x] 3.2 建立 ActivityResponse DTO 用於 API 序列化
- [x] 3.3 建立 ActivityFeedResponse DTO 及分頁元資料
- [x] 3.4 實現類型特定選項驗證器（EatingOptions、MoodOptions 等）

## 4. 後端 - 應用服務

- [x] 4.1 建立 CreateActivityService 命令處理器，包含授權檢查
- [x] 4.2 建立 GetActivityFeedService 查詢處理器（分頁、按 CreatedAt DESC 排序）
- [x] 4.3 建立 GetBabyActivitiesService 查詢處理器用於轉盤（20 個最新活動）
- [x] 4.4 在服務中實現活動類型驗證邏輯

## 5. 後端 - API 控制器與端點

- [x] 5.1 建立 ActivityController 並搭配 POST /api/activities 端點用於創建
- [x] 5.2 實現 GET /api/activities 端點用於動態牆（20 項分頁）
- [x] 5.3 實現 GET /api/babies/{babyId}/activities 端點用於轉盤
- [x] 5.4 使用 baby-access-control 權限新增授權篩選
- [x] 5.5 套用 ResponseBase 包裝和 backend-api-protocol 中的錯誤篩選

## 6. 後端 - 測試

- [x] 6.1 撰寫 xUnit 測試以驗證 Activity 實體建立和驗證
- [x] 6.2 撰寫 xUnit 測試以驗證活動服務授權邏輯
- [x] 6.3 撰寫 xUnit 測試以驗證動態牆排序（按 CreatedAt DESC）
- [x] 6.4 使用 AwesomeAssertions 進行狀態轉換驗證（ActivityStateTransitionTests.cs，12 tests，31/31 Domain.Tests pass）

## 7. 前端 - API 服務層

- [x] 7.1 在 api/services/ 中建立 ActivityService，包含 createActivity 方法
- [x] 7.2 實現 getActivityFeed 方法（含分頁支援）
- [x] 7.3 實現 getBabyActivities 方法用於轉盤
- [x] 7.4 新增適當的 JsonResponse 處理和錯誤映射
- [x] 7.5 遵循 frontend-api-service 約定進行服務實現

## 8. 前端 - 自訂 Hooks

- [-] 8.1 建立 useActivityCreation hook 用於活動表單狀態管理（跳過：狀態管理直接在頁面組件內處理）
- [x] 8.2 建立 useActivityFeed hook 用於取得和顯示動態牆
- [x] 8.3 建立 useBabyActivityCarousel hook 用於轉盤狀態（導航、活動清單）
- [-] 8.4 在創建 hook 中實現樂觀更新邏輯（跳過：以 invalidateQueries 取代，足夠滿足需求）

## 9. 前端 - 組件

- [x] 9.1 建立 ActivityCard 組件用於動態牆顯示（照片、類型圖示、時間戳、備註）
- [x] 9.2 建立 ActivityCarousel 組件用於寶寶活動歷史
- [-] 9.3 建立 ActivityTypeIcon 組件（跳過：圖示直接 inline 在 ActivityCard/CarouselModal）
- [-] 9.4 建立 CarouselNavigation 組件（跳過：導航直接 inline 在 CarouselModal）

## 10. 前端 - 動態資訊建立頁面

- [x] 10.1 建立 ActivityCreationPage 組件結構
- [x] 10.2 實現寶寶選擇器（來自授權寶寶的下拉清單）
- [x] 10.3 實現活動類型選擇器（5 個標籤或單選按鈕組）
- [x] 10.4 建立類型特定選項選擇器（進食：食物類型單選、心情：心情單選）
- [-] 10.5 實現照片上傳（跳過 ImageCropModal 裁切步驟：選照片後直接上傳 API，不經裁切）
- [x] 10.6 實現備註文字區域
- [x] 10.7 建立發布按鈕，包含驗證和載入狀態
- [x] 10.8 成功提交後實現表單重置
- [x] 10.9 新增成功提示和錯誤處理

## 11. 前端 - 首頁更新

- [x] 11.1 建立 BabyAvatarCarousel 組件，按最新活動排序顯示頭像
- [x] 11.2 實現頭像重新排序邏輯（最新活動優先）
- [x] 11.3 建立 ActivityFeed 組件以時間順序顯示動態牆
- [x] 11.4 實現含無限滾動的動態牆分頁（以 IntersectionObserver 取代「載入更多」按鈕）
- [x] 11.5 實現空白動態牆狀態訊息
- [x] 11.6 將 BabyAvatarCarousel 和 ActivityFeed 整合到首頁布局

## 12. 前端 - 底部導覽列更新

- [x] 12.1 將「+」按鈕新增到 BottomNavigation 組件
- [x] 12.2 為「+」按鈕設定樣式（居中或醒目放置）
- [x] 12.3 點擊「+」時實現導航到 ActivityCreationPage
- [x] 12.4 根據使用者角色顯示/隱藏「+」按鈕（僅限具建立權限的保母）

## 13. 前端 - 頭像轉盤模態框/互動

- [x] 13.1 建立 AvatarCarouselModal 組件（全螢幕或側邊欄）
- [x] 13.2 實現轉盤活動顯示和導航
- [x] 13.3 新增左/右滑動和箭頭支援用於活動導航
- [x] 13.4 實現活動計數器（例如「3 / 15」）
- [x] 13.5 新增從轉盤返回動態牆的功能（左上角 X 關閉鈕 + 點擊背景關閉；底部導覽列以 `z-[200]` 蓋住）
- [x] 13.6 處理轉盤中的空白活動狀態

## 14. 前端 - 樣式與響應式設計

- [x] 14.1 為所有組件套用 Tailwind CSS 樣式（mantine v8 + tailwind v4）
- [x] 14.2 確保動態資訊建立頁面的行動優先響應式設計
- [x] 14.3 為行動和桌面視窗的動態牆設定樣式（照片採 `max-w-full h-auto max-h-[600px]` 動態高度，保持原始比例）
- [x] 14.4 在行動設備上實現觸控滑動手勢（onTouchStart/onTouchEnd，閾值 50px）
- [x] 14.5 確保與 lucide-react 的圖示使用一致

## 15. 前端 - 測試與驗證

- [x] 15.1 使用 Chrome DevTools MCP 驗證動態牆渲染
- [x] 15.2 驗證創建/取得活動端點的 XHR 呼叫
- [x] 15.3 測試轉盤導航和狀態更新
- [x] 15.4 驗證新建活動上的頭像重新排序
- [x] 15.5 檢查控制台中的警告和錯誤

## 16. 集成測試

- [x] 16.1 端對端測試：建立活動並驗證其出現在動態牆中（Task16_1_CreateActivity_ShouldAppearInFeed）
- [x] 16.2 端對端測試：點擊頭像開啟轉盤並導航歷史（Task16_2_GetSummaries_ThenGetBabyActivities_ShouldWork）
- [x] 16.3 端對端測試：動態牆以正確的時間順序更新（Task16_3_Feed_ShouldBeOrderedByCreatedAtDesc）
- [x] 16.4 端對端測試：授權檢查（Task16_4_OtherNanny + SystemAdmin，2 tests）
- [x] 16.5 端對端測試：多隻寶寶正確重新排序頭像（Task16_5_Summaries_ShouldBeOrderedByLatestActivityDesc）
