# 靈魂食堂 V4.0 程式碼庫

> [!warning] 安全警告
> 此目錄包含敏感資訊（LINE Token、Google Sheets ID）  
> **請勿將此目錄上傳到公開的 Git 倉庫或分享給他人**

---

## 📁 檔案說明

### `程式碼_GAS相容版.gs` ✅ **正式部署版本**
- **狀態**：✅ 2026-01-17 部署並測試成功
- **版本**：V4.0（CONFITEOR 架構）
- **包含功能**：
  - ✅ 五味診斷系統（FLAVOR_EMOTION_MAP）
  - ✅ 標籤驅動對話引擎（findMatchingDialogue）
  - ✅ 跨日鎖定機制（canProgressToNextDay）
  - ✅ DEBUG 模式完整指令集
  - ✅ 10 欄數據結構支援
  - ✅ LINE Webhook 完整處理
  - ✅ ES5 語法相容（移除 emoji、箭頭函數等）
- **敏感資訊**：
  - `SPREADSHEET_ID`：Google Sheets 試算表 ID
  - `TOKEN`：LINE Messaging API Channel Access Token
- **部署方式**：
  1. 複製整個檔案內容
  2. 貼上到 Google Apps Script Editor
  3. 儲存並部署為 Web App
  4. 設定 Webhook URL 到 LINE Developers

### `userState_備份_2026-01-12.csv`
- **用途**：V1.4 舊版數據備份（已過時）
- **狀態**：僅供參考，不再使用
- **新數據結構**：請參考 [[專案實作對照表]]

---

## 🔒 安全建議

### 目前做法（開發階段）
- 敏感資訊直接寫在程式碼中（方便快速開發）
- 設定 `IS_DEBUG_MODE = true` 以跳過時間限制

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

3. **上線前檢查**：
   - ⚠️ 將 `IS_DEBUG_MODE` 改為 `false`
   - ⚠️ 移除或保護 `/debug` 指令（防止玩家作弊）

---

## 🧪 測試指令

### DEBUG 指令集（需 IS_DEBUG_MODE = true）

```bash
/debug state           # 查看當前用戶狀態
/debug reset           # 重置用戶狀態
/debug skipday         # 跳過一天（推進到下一天）
/debug addtag [tag]    # 手動添加標籤
```

### 互動指令測試

```bash
[行動-熱茶]            # 測試標籤採集（Day 1）
[餵食-鹹]             # 測試五味診斷
[詢問-那是給誰的？]    # 測試深度對話（Day 2）
[烹飪-開始]           # 測試烹飪流程（Day 3）
```

---

## 📊 V4.0 架構對照

### 數據結構（10 欄）

| 欄位 | 說明 | 範例 |
|------|------|------|
| A: userId | LINE User ID | `U1234567890abcdef` |
| B: currentDay | 當前天數 | `1` |
| C: guestID | 當前靈魂編號 | `guest1` |
| D: collectedTags | 已收集標籤 (JSON) | `["warmth","salty"]` |
| E: lastActive | 最後活躍時間 | `2026-01-17 14:30:00` |
| F: unlockedRecipe | 已解鎖料理 | `honey_salty_fish` |
| G: phase | 當前階段 | `sensory` |
| H: inventory | 物品庫存 (JSON) | `{"fish":1}` |
| I: completedGuests | 已完成靈魂 (JSON) | `["guest1"]` |
| J: lifetimeHeirlooms | 累計遺物數 | `3` |

詳細說明：[[專案實作對照表]]

---

## 🐛 已知問題與解決

### ✅ 已解決
- ✅ ~~語法錯誤（emoji 不相容）~~ → 已移除所有 emoji
- ✅ ~~ES6 語法不相容~~ → 已改為 ES5
- ✅ ~~箭頭函數錯誤~~ → 已改為傳統函數
- ✅ ~~模板字串錯誤~~ → 已改為字串連接

### 待開發功能
- [ ] 料理合成完整邏輯（`handleCooking` 函數）
- [ ] Flex Message 視覺化回應
- [ ] Rich Menu 狀態機切換

---

## 📝 相關文件

### 核心文件
- [[../../00-核心企劃/靈魂食堂：最終開發執行企劃書]] - SSOT 唯一真理
- [[../../00-工作區/重構完成報告_2026-01-17]] - V4.0 完整報告
- [[專案實作對照表]] - 技術規格手冊

### 劇本文件
- [[../../02-劇本設計/Guest1_失憶老裁縫_完整劇本]] - 可直接使用的劇本

### 歷史文件
- [[2026-01-12_Cloudy開發紀錄]] - V1.4 開發日誌（已過時）
- [[版本總結_V1.0-V1.2]] - 舊版本總結

---

## 🎯 快速開始

### 1. 部署程式碼
```bash
1. 開啟 Google Apps Script Editor
2. 複製 程式碼_GAS相容版.gs 的完整內容
3. 貼上到編輯器
4. 儲存（Ctrl+S）
5. 部署 → 新增部署作業 → Web App
6. 複製 Webhook URL
7. 到 LINE Developers 設定 Webhook URL
```

### 2. 設定 Google Sheets
確認以下 Sheet 存在：
- `userState`（10 欄）
- `dialogueLibrary`（5 欄）
- `recipeDatabase`（5 欄）
- `guestConfig`（7 欄）
- `heirlooms`（4 欄）

詳細結構：[[專案實作對照表]]

### 3. 填入劇本
參考：[[../../02-劇本設計/Guest1_失憶老裁縫_完整劇本]]

### 4. 測試
在 LINE OA 發送 `/debug state` 確認運作

---

**最後更新**：2026-01-17（V4.0 重大更新）  
**維護者**：開發者  
**測試狀態**：✅ 核心功能測試通過
