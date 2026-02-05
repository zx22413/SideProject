# LIFF 除錯操作說明

## 為什麼不能直接開 index.html？

用檔案總管雙擊 `index.html` 或從瀏覽器開「檔案路徑」，網址會是 `file:///...`。  
在這種情況下，瀏覽器會阻擋頁面裡的 `fetch()` 對外連線（GAS API、或本機日誌伺服器），所以按「完成料理」會失敗並顯示「出了點問題...再試一次？」。

**請改成本機 HTTP 伺服器開啟頁面。**

---

## 具體操作步驟

### 1. 開終端機，進入 LIFF 資料夾

在 Cursor 或 PowerShell 執行：

```powershell
cd "e:\SideProject\01-開發實驗\程式碼\liff-cooking"
```

### 2. 啟動本機網站（二選一）

**方式 A（建議，不需安裝）：**

```powershell
npx -y serve .
```

看到類似 `Local: http://localhost:3000` 的網址。

**方式 B（若已安裝 Python）：**

```powershell
python -m http.server 8080
```

網址為 `http://localhost:8080`。

### 3. 用瀏覽器開該網址

- 方式 A：在瀏覽器網址列輸入 **http://localhost:3000**
- 方式 B：輸入 **http://localhost:8080**

不要用 `file:///` 開 index.html。

### 4. 在頁面上重現問題

1. 等頁面載入（若會跳 LINE 登入，可先取消或用手機測）。
2. 在「可用記憶」裡選好**正確的食材**（依左側「本日可做料理」的條件選）。
3. 點 **「完成料理」**。
4. 若出現「還缺食材」或「出了點問題...再試一次？」等錯誤，請在 Cursor 偵錯 UI 按 **Proceed**，方便我們讀取日誌。

### 5. 日誌說明

- 日誌會送到本機的偵錯伺服器（若 Cursor 有啟動），並寫入 `e:\SideProject\.cursor\debug.log`。
- 只有用 **http://localhost:xxxx** 開的頁面，`fetch` 才會正常送出，日誌才會被記錄。

---

**摘要：不要直接開 index.html 檔案，請用 `npx -y serve .` 或 `python -m http.server` 後，用 http://localhost:xxxx 開啟並操作。**
