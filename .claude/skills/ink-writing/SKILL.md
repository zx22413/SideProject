---
name: ink-writing
description: Ink 劇本語法與靈魂食堂專案慣例。撰寫或修改 .ink 檔、翻譯 GAS 劇本、命名 knot/stitch、變數對應時使用。
---

# Ink Writing Skill

## When to Use

- 撰寫或修改 `01-開發實驗/ink/` 下的 `.ink` 劇本
- 從 GAS/Sheets 翻譯成 Ink 時
- 新增 knot、stitch 或變數時
- 需要查 Ink 語法時

---

## Ink 語法速查表

| 類別 | 語法 | 說明 |
|------|------|------|
| **Knot** | `=== knot_name ===` | 主要劇情節點 |
| **Stitch** | `= stitch_name` | 子節點，位於 knot 內 |
| **Divert** | `-> knot_name` / `-> knot.stitch` | 跳轉至 knot 或 stitch |
| **Choice** | `* 選項文字` | 玩家選項 |
| **隱藏選項** | `* [選項文字]` | 選項不重複輸出 |
| **混和** | `* 前段[僅選項]後段` | 前段兩處都有、中段僅選項、後段僅輸出 |
| **巢狀選項** | `**`、`***` | 第二、三層選項 |
| **Gather** | `-` | 多選項匯流點 |
| **變數宣告** | `VAR name = value` | 全域變數（檔首） |
| **賦值** | `~ var = value` | 單行邏輯 |
| **條件內文** | `{condition: 內容}` | 條件成立才輸出 |
| **條件塊** | `{ 條件: ... }` / `{- else: ... }` | if/else 區塊 |
| **Glue** | `<>` | 接續不分段 |
| **Include** | `INCLUDE file.ink` | 匯入檔案（檔首） |
| **註解** | `//` 或 `/* */` | 不輸出 |
| **TODO** | `TODO: 內容` | 編譯期提示 |
| **標籤** | `# tag` | 行標籤（供遊戲讀取） |
| **結束** | `-> END` | 故事結束 |

### 選項規則

- `*` 預設 once-only（選過不再顯示）；`+` 可重選
- Fallback：`* + [預設選項]` 當無其他選項時自動觸發
- 條件選項：`{done_xxx} * [已談過]`

---

## 靈魂食堂專案慣例

以 `01-開發實驗/ink/soul_diner_tanaka.ink` 與 `01-開發實驗/專案實作對照表.md` 為依據。

### 核心變數

| 變數 | 型別 | 說明 |
|------|------|------|
| `current_day` | INT (1–3) | 當前天數 |
| `phase` | STR | night / day / cooking / after |
| `flavor_sweet` ~ `flavor_salty` | INT | 五味累計 |
| `ending_type` | STR | SWEET / BITTER / BALANCED |
| `done_*` | bool | 話題完成（如 done_hands, done_origin） |
| `has_*` | bool | 特殊記憶（如 has_pride, has_ceremony） |
| `day1_dish` / `day2_dish` / `day3_dish` | STR | 本輪料理記錄 |

### Knot 命名（實際範例）

- `START`、`DAY1_NIGHT`、`DAY1_DAY`、`DAY1_COOKING`、`DAY1_AFTER_*`
- `DAY2_DAY`、`DAY2_COOKING`、`DAY2_AFTER`、`DAY2_TO_DAY3`
- `DAY3_COOKING`、`DAY3_AFTER`、結局分流
- 話題 stitch：`TOPIC_HANDS`、`TOPIC_ORIGIN`、`TOPIC_RAIN` 等

### 五味與結局判定

- **SWEET**：甜味 > 其他四味總和
- **BITTER**：苦味 > (甜味 + 鹹味)
- **BALANCED**：其餘

### 常用結構

```ink
// 選項後分流再匯合
* 選項 A
    -> topic_a
* 選項 B
    -> topic_b
- 共同後續內容

// 五味累加
~ flavor_sweet += 1

// 條件選項（已談過則隱藏）
{not done_hands} * [談談那雙手]
    -> TOPIC_HANDS
```

---

## 相關 Skill 與文件

- **script-expansion-principles**：擴充劇情時判斷該加／不該加
- **01-開發實驗/靈魂食堂 Ink 版開發指南.md**：開發流程、匯出、接殼
- **01-開發實驗/專案實作對照表.md**：企劃↔Ink 映射
- **01-開發實驗/GAS→Ink 翻譯對照表.md**：GAS/Sheets 欄位對照
- **01-開發實驗/docs/WritingWithInk.md**：完整 Ink 語法（備份）
- 線上：https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md
