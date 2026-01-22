# Guest 1 劇本：失憶老裁縫 Mr. Needle

> **劇本版本**: V4.0  
> **建立日期**: 2026-01-17  
> **角色代號**: `guest1`  
> **參考企劃**: [[靈魂食堂：最終開發執行企劃書#Guest 1 - 失憶老裁縫 Mr. Needle]]

---

## 📋 角色檔案

### 基本資訊
- **靈魂編號**: `guest1`
- **初始顯示名稱**: "??? 號靈魂"
- **真實姓名**: 田中太郎 (Day 2 揭露)
- **生前職業**: 一流西裝裁縫
- **死因**: 阿茲海默症引發的低溫症
- **年齡**: 78 歲

### 核心創傷
**表層認知**: 誤以為自己一事無成,在雪山中凍死  
**真實創傷**: 忘記自己正在為女兒縫製婚紗,死前未能完成最後一針

### 五味診斷
- **主要需求**: 鹹 (Water/腎) - 喚醒深層記憶
- **輔助需求**: 甜 (Earth/脾) - 撫慰寒冷與恐懼
- **禁忌**: 辣 (Metal/肺) - 會加劇悲傷與痛苦

### 關鍵標籤
- `cold` - 寒冷 (死亡時的感受)
- `needle` - 針 (職業與記憶的錨點)
- `warmth` - 溫暖 (治療的開始)
- `salty` - 鹹 (喚醒記憶的關鍵)
- `daughter` - 女兒 (核心執念)
- `wedding` - 婚禮 (未完成的使命)

---

## 📝 dialogueLibrary 填充表

### 使用說明
以下內容請直接複製到 Google Sheets 的 `dialogueLibrary` 分頁。

### 欄位結構
| A: key | B: content | C: required_tags | D: unlock_tags | E: emotion |
|--------|-----------|------------------|----------------|-----------|

---

### Day 1: 誘捕 (The Lure) - 感官探索

#### 1.1 進場對話

```csv
guest1_day1_entry,"冷...好冷。\n\n這裡也是雪山嗎?\n我的手...我的手動不了了。\n\n給我一點...熱的東西。\n也許...酒？",[],"[""cold""]",sad
```

#### 1.2 行動回應：熱茶 (正確選擇)

```csv
guest1_day1_tea,"（接過茶杯，雙手顫抖）\n\n...這個溫度...\n好像在哪裡感受過。\n\n但...在哪裡？","[""warmth""]","[""memory_tea""]",nostalgic
```

#### 1.3 餵食回應：鹹味 (正確診斷)

```csv
guest1_day1_feed_salty,"（慢慢喝下湯）\n\n這味道...\n像海。\n不，像眼淚。\n熱的眼淚。\n\n我的手...感覺到了一根針。\n銀色的針。","[""salty""]","[""needle""]",confused
```

#### 1.4 餵食回應：辣味 (錯誤診斷)

```csv
guest1_day1_feed_spicy,"（猛烈咳嗽）\n\n太...太刺激了！\n\n我的喉嚨...像在燃燒...\n手更抖了...拿不穩...","[""spicy""]",[],distressed
```

#### 1.5 餵食回應：甜味 (部分正確)

```csv
guest1_day1_feed_sweet,"（緩慢吃下）\n\n溫暖...但是...\n\n還缺少什麼。\n像是...記憶中有個洞。","[""sweet""]",[],neutral
```

#### 1.6 預設回應

```csv
guest1_day1_default,"（靈魂裹緊破舊的大衣）\n\n...我在等什麼？\n已經不記得了。",[],[],confused
```

---

### Day 2: 偵訊 (The Feast) - 記憶考古

#### 2.1 進場對話（已收集 warmth + salty）

```csv
guest1_day2_entry,"（眼神比昨天聚焦）\n\n我記得那根針。\n銀色的，很亮。\n\n但我是在縫什麼？\n黑色的壽衣嗎？\n還是...白色的雪？","[""warmth"",""salty""]",[],focused
```

#### 2.2 詢問回應：那是給誰的？

```csv
guest1_day2_inquiry_who,"（沉默了很久）\n\n給...一個很重要的人。\n\n她會笑。\n笑起來像...【蜜糖】。\n\n對，就是那個味道。","[""needle""]","[""daughter"",""honey""]",warm
```

#### 2.3 記憶解鎖：婚紗的真相

```csv
guest1_day2_memory_unlock,"（突然抬頭，眼中閃過光芒）\n\n不是壽衣！\n是婚紗！\n\n我在縫婚紗！\n白色的...純白的婚紗...\n\n最後一針...我縫到哪裡了？","[""daughter"",""warmth"",""salty""]","[""wedding""]",revelation
```

#### 2.4 餵食回應：蜜汁料理（組合甜+鹹）

```csv
guest1_day2_feed_honey,"（咬下第一口，淚水滑落）\n\n這味道...\n又甜又鹹。\n\n像那孩子的笑，\n也像我送她出嫁時的淚。\n\n我...我想起來了。","[""sweet"",""salty"",""daughter""]","[""memory_complete""]",cathartic
```

#### 2.5 解鎖料理通知

```csv
guest1_day2_recipe_unlock,"主廚...\n\n我知道我需要什麼了。\n\n一碗【蜜汁炙燒鹹魚】。\n這是我女兒小時候最愛的...\n也是我教她的第一道菜。","[""memory_complete""]",[],hopeful
```

**系統動作**: 此時 `unlockedRecipe` 寫入 `"honey_salty_fish"`

---

### Day 3: 赦免 (The Absolution) - 超渡儀式

#### 3.1 進場對話

```csv
guest1_day3_entry,"（形象從灰暗變得清晰）\n\n主廚。\n謝謝你讓我想起來。\n\n我的手不抖了。\n我可以...完成最後一針了嗎？",[],[]，peaceful
```

#### 3.2 烹飪過程對話

```csv
guest1_day3_cooking,"（看著料理在火上慢燉）\n\n這香味...\n就像那天的閣樓。\n\n我記得窗外的陽光，\n和縫紉機的聲音。\n\n一針，一針，\n為了她的幸福。","[""wedding""]",[],nostalgic
```

#### 3.3 上菜反應

```csv
guest1_day3_dish_served,"（用顫抖的手接過碗）\n\n這就是了。\n\n（吃下第一口）\n\n...對，就是這個味道。\n\n（畫面閃回：閣樓、婚紗、最後一針）\n\n我縫好了。\n最後一針，我縫好了。",[],[],relieved
```

#### 3.4 告別對話（完美結局）

```csv
guest1_farewell_perfect,"主廚，謝謝你。\n\n我想起來了。\n婚紗，我縫好了。\n雖然我沒能親手交給她，\n但我把它藏在了老家的閣樓裡。\n\n她會找到的，對吧？\n\n（微笑）\n\n是時候離開了。\n再見...我的朋友。","[""memory_complete"",""wedding""]",[],peaceful
```

**系統動作**: 
- 播放粒子特效動畫（靈魂化為銀色光點）
- 吧台留下遺物：【銀頂針】
- 寫入 `heirlooms` Sheet
- 更新 `completedGuests` 加入 `"guest1"`

#### 3.5 告別對話（普通結局）

```csv
guest1_farewell_normal,"雖然...記憶還有些模糊，\n但我知道我曾經愛過某個人。\n\n那就足夠了。\n\n謝謝你的料理。\n\n（身影漸漸透明）\n\n再見。","[""memory_complete""]",[],bittersweet
```

**系統動作**:
- 普通告別動畫
- 無遺物留下
- 更新 `completedGuests`

#### 3.6 告別對話（失敗結局 - 未解鎖記憶）

```csv
guest1_farewell_failed,"（搖搖頭）\n\n我...還是想不起來。\n\n但謝謝你願意陪我。\n\n也許...再多給我一點時間？",[],[],sad
```

**系統動作**: 
- 不移除 guest1，允許重試 Day 3
- 提示玩家「也許需要重新審視線索」

---

## 🎨 Flex Message 模板

### 3.1 人物卡（Day 1 進場）

```json
{
  "type": "bubble",
  "hero": {
    "type": "image",
    "url": "https://placeholder.com/guest1_silhouette.png",
    "size": "full",
    "aspectRatio": "20:13",
    "aspectMode": "cover"
  },
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "text",
        "text": "??? 號靈魂",
        "weight": "bold",
        "size": "xl",
        "color": "#CCCCCC"
      },
      {
        "type": "text",
        "text": "一位裹著破舊大衣的老人，\n雙手顫抖，眼神迷茫。",
        "size": "sm",
        "wrap": true,
        "color": "#999999",
        "margin": "md"
      },
      {
        "type": "separator",
        "margin": "xl"
      },
      {
        "type": "box",
        "layout": "vertical",
        "margin": "lg",
        "spacing": "sm",
        "contents": [
          {
            "type": "text",
            "text": "初步診斷：",
            "color": "#AAAAAA",
            "size": "sm"
          },
          {
            "type": "text",
            "text": "• 失溫狀態\n• 記憶混亂\n• 職業相關創傷？",
            "wrap": true,
            "color": "#666666",
            "size": "xs",
            "margin": "md"
          }
        ]
      }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "spacing": "sm",
    "contents": [
      {
        "type": "button",
        "style": "primary",
        "action": {
          "type": "message",
          "label": "給他熱茶",
          "text": "[行動-熱茶]"
        },
        "color": "#C19A6B"
      },
      {
        "type": "button",
        "action": {
          "type": "message",
          "label": "餵食鹹味",
          "text": "[餵食-鹹]"
        }
      }
    ]
  }
}
```

### 3.2 記憶劇場（Day 2 解鎖）

```json
{
  "type": "carousel",
  "contents": [
    {
      "type": "bubble",
      "hero": {
        "type": "image",
        "url": "https://placeholder.com/memory_attic.png",
        "size": "full",
        "aspectRatio": "4:3",
        "aspectMode": "cover"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "【記憶 1/3】",
            "size": "xs",
            "color": "#999999"
          },
          {
            "type": "text",
            "text": "閣樓裡的縫紉機",
            "weight": "bold",
            "size": "lg",
            "margin": "sm"
          },
          {
            "type": "text",
            "text": "陽光灑在白色的布料上。\n那是她選的布。\n我要用最細的針腳。",
            "wrap": true,
            "size": "sm",
            "margin": "md",
            "color": "#666666"
          }
        ]
      }
    },
    {
      "type": "bubble",
      "hero": {
        "type": "image",
        "url": "https://placeholder.com/memory_daughter.png",
        "size": "full",
        "aspectRatio": "4:3",
        "aspectMode": "cover"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "【記憶 2/3】",
            "size": "xs",
            "color": "#999999"
          },
          {
            "type": "text",
            "text": "女兒試穿的笑容",
            "weight": "bold",
            "size": "lg",
            "margin": "sm"
          },
          {
            "type": "text",
            "text": "她轉了一圈，\n笑起來像蜜糖。\n她說：「爸爸最厲害！」",
            "wrap": true,
            "size": "sm",
            "margin": "md",
            "color": "#666666"
          }
        ]
      }
    },
    {
      "type": "bubble",
      "hero": {
        "type": "image",
        "url": "https://placeholder.com/memory_needle.png",
        "size": "full",
        "aspectRatio": "4:3",
        "aspectMode": "cover"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "【記憶 3/3】",
            "size": "xs",
            "color": "#999999"
          },
          {
            "type": "text",
            "text": "最後一針",
            "weight": "bold",
            "size": "lg",
            "margin": "sm"
          },
          {
            "type": "text",
            "text": "針穿過布料的瞬間。\n銀色的光。\n\n然後...我忘記了。",
            "wrap": true,
            "size": "sm",
            "margin": "md",
            "color": "#666666"
          }
        ]
      }
    }
  ]
}
```

### 3.3 遺物卡（Day 3 超渡後）

```json
{
  "type": "bubble",
  "hero": {
    "type": "image",
    "url": "https://placeholder.com/heirloom_thimble.png",
    "size": "full",
    "aspectRatio": "1:1",
    "aspectMode": "cover"
  },
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "text",
        "text": "🕯️ 遺物獲得",
        "size": "xs",
        "color": "#999999"
      },
      {
        "type": "text",
        "text": "【銀頂針】",
        "weight": "bold",
        "size": "xl",
        "margin": "sm",
        "color": "#C0C0C0"
      },
      {
        "type": "separator",
        "margin": "lg"
      },
      {
        "type": "text",
        "text": "磨損的銀頂針，\n指尖留有針孔的溫度。\n\n背面刻著：\nFor my dearest.",
        "wrap": true,
        "size": "sm",
        "margin": "lg",
        "color": "#666666"
      },
      {
        "type": "box",
        "layout": "baseline",
        "margin": "xl",
        "contents": [
          {
            "type": "text",
            "text": "—— 田中太郎",
            "size": "xs",
            "color": "#999999",
            "align": "end"
          }
        ]
      }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "button",
        "style": "link",
        "action": {
          "type": "uri",
          "label": "分享遺物",
          "uri": "https://liff.line.me/LIFF_ID"
        }
      }
    ]
  }
}
```

---

## 🎮 測試案例

### 測試案例 1：完美路線

```
Day 1:
[行動-熱茶] → 獲得 "warmth"
[餵食-鹹] → 獲得 "salty", "needle"
collectedTags: ["warmth", "salty", "needle"]

Day 2:
系統檢測到 ["warmth", "salty"] → 自動觸發記憶解鎖
[詢問-那是給誰的？] → 獲得 "daughter", "honey"
[餵食-甜] → 獲得 "sweet"
[記憶劇場播放] → 獲得 "wedding", "memory_complete"
unlockedRecipe: "honey_salty_fish"

Day 3:
[烹飪-開始] → 成功烹飪
[告別] → 完美結局 + 遺物
```

### 測試案例 2：失敗路線

```
Day 1:
[行動-熱茶] → 獲得 "warmth"
[餵食-辣] → 錯誤，靈魂痛苦
collectedTags: ["warmth", "spicy"]

Day 2:
標籤不足，無法解鎖記憶 → 提示玩家
unlockedRecipe: "" (空)

Day 3:
無法烹飪 → 提示「需要更多線索」
允許返回 Day 1 重試
```

---

## 📊 資料庫填充 SQL 格式

### recipeDatabase Sheet

| A: recipeID | B: displayName | C: physical_ingredients | D: abstract_ingredients | E: successText |
|-------------|----------------|------------------------|------------------------|----------------|
| honey_salty_fish | 【蜜汁炙燒鹹魚】 | {"fish":1} | {"sweet":1,"salty":1} | 湯汁轉為琥珀色，魚肉在蜜糖與海鹽的交織中散發出記憶的光澤... |

### guestConfig Sheet

| A: guestID | B: displayName | C: realName | D: avatar_url | E: backstory | F: targetRecipe | G: difficulty |
|-----------|---------------|-------------|---------------|--------------|----------------|---------------|
| guest1 | ??? 號靈魂 | 田中太郎 | https://... | 因失智忘記女兒婚紗而困於時間的老裁縫 | honey_salty_fish | 1 |

---

## ✅ 完成檢核表

- [x] 撰寫角色檔案與五味診斷
- [x] 建立 Day 1-3 完整對話樹
- [x] 設計正確路線與錯誤分支
- [x] 建立 Flex Message 模板
- [x] 定義測試案例
- [x] 填入 Google Sheets
- [x] 部署程式碼並測試成功
- [ ] 進行「人肉 Bot」封閉測試（5-10 人）
- [ ] 根據反饋迭代劇本

---

## 📋 如何將劇本填入 Google Sheets

### 快速操作步驟

1. **開啟 Google Sheets** 的 `dialogueLibrary` 分頁
2. **確認標題行**（第 1 行）：`key | content | required_tags | unlock_tags | emotion`
3. **從第 2 行開始**逐行複製上方表格內容，或使用以下 TSV 批量貼上

### TSV 格式（全選複製後在 A1 貼上）

```tsv
key	content	required_tags	unlock_tags	emotion
guest1_day1_entry	冷...好冷。\n\n這裡也是雪山嗎?\n我的手...我的手動不了了。\n\n給我一點...熱的東西。\n也許...酒？	[]	["cold"]	sad
guest1_day1_tea	（接過茶杯，雙手顫抖）\n\n...這個溫度...\n好像在哪裡感受過。\n\n但...在哪裡？	["warmth"]	["memory_tea"]	nostalgic
guest1_day1_feed_salty	（慢慢喝下湯）\n\n這味道...\n像海。\n不，像眼淚。\n熱的眼淚。\n\n我的手...感覺到了一根針。\n銀色的針。	["salty"]	["needle"]	confused
guest1_day1_feed_spicy	（猛烈咳嗽）\n\n太...太刺激了！\n\n我的喉嚨...像在燃燒...\n手更抖了...拿不穩...	["spicy"]	[]	distressed
guest1_day1_feed_sweet	（緩慢吃下）\n\n溫暖...但是...\n\n還缺少什麼。\n像是...記憶中有個洞。	["sweet"]	[]	neutral
guest1_day1_default	（靈魂裹緊破舊的大衣）\n\n...我在等什麼？\n已經不記得了。	[]	[]	confused
guest1_day2_entry	（眼神比昨天聚焦）\n\n我記得那根針。\n銀色的，很亮。\n\n但我是在縫什麼？\n黑色的壽衣嗎？\n還是...白色的雪？	["warmth","salty"]	[]	focused
guest1_day2_inquiry_who	（沉默了很久）\n\n給...一個很重要的人。\n\n她會笑。\n笑起來像...【蜜糖】。\n\n對，就是那個味道。	["needle"]	["daughter","honey"]	warm
guest1_day2_memory_unlock	（突然抬頭，眼中閃過光芒）\n\n不是壽衣！\n是婚紗！\n\n我在縫婚紗！\n白色的...純白的婚紗...\n\n最後一針...我縫到哪裡了？	["daughter","warmth","salty"]	["wedding"]	revelation
guest1_day2_feed_honey	（咬下第一口，淚水滑落）\n\n這味道...\n又甜又鹹。\n\n像那孩子的笑，\n也像我送她出嫁時的淚。\n\n我...我想起來了。	["sweet","salty","daughter"]	["memory_complete"]	cathartic
guest1_day2_recipe_unlock	主廚...\n\n我知道我需要什麼了。\n\n一碗【蜜汁炙燒鹹魚】。\n這是我女兒小時候最愛的...\n也是我教她的第一道菜。	["memory_complete"]	[]	hopeful
guest1_day3_entry	（形象從灰暗變得清晰）\n\n主廚。\n謝謝你讓我想起來。\n\n我的手不抖了。\n我可以...完成最後一針了嗎？	[]	[]	peaceful
guest1_day3_cooking	（看著料理在火上慢燉）\n\n這香味...\n就像那天的閣樓。\n\n我記得窗外的陽光，\n和縫紉機的聲音。\n\n一針，一針，\n為了她的幸福。	["wedding"]	[]	nostalgic
guest1_day3_dish_served	（用顫抖的手接過碗）\n\n這就是了。\n\n（吃下第一口）\n\n...對，就是這個味道。\n\n（畫面閃回：閣樓、婚紗、最後一針）\n\n我縫好了。\n最後一針，我縫好了。	[]	[]	relieved
guest1_farewell_perfect	主廚，謝謝你。\n\n我想起來了。\n婚紗，我縫好了。\n雖然我沒能親手交給她，\n但我把它藏在了老家的閣樓裡。\n\n她會找到的，對吧？\n\n（微笑）\n\n是時候離開了。\n再見...我的朋友。	["memory_complete","wedding"]	[]	peaceful
guest1_farewell_normal	雖然...記憶還有些模糊，\n但我知道我曾經愛過某個人。\n\n那就足夠了。\n\n謝謝你的料理。\n\n（身影漸漸透明）\n\n再見。	["memory_complete"]	[]	bittersweet
guest1_farewell_failed	（搖搖頭）\n\n我...還是想不起來。\n\n但謝謝你願意陪我。\n\n也許...再多給我一點時間？	[]	[]	sad
```

### 驗證清單

- [x] `dialogueLibrary` 分頁有 18 行資料（含標題共 19 行）
- [x] A 欄的 key 沒有重複
- [x] B 欄的對話內容完整（有 `\n` 換行符號）
- [x] C 欄和 D 欄的 JSON 格式正確
- [x] E 欄的情緒標籤都是英文小寫

---

**劇本狀態**: ✅ 已部署測試成功  
**最後更新**: 2026-01-17  
**維護者**: 企劃 + 開發  
**下次任務**: 進行封閉測試並收集反饋

