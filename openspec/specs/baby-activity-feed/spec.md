# 寶寶活動動態牆 (baby-activity-feed) 規格書

## 目的 (Purpose)

定義首頁顯示的活動動態牆，為授權用戶顯示按時間順序排列的寶寶活動。同步自變更案 baby-activity-timeline。

## 新增需求 (ADDED Requirements)

### 需求：在首頁顯示活動動態牆 (Display activity feed on home page)

系統應 (SHALL) 在首頁顯示所有獲授權寶寶的活動動態牆，並依時間從新到舊排序。

#### 場景：首頁顯示活動動態牆 (Home page shows activity feed)

- **當 (WHEN)** 用戶導覽至首頁時
- **則 (THEN)** 系統顯示包含所有獲授權寶寶活動的動態牆，按建立時間排序（最新優先）

#### 場景：動態牆顯示活動詳情 (Activity feed displays activity details)

- **當 (WHEN)** 渲染活動動態牆時
- **則 (THEN)** 每項活動顯示：寶寶姓名/頭像、活動類型（圖示）、時間戳、照片、備註及類型特定選項

#### 場景：建立新活動時更新動態牆 (Feed updates when new activity is created)

- **當 (WHEN)** 照護者發佈新活動時
- **則 (THEN)** 活動立即出現在動態牆頂部

#### 場景：僅顯示獲授權的活動 (Only authorized activities appear in feed)

- **當 (WHEN)** 用戶查看動態牆時
- **則 (THEN)** 系統僅顯示用戶具有照護者或管理員訪問權限的寶寶活動

### 需求：活動動態牆分頁與效能 (Activity feed pagination and performance)

系統應 (SHALL) 將動態牆結果限制為最近的 20 筆活動，並能透過無限捲動加載更舊的活動。

#### 場景：動態牆顯示最近的 20 筆活動 (Feed displays 20 most recent activities)

- **當 (WHEN)** 首頁加載時
- **則 (THEN)** 系統顯示最近的 20 筆活動

#### 場景：透過無限捲動加載更多舊活動 (Load more older activities via infinite scroll)

- **當 (WHEN)** 用戶捲動到動態牆底部時
- **則 (THEN)** 系統自動獲取並附加接下來的 20 筆舊活動

#### 場景：空動態牆狀態 (Empty feed state)

- **當 (WHEN)** 獲授權寶寶沒有任何活動時
- **則 (THEN)** 系統顯示空狀態訊息，並提供建立活動的引導

### 需求：活動動態牆排序與篩選 (Activity feed sorting and filtering)

系統應 (SHALL) 始終按建立時間降序排序（最新優先）。v1 版本不提供額外的篩選選項。

#### 場景：活動按建立時間戳排序 (Activities sorted by creation timestamp)

- **當 (WHEN)** 多個寶寶存在多項活動時
- **則 (THEN)** 所有活動按照嚴格的 CreatedAt 降序時間順序出現

#### 場景：跨會話排序一致性 (Consistent sort across sessions)

- **當 (WHEN)** 用戶關閉並重新開啟首頁時
- **則 (THEN)** 活動保持相同的时间順序排列

### 需求：活動類型圖示顯示 (Activity type icon display)

系統應 (SHALL) 在動態牆中為每種活動類型顯示清晰的圖示，以助於快速視覺掃描。

#### 場景：動態牆顯示活動類型圖示 (Feed shows activity type icons)

- **當 (WHEN)** 活動出現在動態牆中時
- **則 (THEN)** 系統顯示代表活動類型的圖示（奶瓶、叉子、尿布、睡覺、心情笑臉等）
