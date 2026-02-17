# 靈魂食堂 Ink 版開發指南

> **對象**：以 Ink 為劇情 SSOT、後續接 Twine／網頁／Ren'Py 等殼的開發流程。  
> **建立日期**：2026-02-17

---

## 一、使用 Inky 編輯器

1. **安裝**：[Inky](https://github.com/y-lohse/ink)（或 [itch.io 版](https://inky.itch.io/inky)）
2. **開啟專案**：開啟 `01-開發實驗/ink/` 目錄下的 `.ink` 檔案
3. **邊寫邊跑**：編輯後在 Inky 內即時預覽，不需載體即可玩到自己寫的內容

---

## 二、.ink 放置與命名

- **位置**：`01-開發實驗/ink/`
- **命名建議**：
  - 單檔：`soul_canteen_main.ink`
  - 多檔：依章節如 `soul_canteen_day1.ink`、`soul_canteen_day2.ink`，用 `INCLUDE` 匯入主檔

---

## 三、匯出與接殼

### 匯出 JSON

- Inky：**File → Export → Export to JSON**，得到編譯後的 `.json`
- 或使用 [inklecate](https://github.com/y-lohse/ink) 指令列編譯

### 接殼方式

| 殼 | 做法 |
|----|------|
| **Ink 網頁播放器 / Twine** | 使用 ink-web 或相容播放器載入 JSON，純文字即可跑 |
| **自刻網頁** | 使用 [inkjs](https://github.com/y-lohse/inkjs) 等引擎載入 JSON，前端自訂 UI、打字效果、BGM |
| **Ren'Py** | 使用 Ren'Py 的 Ink 外掛或將劇情轉寫為 Ren'Py script，接立繪與背景 |

內容一律從 `.ink` 產出，換殼時只換播放器與資源，不改劇情檔。

---

## 四、相關文件

- [[專案實作對照表]] - Ink 劇本結構、knot 與儀式階段對應
- [[專案實作對照表]] - 企劃概念與 Ink 結構映射
- [[GAS→Ink 翻譯對照表]] - 翻譯時 GAS/Sheets 與 Ink 對照
- [[00-核心企劃/產品路線圖]] - 階段規劃（Ink 翻譯 → 寫完劇情 → 選殼）
