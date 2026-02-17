# LIFF 除錯操作說明（歸檔）

> **歸檔說明**：2026-02-17 自 liff-cooking/ 移入歸檔。

不要直接開 index.html（file:// 會阻擋 fetch）。請用本機 HTTP 伺服器：

```powershell
cd "01-開發實驗\程式碼\liff-cooking"
npx -y serve .
```

用瀏覽器開 http://localhost:3000 操作。完整說明見版控歷史。
