# 個人中心帳戶設定 - Design

## 架構

### 前端組件結構

```
ProfilePage
├─ AccountSettingsModal (embedded)
│  ├─ 顯示名稱 (TextInput)
│  ├─ 性別 (Select)
│  ├─ 郵箱 (TextInput)
│  ├─ 電話號碼 (TextInput)
│  └─ 保存/取消按鈕
└─ ProfileSettingsMenu
   ├─ 帳戶設定
   ├─ 進入後台 (admin only)
   └─ 登出
```

### 菜單設計

```
⋮ 菜單
├─ 帳戶設定 → 打開 ProfilePage 中的編輯界面
├─ 進入後台 → 導航到 /admin（admin only）
├─ ─────────────
└─ 登出 → 執行登出
```

### 底部導航修改

移除 "管理" 按鈕，底部導航僅保留：

- 首頁
- 行事曆
- 新增動態 (+ 按鈕)
- 數據
- 個人

## API 設計

### PUT /api/me/profile

**請求:**

```json
{
  "displayName": "王媽媽",
  "gender": "Female",
  "email": "wang@example.com",
  "phoneNumber": "0912345678"
}
```

**響應:**

```json
{
  "state": 111,
  "message": null,
  "data": {
    "id": "user-123",
    "displayName": "王媽媽",
    "gender": "Female",
    "email": "wang@example.com",
    "phoneNumber": "0912345678",
    "userName": "wang",
    "roles": ["Parent"]
  }
}
```

## UI 流程

1. 用戶進入個人中心 (/profile)
2. 點擊菜單 (⋮) 中的「帳戶設定」
3. ProfilePage 切換到編輯模式（不導航離開）
4. 用戶修改資訊並點擊保存
5. 調用 PUT /api/me/profile
6. 成功後返回查看模式

## 資料模型

### CurrentUserDto (前端)

```typescript
export interface CurrentUserDto {
  id: string;
  email: string;
  displayName: string;
  gender?: string;
  phoneNumber?: string;
  userName: string;
  roles: string[];
}
```

### UpdateMyProfileRequest (後端 DTO)

```csharp
public record UpdateMyProfileRequest(
    string DisplayName,
    string? Gender,
    string? Email,
    string? PhoneNumber
);
```
