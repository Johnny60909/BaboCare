# 寶寶活動建立 (baby-activity-creation) 規格書

## 目的 (Purpose)

定義授權照護者記錄寶寶日常活動的建立流程，包含特定類型選項、照片及備註。同步自變更案 baby-activity-timeline。

## 新增需求 (ADDED Requirements)

### 需求：建立具有類型特定選項的寶寶活動 (Create baby activity with type-specific options)

系統應 (SHALL) 允許授權照護者建立寶寶活動記錄，包含類型（餵奶、飲食、尿布、睡覺、心情）、選填照片、備註及類型特定選項。

#### 場景：照護者建立餵奶活動 (Caregiver creates feeding activity)

- **當 (WHEN)** 照護者選擇「餵奶 (Feeding)」活動類型並點擊發佈時
- **則 (THEN)** 活動被儲存，並帶有類型=Feeding、時間戳、照護者 ID 及寶寶 ID

#### 場景：照護者建立帶有副食品選項的飲食活動 (Caregiver creates eating activity with supplementary food option)

- **當 (WHEN)** 照護者選擇「飲食 (Eating)」活動類型，選擇「副食品」選項，上傳照片，添加備註並點擊發佈時
- **則 (THEN)** 活動被儲存，並帶有類型=Eating、選項={foodType: "supplementary"}、照片 URL 及備註

#### 場景：照護者建立帶有外出選項的心情活動 (Caregiver creates mood activity with outing option)

- **當 (WHEN)** 照護者選擇「心情 (Mood)」活動類型，選擇「外出行」選項，上傳照片並點擊發佈時
- **則 (THEN)** 活動被儲存，並帶有類型=Mood、選項={moodType: "outing"} 及照片 URL

#### 場景：活動建立需要照片及至少一個必填欄位 (Activity creation requires photo and at least one required field)

- **當 (WHEN)** 照護者嘗試在未上傳照片的情況下發佈活動時
- **則 (THEN)** 系統顯示驗證錯誤並阻止提交

#### 場景：活動建立驗證類型特定選項 (Activity creation validates type-specific options)

- **當 (WHEN)** 照護者選擇「飲食」活動類型但帶有無效的食物選項時
- **則 (THEN)** 系統顯示驗證錯誤並阻止提交

#### 場景：僅限授權照護者可以建立活動 (Only authorized caregivers can create activities)

- **當 (WHEN)** 未授權用戶嘗試為寶寶建立活動時
- **則 (THEN)** 系統返回 403 Forbidden 錯誤

### 需求：具有結構化選項的活動類型定義 (Activity type definitions with structured options)

系統應 (SHALL) 支持五種活動類型，每種皆有特定選項：

- **餵奶 (Feeding)**：無配方奶與母奶之分；需上傳照片，備註選填
- **飲食 (Eating)**：副食品或正餐選項；需上傳照片，備註選填
- **尿布 (Diaper)**：無特殊選項；需上傳照片，備註選填
- **睡覺 (Sleep)**：無特殊選項；需上傳照片，備註選填
- **心情 (Mood)**：外出行、遊戲中或不開心選項；需上傳照片，備註選填

#### 場景：系統接受所有五種活動類型 (System accepts all five activity types)

- **當 (WHEN)** 照護者建立每種類型（餵奶、飲食、尿布、睡覺、心情）的活動時
- **則 (THEN)** 所有活動皆以正確的類型標識符進行持久化

#### 場景：心情活動限制為三種心情選項 (Mood activity restricts to three mood options)

- **當 (WHEN)** 照護者嘗試建立帶有無效心情類型的活動時
- **則 (THEN)** 系統進行驗證並拒絕提交，且顯示錯誤訊息

### 需求：活動建立頁面的可存取性 (Activity creation page accessibility)

系統應 (SHALL) 提供活動建立頁面，可從首頁透過底部導覽列的「+」按鈕進入。

#### 場景：照護者導覽至活動建立頁面 (Caregiver navigates to activity creation page)

- **當 (WHEN)** 照護者點擊底部導覽列中的「+」按鈕時
- **則 (THEN)** 系統導覽至活動建立頁面，顯示寶寶選擇器和活動類型選項

#### 場景：活動建立頁面顯示寶寶選擇器 (Activity creation page shows baby selector)

- **當 (WHEN)** 活動建立頁面加載時
- **則 (THEN)** 頁面顯示寶寶頭像，列出所有用戶有權限記錄活動的寶寶
