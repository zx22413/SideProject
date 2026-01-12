# Cloudy V1.4 程式碼歸檔

> [!warning] 安全警告
> 此目錄包含敏感資訊（LINE Token、Google Sheets ID、用戶數據）  
> **請勿將此目錄上傳到公開的 Git 倉庫或分享給他人**

---

## 📁 檔案說明

### `程式碼.gs`
- **用途**：Google Apps Script 的程式碼備份
- **狀態**：2026-01-12 版本（技術底層打通階段）
- **包含功能**：
  - LINE Webhook 處理 (`doPost`)
  - LINE API 回覆 (`replyToLine`)
  - Google Sheets 讀寫邏輯
  - 用戶狀態初始化
- **敏感資訊**：
  - `SPREADSHEET_ID`：Google Sheets 試算表 ID
  - `TOKEN`：LINE Messaging API Channel Access Token

### `userState_備份_2026-01-12.csv`
- **用途**：Google Sheets 的測試數據備份
- **狀態**：2026-01-12 匯出
- **資料結構**：
  - `userId`：LINE 用戶 ID（敏感資訊）
  - `day`：當前天數
  - `currentMood`：當前情緒狀態
  - `tags`：記憶標籤
  - `lastInteraction`：最後互動時間
- **用途**：用於驗證資料結構、測試數據恢復

---

## 🔒 安全建議

### 目前做法（開發階段）
- 敏感資訊直接寫在程式碼中（方便快速開發）

### 未來改進（正式環境）
1. **使用 PropertiesService**：
   ```javascript
   const scriptProperties = PropertiesService.getScriptProperties();
   const TOKEN = scriptProperties.getProperty('LINE_TOKEN');
   const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
   ```

2. **環境變數管理**：
   - 在 GAS 編輯器中：專案設定 → 指令碼內容 → 指令碼屬性
   - 設定 `LINE_TOKEN` 和 `SPREADSHEET_ID`

3. **Git 管理**：
   - 建立 `.env.example` 範本檔案（不含真實值）
   - 將 `.gs` 檔案加入 `.gitignore`（如果使用 Git）

---

## 📝 相關文件

- [[2026-01-12_Cloudy開發紀錄]] - 開發日誌
- [[MVP 企劃：3日陪伴實驗_Bird Alone模式]] - 核心企劃文件

---

**最後更新**：2026-01-12
