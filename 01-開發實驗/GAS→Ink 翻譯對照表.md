# GAS→Ink 翻譯對照表

> **用途**：將現有劇情從 GAS（Google Apps Script）+ Google Sheet 翻譯成 Ink 格式時，對照變數、階段與節點，避免遺漏。  
> **建立日期**：2026-02-17

---

## 一、狀態欄位對照

| GAS/Sheets（userStateTanaka） | Ink 建議 | 說明 |
|-------------------------------|----------|------|
| `currentDay` (B 欄) | `VAR current_day` (INT, 1–3) | 當前天數 |
| `phase` (C 欄) | `VAR phase` (STR: night/day/cooking/after) | 當前階段 |
| `collectedMemories` (D 欄, JSON Array) | `LIST collected_memories` 或 Ink list | 已收集記憶標籤，如 針、縫線、寒冷 |
| `topicsDone` (E 欄, JSON Array) | `LIST topics_done` 或 Ink list | 已完成話題 ID，如 hands_part1、origin |
| `lastActive` (F 欄) | 可省略或作存檔用 | 非進度門檻，Ink 可不在劇情內使用 |
| `dishesCooked` (G 欄, JSON Array) | `LIST dishes_cooked` | 本輪做過的料理名稱 |
| `lifetimeHeirlooms` (H 欄, JSON Object) | 可為外部存檔或 Ink 變數 | 永久遺物（跨輪次），依殼決定是否由 Ink 管理 |

---

## 二、階段流程對照

| GAS 階段流 | Ink knot 建議 |
|------------|----------------|
| Day 1 night → day → cooking → after | `Day1_Night` → `Day1_Day` → `Day1_Cooking` → `Day1_After` |
| Day 2 day → cooking → after | `Day2_Day` → `Day2_Cooking` → `Day2_After` |
| Day 3 cooking → after → 結局 | `Day3_Cooking` → `Day3_After` → 依 ending 分流 |

---

## 三、結局類型對照

| GAS 常數 | Ink 建議 | 判定邏輯（企劃） |
|----------|----------|------------------|
| `ENDING_SWEET` | `ending_type = "SWEET"` | 甜味 > 其他四味總和 |
| `ENDING_BITTER` | `ending_type = "BITTER"` | 苦味 > (甜味 + 鹹味) |
| `ENDING_BALANCED` | `ending_type = "BALANCED"` | 其餘情況 |

---

## 四、話題 / 記憶標籤對照（參考）

GAS 與 Sheet 內使用之話題 ID、記憶名稱可直接作為 Ink 內選項或標籤使用，例如：

- 話題：`hands_part1`、`origin`、`rain`、`silent_company`、`ceremony_rift`、`twilight_artisan` 等
- 記憶：針、縫線、寒冷、雨聲、失憶、迷茫、寧靜、陪伴、蜜糖笑容、眼淚、執念、雪、死亡、銀座的驕傲、缺席的典禮、失語、空蕩的店 等

翻譯時在 Ink 內用 `~ topics_done.Add("hands_part1")`、`~ collected_memories.Add("針")` 等與原邏輯對齊即可。

---

## 五、函數／流程對應（僅供對照，Ink 無函數）

| GAS 職責 | Ink 做法 |
|----------|----------|
| `handleDay1Night`、`getDay1DayShift` 等 | 對應 knot 內敘事與選擇枝 |
| `getDay1CookingScene`、料理選項 | `Day1_Cooking` knot 內選項與條件 |
| `determineEnding(flavors)` | Ink 內依五味變數計算後設定 `ending_type` |
| `pushMessages`、Loading | 由播放器／殼處理，Ink 只產出內容與選擇 |

---

## 相關文件

- [[專案實作對照表]] - Ink 版企劃↔結構映射
- [[專案實作對照表]] - Ink 劇本結構與 knot 命名
- [[歷史檔案/專案實作對照表_LINE-GAS_歸檔]] - 原 GAS/Sheets 完整對照（歷史）
