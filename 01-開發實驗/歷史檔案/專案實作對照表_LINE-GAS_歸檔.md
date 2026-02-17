# 專案實作對照表：靈魂食堂的敘事-技術映射手冊（LINE/GAS 版・歸檔）

> **歸檔說明**：2026-02-17 因決策點 9（轉型 Ink 優先）歸檔。現行對照表為 Ink 版，見 [[專案實作對照表]]。  
> **文件性質**：開發聖經（Dev Bible）・歷史參考  
> **最後更新**：2026-02-08（V4.15）

---

## 🎯 文件目的

本文件解決「企劃」與「代碼」之間的**語義鴻溝**（LINE + GAS + Google Sheets 架構）。  
現專案改以 Ink 為劇情 SSOT，企劃與 Ink 結構對照請見 [[專案實作對照表]]。

---

## 📊 核心資料結構映射

### 一、Google Sheets 架構總覽

```
SPREADSHEET: "靈魂食堂 - 田中太郎版" 
└── Sheet 1: userStateTanaka (玩家狀態) ← 唯一需要的工作表
```

### 二、userStateTanaka Sheet：玩家狀態追蹤表（V4.8 版本）

| 欄位 | 變數名 | 資料型態 | 企劃概念 |
|------|--------|----------|----------|
| **A** | `userId` | String | 玩家的 LINE UID |
| **B** | `currentDay` | Integer (1-3) | 當前是第幾天 |
| **C** | `phase` | Enum | 當前階段 night/day/cooking/after |
| **D** | `collectedMemories` | JSON Array | 已收集的記憶食材 |
| **E** | `topicsDone` | JSON Array | 已完成的話題 |
| **F** | `lastActive` | Timestamp | 最後互動時間戳 |
| **G** | `dishesCooked` | JSON Array | 本輪做過的料理 |
| **H** | `lifetimeHeirlooms` | JSON Object | 永久遺物記錄（跨輪次） |

**設計原則**：單表設計，所有玩家資料在同一行。階段流程：Day 1 NIGHT→DAY→COOKING→AFTER；Day 2 DAY→COOKING→AFTER；Day 3 COOKING→AFTER→結局。五味系統、結局判定、函數映射、遊戲流程、Rich Menu、Debug 指令等詳見版控歷史中本檔案之完整版本。

---

## 🔗 相關

- [[開發決策鏈]] - 決策點 9 為轉型 Ink 之原因與路線
- [[專案實作對照表]] - 現行 Ink 版對照表
- [[GAS→Ink 翻譯對照表]] - GAS/Sheets 與 Ink 變數、knot 對照
