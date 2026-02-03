# LIFF 做飯小遊戲 - 設定指南

## 一、LINE Developers Console 設定

### Step 1：進入 LINE Developers Console

1. 前往 https://developers.line.biz/
2. 登入你的 LINE 帳號
3. 選擇你的 Provider（或建立新的）
4. 選擇你的 LINE Login Channel（或建立新的）

### Step 2：建立 LIFF App

1. 在 Channel 頁面，點擊左側選單的 **LIFF**
2. 點擊 **Add** 按鈕
3. 填寫以下資訊：

| 欄位               | 建議值                                                             |
| ---------------- | --------------------------------------------------------------- |
| LIFF app name    | 靈魂食堂料理                                                          |
| Size             | Full（全螢幕）或 Tall（3/4 螢幕）                                         |
| Endpoint URL     | `https://你的用戶名.github.io/SideProject/01-開發實驗/程式碼/liff-cooking/` |
| Scope            | 勾選 `profile`                                                    |
| Bot link feature | On (Aggressive)                                                 |

4. 點擊 **Add** 完成建立
5. 記下 **LIFF ID**（格式：`1234567890-xxxxxxxx`）

### Step 3：更新程式碼中的 LIFF ID

編輯 `app.js`，找到 CONFIG 區塊，替換 LIFF_ID：

```javascript
const CONFIG = {
  LIFF_ID: '你的LIFF_ID',  // ← 替換這裡
  GAS_API_URL: '你的GAS_URL',
  // ...
};
```

---

## 二、部署前端到 GitHub Pages

### Step 1：確認 Git LFS 設定

LIFF 前端是純靜態檔案，不需要 LFS。確認 `.gitattributes` 沒有追蹤 `.html`、`.css`、`.js`。

### Step 2：推送到 GitHub

```bash
git add 01-開發實驗/程式碼/liff-cooking/
git commit -m "feat: 新增 LIFF 做飯小遊戲前端"
git push
```

### Step 3：啟用 GitHub Pages

1. 前往 GitHub repo 的 **Settings** → **Pages**
2. Source 選擇 **Deploy from a branch**
3. Branch 選擇 `main`，資料夾選擇 `/ (root)`
4. 點擊 **Save**
5. 等待部署完成（通常 1-2 分鐘）
6. 取得 URL：`https://你的用戶名.github.io/SideProject/01-開發實驗/程式碼/liff-cooking/`

### Step 4：更新 LIFF Endpoint URL

回到 LINE Developers Console，更新 LIFF App 的 Endpoint URL 為 GitHub Pages URL。

---

## 三、GAS 後端 API 設定

### Step 1：更新 GAS 程式碼

在 `靈魂食堂_田中太郎_五味料理版.gs` 中已新增：
- `doGet()` - 處理 LIFF API 請求
- `getCookingStateForLiff()` - 返回可用記憶
- `submitCookingFromLiff()` - 處理料理提交

### Step 2：部署 GAS Web App

1. 在 GAS 編輯器，點擊 **部署** → **新增部署**
2. 選擇類型：**網頁應用程式**
3. 設定：
   - 執行身分：我
   - 存取權限：所有人
4. 點擊 **部署**
5. 記下 **Web App URL**

### Step 3：更新前端中的 GAS URL

編輯 `app.js`，替換 GAS_API_URL：

```javascript
const CONFIG = {
  LIFF_ID: '你的LIFF_ID',
  GAS_API_URL: '你的GAS_Web_App_URL',  // ← 替換這裡
  // ...
};
```

---

## 四、整合到遊戲流程

### 方式 A：啟用 LIFF 全域開關（推薦）

1. 在 GAS 的 CONFIG 中設定：

```javascript
const CONFIG = {
  // ...其他設定
  LIFF_ENABLED: true,  // 設為 true 啟用
  LIFF_ID: '你的LIFF_ID',
  LIFF_URL: 'https://liff.line.me/你的LIFF_ID'
};
```

2. 在料理場景中使用 `getLiffCookingButton()` 輔助函數：

```javascript
// 例如在 getDay1CookingScene() 中
if (shouldUseLiffCooking()) {
  footerContents.push(getLiffCookingButton("🍳 開始料理"));
} else {
  // 傳統按鈕...
}
```

### 方式 B：手動添加 LIFF 按鈕

在任何 Flex Message 中添加 URI 按鈕：

```javascript
{
  type: "button",
  action: {
    type: "uri",
    label: "🍳 開始料理",
    uri: "https://liff.line.me/你的LIFF_ID"
  },
  style: "primary",
  color: "#e09f3e"
}
```

### 處理 LIFF 回傳結果

LIFF 完成料理後，會透過 `liff.sendMessages()` 發送結果到聊天室。
在 GAS 的 `handleMessage()` 中添加處理邏輯：

```javascript
// 處理 LIFF 料理結果
if (userText.startsWith("【料理完成】")) {
  // 解析結果並繼續流程
  const dishName = userText.replace("【料理完成】", "").trim();
  // ...處理結局計算
}
```

---

## 五、測試流程

### 本地測試（開發模式）

1. 直接用瀏覽器開啟 `index.html`
2. 程式會檢測到 LIFF_ID 未設定，自動使用測試數據
3. 可以測試拖曳互動和 UI

### LINE 內測試

1. 完成上述所有設定
2. 在 LINE 聊天室中，點擊「開始料理」按鈕
3. LIFF 會在 LINE 內開啟
4. 完成料理後，結果會發送回聊天室

---

## 六、常見問題

### Q1：LIFF 開啟時顯示白畫面？
A：檢查 Endpoint URL 是否正確、HTTPS 是否有效。

### Q2：無法取得用戶資料？
A：確認 LIFF Scope 有勾選 `profile`，且用戶已同意授權。

### Q3：料理結果沒有發送到聊天室？
A：檢查 `liff.sendMessages()` 是否正確執行，以及 LIFF 是否在 LINE 內開啟。

### Q4：GAS API 回傳 CORS 錯誤？
A：GAS Web App 部署時，存取權限要設為「所有人」。

---

## 七、檔案結構

```
liff-cooking/
├── index.html    # 主頁面結構
├── style.css     # 視覺樣式
├── app.js        # 互動邏輯
└── SETUP.md      # 本文件
```

---

**建立日期**：2026-02-03  
**版本**：MVP 1.0
