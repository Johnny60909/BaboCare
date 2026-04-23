# 寶寶動態輪播 (baby-activity-carousel) 規格書

## 目的 (Purpose)

定義從首頁頭像區域瀏覽個別寶寶活動歷史的輪播介面。同步自變更案 baby-activity-timeline。

## 新增需求 (ADDED Requirements)

### 需求：帶有活動時間軸的寶寶頭像輪播 (Baby avatar carousel with activity timeline)

系統應 (SHALL) 在首頁顯示寶寶頭像，並依據最新活動時間戳進行重新排序。點擊頭像會開啟該寶寶的活動輪播，依序顯示最新活動。

#### 場景：寶寶頭像根據最新活動重新排序 (Baby avatars reorder by latest activity)

- **當 (WHEN)** 為寶寶發佈新活動時
- **則 (THEN)** 該寶寶的頭像會移至頭像區域的最左側
- **則 (THEN)** 右側的寶寶頭像會相應向右移位
- **則 (THEN)** 沒有近期活動的頭像將保持原始順序排在活躍寶寶之後

#### 場景：用戶點擊寶寶頭像以開啟輪播 (User clicks baby avatar to open carousel)

- **當 (WHEN)** 用戶點擊首頁區域中的寶寶頭像時
- **則 (THEN)** 開啟輪播彈窗/視圖，顯眼地顯示該寶寶的最新活動

#### 場景：輪播優先顯示最新活動 (Carousel displays newest activity first)

- **當 (WHEN)** 開啟某寶寶的輪播時
- **則 (THEN)** 系統顯示該寶寶最近的一次活動（依 CreatedAt 降序排列）

#### 場景：無活動寶寶的空輪播狀態 (Empty carousel state for babies without activities)

- **當 (WHEN)** 用戶點擊沒有任何活動的寶寶頭像時
- **則 (THEN)** 系統顯示空狀態訊息，並提示可以建立第一筆活動

### 需求：輪播導覽至過往活動 (Carousel navigation to previous activities)

系統應 (SHALL) 允許用戶透過滑動或點擊輪播中的右箭頭導覽至過往活動。

#### 場景：用戶透過右箭頭導覽至過往活動 (User navigates to previous activity via right arrow)

- **當 (WHEN)** 輪播顯示當前活動時
- **則 (THEN)** 用戶可以點擊右箭頭查看上一次活動（時間戳較早的活動）
- **則 (THEN)** 活動詳細資訊更新以顯示前一個活動的內容

#### 場景：輪播防止導覽超過最早的活動 (Carousel prevents navigation beyond oldest activity)

- **當 (WHEN)** 輪播顯示寶寶的最早活動時
- **則 (THEN)** 右箭頭被禁用或導覽無效
- **則 (THEN)** 用戶看到已到達末尾的指示

#### 場景：透過滑動手勢進行輪播導覽 (Carousel navigation via swipe gesture)

- **當 (WHEN)** 用戶在輪播活動卡片上向右滑動時
- **則 (THEN)** 輪播顯示上一個活動
- **則 (THEN)** 向左滑動則導覽至下一個（較新的）活動

#### 場景：活動計數器顯示當前位置 (Activity counter shows current position)

- **當 (WHEN)** 輪播顯示活動時
- **則 (THEN)** 系統顯示位置指示器（例如：「3 / 15」）以顯示當前活動索引

### 需求：輪播數據加載與效能 (Carousel data loading and performance)

系統應 (SHALL) 在開啟輪播時加載寶寶的近期活動（上限 20 筆），以實現流暢導覽。

#### 場景：開啟時加載輪播活動 (Carousel loads activities on open)

- **當 (WHEN)** 用戶為寶寶開啟輪播時
- **則 (THEN)** 系統獲取該寶寶最接近的 20 筆活動，並存儲在輪播狀態中

#### 場景：按需依序加載舊活動 (Carousel loads older activities on demand)

- **當 (WHEN)** 用戶導覽超過已加載的活動時
- **則 (THEN)** 系統獲取下一批較舊的活動並附加到輪播中

#### 場景：利用快取實現快速輪播導覽 (Fast carousel navigation with caching)

- **當 (WHEN)** 用戶在輪播活動之間導覽時
- **則 (THEN)** 過渡效果流暢且無加載延遲（活動已快取）

### 需求：輪播活動顯示 (Carousel activity display)

系統應 (SHALL) 在輪播視圖中顯示活動照片、類型、時間戳、類型特定選項及備註。

#### 場景：輪播顯示完整活動細節 (Carousel shows complete activity details)

- **當 (WHEN)** 輪播顯示活動時
- **則 (THEN)** 所有細節皆可見：照片（大圖）、活動類型、時間戳、選項摘要及備註

#### 場景：可從首頁返回輪播 (Carousel accessible from home page)

- **當 (WHEN)** 輪播開啟時
- **則 (THEN)** 用戶可以關閉輪播並返回首頁動態牆
- **則 (THEN)** 首頁動態牆保持在相同的捲動位置

### 需求：頭像重新排序保留頭像外觀 (Avatar reordering preserves avatar appearance)

系統應 (SHALL) 保持一致的寶寶頭像圖片與顯示；重新排序僅為視覺效果，不影響底層寶寶檔案數據。

#### 場景：頭像重新排序不修改寶寶檔案 (Avatar reordering does not modify baby profile)

- **當 (WHEN)** 發佈活動時
- **則 (THEN)** 寶寶的頭像、姓名和個人檔案數據保持不變
- **則 (THEN)** 僅改變首頁區域中頭像的顯示順序

#### 場景：多個有活動的寶寶顯示所有頭像 (Multiple babies with activities display all avatars)

- **當 (WHEN)** 多個寶寶都有活動時
- **則 (THEN)** 所有活跃的寶寶頭像皆出現在頂部重新排序的區域中
- **則 (THEN)** 不活躍的寶寶按原始順序顯示在下方
