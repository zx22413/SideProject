---
description: Hero 圖生成系統 - 為靈魂食堂遊戲生成風格統一的場景圖片，整合到 LINE Flex Card
tags: [image-generation, visual-design, flex-card, prompt-engineering]
version: 1.0.0
---

# Hero Image Generation Skill

## Description

這個 Skill 定義了靈魂食堂專案的 Hero 圖生成標準，包含：
1. 風格定義（Hollow Knight / Alto's Odyssey 美學）
2. 提示詞模板
3. 檔名命名規則
4. 程式碼整合模式

## When to Use

### 適用情境
- ✅ 需要為記憶劇場製作場景圖時
- ✅ 需要為開場或轉場製作視覺圖時
- ✅ 替換 Flex Card 中的 emoji 為圖片時
- ✅ 確保新圖片與現有風格一致時

### 不適用情境
- ❌ UI 元素設計（使用其他規範）
- ❌ 食物圖標設計（另有高飽和度規範）
- ❌ 角色詳細設計稿（此為簡化剪影風格）

## Style Definition

### 核心風格參考

| 特徵 | 說明 |
|------|------|
| 風格參考 | Hollow Knight / Alto's Odyssey |
| 造型 | 幾何簡化、乾淨稜角、清晰剪影 |
| 色彩 | 有限調色盤、低飽和、高對比 |
| 光影 | 暖光（蠟燭/室內）vs 冷調（雨/夜）對比 |
| 風格 | 平面數位插畫、少漸層、色塊分明 |

### 色彩調色盤（Design Token）

```
環境色（低飽和）：
- taisho_midnight: #1a1a2e  (深紫夜空)
- taisho_mist: #16213e      (暗藍霧氣)
- taisho_twilight: #4a4a6a  (灰紫過渡)
- taisho_lamplight: #e09f3e (暖橙窗光)
```

### 構圖原則

1. **簡單有力**：每張圖只有一個明確的視覺焦點
2. **避免過多細節**：背景極簡或模糊處理
3. **適合小尺寸**：Flex Card 在手機上顯示較小，需保持辨識度
4. **高對比**：確保在小尺寸下仍能看清主體

### 角色處理

- **五官簡化**：使用輪廓或單一色塊表示，不繪製細節
- **剪影優先**：角色形態應能從剪影辨認
- **情緒透過姿態表達**：而非表情
- **例外**：最終章/告別場景可考慮加入更多細節

## Prompt Template

### 英文版（推薦使用）

```
Flat digital illustration, Hollow Knight / Alto's Odyssey aesthetic.
[Scene/character description - focus on ONE clear visual element]
Composition: Simple and bold, clear focal point, minimal background details.
Style: Geometric simplified shapes, clean angular silhouettes, flat color blocks.
Colors: Very dark desaturated palette - deep purple (#1a1a2e), muted blue (#16213e), warm amber accents (#e09f3e).
Lighting: HIGH CONTRAST - warm light source vs cold shadows.
Characters: Simplified facial features as outlines or solid color blocks only.
No gradients, no outlines, minimal details.
Aspect ratio 3:2.
```

### 中文版（Gemini 可用）

```
平面數位插畫，Hollow Knight / Alto's Odyssey 美學風格。
[場景/角色描述 - 聚焦於一個明確的視覺元素]
構圖：簡單有力、視覺焦點明確、背景極簡。
風格：幾何簡化造型、乾淨稜角剪影、平面色塊。
色彩：非常暗且低飽和的調色盤 - 深紫(#1a1a2e)、暗藍(#16213e)、暖琥珀點綴(#e09f3e)。
光影：高對比 - 暖光源 vs 冷色陰影。
角色：五官簡化為輪廓或單一色塊。
無漸層、無輪廓線、極簡細節。
比例 3:2。
```

### 場景特定提示詞範例

#### 範例 1：深夜閣樓送茶

```
Flat digital illustration, Hollow Knight / Alto's Odyssey aesthetic.
A small girl silhouette holding a glowing tea cup, standing beside a hunched figure at a sewing machine. 
Attic setting at night, single warm lamp as light source.
Composition: Simple and bold, the glowing tea cup is the focal point.
Style: Geometric simplified shapes, clean angular silhouettes, flat color blocks.
Colors: Very dark purple background, warm amber glow from tea cup and lamp.
Lighting: HIGH CONTRAST - warm lamp vs dark attic.
Characters: Simplified as silhouettes, no facial details.
Aspect ratio 3:2.
```

#### 範例 2：空蕩的工房

```
Flat digital illustration, Hollow Knight / Alto's Odyssey aesthetic.
An elderly man silhouette standing alone in an empty tailor workshop, looking confused and lost.
A distant doorway with cold blue light as the only light source.
Composition: Simple and bold, the isolated figure is the focal point.
Style: Geometric simplified shapes, clean angular silhouettes, flat color blocks.
Colors: Very dark desaturated palette, cold blue doorway light.
Lighting: HIGH CONTRAST - cold distant light vs dark workshop.
Characters: Hunched posture showing confusion, no facial details.
Aspect ratio 3:2.
```

## Naming Convention

### 檔名格式

```
[day]_[phase]_[scene_description].png
```

### 命名元素

| 元素 | 說明 | 範例 |
|------|------|------|
| `[day]` | 遊戲天數或特殊階段 | `opening`, `day1`, `day2`, `day3`, `ending` |
| `[phase]` | 遊戲階段 | `night`, `memory`, `cooking`, `after` |
| `[scene_description]` | 場景描述（snake_case） | `black_cat_hero`, `old_man_enters`, `attic_tea` |

### 已存在的檔案

| 檔名 | 場景 | 用途 |
|------|------|------|
| `opening_black_cat_hero.png` | 開場黑貓 | `getOpening()` |
| `day1_night_old_man_enters.png` | Day1 老人進場 | `getDay1NightStart()` |
| `day1_memory_attic_tea.png` | 深夜閣樓送茶 | `getDay1CookingMemoryCard()` |
| `day1_memory_empty_workshop.png` | 空蕩的工房 | `getDay1SoupMemoryCard()` |

### 待製作的檔案

| 建議檔名 | 場景 | 優先級 |
|----------|------|--------|
| `day2_memory_last_stitch.png` | 閣樓/最後一針 | P1 |
| `day2_memory_snow.png` | 雪中 | P1 |
| `day2_memory_translator.png` | 雪子陪伴 | P2 |
| `day2_memory_honey_daughter.png` | 便當太甜 | P2 |

## Code Integration

### 整合模式

將 Flex Card 中的 emoji/text 元件替換為 image 元件：

```javascript
// 修改前：emoji 文字
{
  type: "text",
  text: "🐈‍⬛",
  size: "5xl",
  align: "center"
},
{
  type: "separator",
  margin: "lg"
},

// 修改後：image 元件（移除 separator）
{
  type: "image",
  url: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/[filename].png",
  size: "full",
  aspectRatio: "3:2",
  aspectMode: "cover"
},
```

### URL 格式

GitHub LFS 圖片的 URL 格式：

```
https://media.githubusercontent.com/media/[username]/[repo]/refs/heads/[branch]/[path-encoded]/[filename].png
```

實際範例：
```
https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/opening_black_cat_hero.png
```

### 圖片屬性設定

| 屬性 | 值 | 說明 |
|------|------|------|
| `size` | `"full"` | 使用完整寬度 |
| `aspectRatio` | `"3:2"` | 標準橫向比例 |
| `aspectMode` | `"cover"` | 填滿並裁切 |

## Workflow

### 完整流程

```
1. 確認場景需求
   ↓
2. 使用提示詞模板生成圖片
   ↓
3. 依命名規則儲存到 04-資源素材/圖片/遊戲素材/
   ↓
4. Git add + commit + push（會透過 LFS 上傳）
   ↓
5. 取得 GitHub LFS URL
   ↓
6. 修改對應函數的 Flex Card
   ↓
7. 測試 LINE 顯示效果
```

### 提示詞調整技巧

1. **太亮/太飽和**：加強 "very dark desaturated" 和 "HIGH CONTRAST"
2. **細節太多**：加強 "minimal background details" 和 "flat color blocks"
3. **五官太清楚**：加強 "silhouettes" 和 "no facial details"
4. **構圖太複雜**：加強 "ONE clear visual element" 和 "clear focal point"

## Dependencies

### 必須的文件
- `04-資源素材/靈魂食堂_美術風格分析報告.md` - 風格規範文件

### 必須的工具
- 圖片生成工具（Gemini / Midjourney / DALL-E）
- Git LFS（用於大型圖片版本控制）

### 相關 Skills
- `obsidian-markdown` - Markdown 文件編輯

## Notes

### 重要提醒

1. **不要附參考圖給 Gemini**：Gemini 傾向直接修改參考圖而非提取風格
2. **使用英文提示詞**：英文提示詞效果較穩定
3. **測試多次**：AI 生成有隨機性，可能需要多次嘗試
4. **保持一致性**：參考現有圖片風格

### 常見問題

**Q1：圖片看起來不夠統一怎麼辦？**
A：嚴格使用提示詞模板，特別是色彩和風格描述部分。

**Q2：Gemini 生成的圖太亮了怎麼辦？**
A：加強 "very dark" 和 "desaturated" 的描述，或明確指定色碼。

**Q3：圖片在 Flex Card 上看不清楚怎麼辦？**
A：確保構圖簡單、焦點明確、對比夠高。

**Q4：角色五官太細節了怎麼辦？**
A：明確加入 "silhouettes only" 或 "no facial features"。

## Version History

- **1.0.0** (2026-02-01)：初版 Skill 建立
  - 定義風格規範
  - 建立提示詞模板
  - 定義檔名命名規則
  - 定義程式碼整合模式
