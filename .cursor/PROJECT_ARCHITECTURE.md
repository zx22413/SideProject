# 靈魂食堂專案導航 (PROJECT_ARCHITECTURE)

> **當前狀態**: V4.13 (LIFF 做飯小遊戲 MVP)
> **核心準則**: 遵循 `.cursorrules` 止血規範，減少 Token 消耗。

## 🧭 Context 邊界

| 情境 | 路徑/檔案 | 啟用規則 | 不啟用 |
|------|-----------|----------|--------|
| 工作進度 | `00-工作區/工作報告_*.md` | work-journal-format、/sync-journal 提醒 | 不掃 .gs、不掃 02-劇本設計 |
| 企劃文件 | Tier 1 的 .md | obsidian-linking（僅 .md） | 不當日記、不強制 /sync-journal |
| 程式碼 | `.gs`、`01-開發實驗/程式碼/` | code-context（止血、唯一真理、極簡回覆） | 不調用日記同步、不調用 Obsidian Skills、不掃 02-劇本設計（除非 @） |

## 📂 文件層級 (Tier System)

### Tier 1：核心決策 (SSOT) - 必須隨時同步
- `靈魂食堂：最終開發執行企劃書.md` : 唯一真理來源。
- `主 Backlog_2026-01-15.md` : 任務狀態追蹤。
- `專案實作對照表.md` : 企劃與 GAS 變數映射。

### Tier 2：動態追蹤 (Daily Operations)
- `00-工作區/工作報告_*.md` : 每日開發紀錄，驅動 Tier 1 更新。

### Tier 4：封印資料 (Cold Storage)
- `02-劇本設計/` : 包含長篇紀實，除 `/sync-journal` 外嚴禁主動掃描。

## 🛠️ 自動化指令 (Skills)
- `/sync-journal` : 觸發日記同步至 Tier 1。
- `/archive-old-journals` : 清理 00-工作區。
- 上述指令僅在用戶**主動執行**或**正在編輯工作報告**時相關；撰寫程式碼時不主動調用。

## 📜 連結規範
- 跨目錄引用必須使用 `[[相對路徑]]`。