# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**靈魂食堂（Soul Cafeteria）**，代號 CONFITEOR。一款以 Ink 為劇情 SSOT 的文字敘事遊戲：玩家扮演罪名吞噬者，透過五味診斷與料理救贖幫助困於執念的靈魂。

**當前狀態**：Ink 轉型期。GAS/LINE 版本已歸檔，劇情以 Ink 撰寫，殼（Twine／網頁／Ren'Py）尚未選定。

## 開發工作流（Ink）

- **編輯器**：安裝 [Inky](https://github.com/y-lohse/ink)，開啟 `01-開發實驗/ink/` 下的 `.ink` 檔案，即時預覽。
- **編譯**：Inky → File → Export → Export to JSON；或使用 `inklecate soul_diner_tanaka.ink`。
- **接殼**：匯出 JSON 後接播放器（inkjs 網頁、Twine 或 Ren'Py）；換殼不改 `.ink` 內容。
- **無傳統 build/test 指令**：驗證方式為 Inky 預覽自玩與封測。

## 文件層級（Tier System）

修改或參考文件前，先確認其層級：

| Tier | 路徑 | 規則 |
|------|------|------|
| **Tier 1（SSOT）** | `01-開發實驗/ink/*.ink`、企劃書、Backlog、專案實作對照表 | 核心決策，變更需同步更新所有 Tier 1 文件 |
| **Tier 2（動態）** | `00-工作區/工作報告_*.md` | 日常紀錄，驅動 Tier 1 更新 |
| **Tier 4（封存）** | `02-劇本設計/`、`01-開發實驗/歷史檔案/`、`01-開發實驗/程式碼/archive-versions/` | 除非明確 `@` 指定，不主動掃描 |

## 關鍵文件索引

| 目的 | 文件 |
|------|------|
| 世界觀、五味、儀式、角色設計規範 | `00-核心企劃/當前專案_靈魂食堂/靈魂食堂：最終開發執行企劃書.md` |
| Ink knot↔儀式階段、變數映射 | `01-開發實驗/專案實作對照表.md` |
| GAS 變數與 Ink 翻譯對照 | `01-開發實驗/GAS→Ink 翻譯對照表.md` |
| 接殼流程 | `01-開發實驗/靈魂食堂 Ink 版開發指南.md` |
| 轉型決策背景 | `00-核心企劃/開發決策鏈.md`（決策點 9） |
| 階段規劃 | `00-核心企劃/產品路線圖.md` |
| 當前任務 | `00-工作區/主 Backlog_2026-01-15.md` |
| 主 Ink 劇本（Guest 1 田中太郎） | `01-開發實驗/ink/soul_diner_tanaka.ink` |

## Ink 劇本架構

主劇本 `soul_diner_tanaka.ink`（Guest 1，~1770 行）結構：

```
START → DAY1_NIGHT → DAY1_DAY（話題選擇）→ DAY1_COOKING → DAY1_AFTER
      → DAY2_DAY（延伸話題）→ DAY2_COOKING（三分支）→ DAY2_AFTER
      → DAY3_COOKING（依五味）→ DAY3_AFTER → ENDING_* → FAREWELL → EPILOGUE
```

### 核心變數（Ink VAR）

| 變數 | 型別 | 說明 |
|------|------|------|
| `current_day` | INT (1–3) | 儀式進度 |
| `phase` | STR | night / day / cooking / after |
| `flavor_sweet/sour/bitter/spicy/salty` | INT | 五味累積值，決定結局 |
| `done_*`（話題旗標） | BOOL | 控制選項顯示與延伸話題解鎖 |
| `ending_type` | STR | SWEET / BITTER / BALANCED |

### 結局判定

| 結局 | 條件 | 料理 |
|------|------|------|
| SWEET | `flavor_sweet > 其他四味總和` | 糖霜冷盤 |
| BITTER | `flavor_bitter > (flavor_sweet + flavor_salty)` | 千針冷骨湯 |
| BALANCED | 其餘 | 百味醃魚 |

## 跨文件引用規範

Markdown 文件內跨目錄引用使用 `[[相對路徑]]`（Obsidian linking）。

## 歸檔說明

- **GAS 版本**（LINE/Google Sheets/LIFF）：`01-開發實驗/程式碼/archive-versions/` 與 `01-開發實驗/歷史檔案/`，僅供翻譯參考，不再維護。
- **LINE LIFF mini-game**：`01-開發實驗/程式碼/liff-cooking/`，歸檔狀態。
