---
description: 靈魂食堂 - Dialogue 擴增劇本模組（試算表驅動對話、換行與分則）
tags: [dialogue, gas, line-bot, spreadsheet, script-expansion]
version: 1.0.0
---

# Dialogue 擴增劇本模組

## When to Use

- 要從試算表讀取擴增劇本、插入過渡段或支線對話時
- 需要將對話內容與程式碼分離、方便企劃編輯時
- 接續靈魂食堂劇本擴充時，可快速掛接此模組

## 模組概要

- **資料來源**：與 userState 同試算表，新增 `dialogue` 工作表
- **結構**：節點式（block_id + seq），每節點含 system_msg、quick_reply、next_seq
- **容錯**：dialogue 不存在或無資料時，完全回退硬編碼流程

## 試算表欄位

| 欄位 | 說明 |
|------|------|
| block_id | 對話區塊識別（如 day1_to_day2_transition） |
| seq | 節點序號（1, 2, 3...） |
| system_msg | 系統訊息，支援換行與分則（見下） |
| quick_reply | `label\|text`，多選用 `;` 分隔 |
| next_seq | 下一節點，多選時用 `,` 對應（如 `2,3`） |
| note | 企劃備註 |

## 換行方式（system_msg）

- **同一則內換行**：輸入 `\n`（反斜線＋n）
- **編碼問題**：Excel 中反斜線在 LINE 可能顯示為 `¥`；程式會同時處理 `\n`、`¥n`、`\u00A5n`，皆轉成實際換行
- **範例**：`【老人】\n窗外什麼都沒有。只有雨。` → 顯示為兩行

## 分訊息方式（做法 A）

- **同一節點拆成多則**：在 system_msg 內用 `|||` 分隔
- **行為**：拆成多則 LINE 訊息依序送出，**最後一則**帶 quickReply
- **範例**：`這裡...真的是食堂嗎?|||我總覺得...這裡有點奇怪。` → 送出兩則訊息，第二則帶 quickReply

## quick_reply 與 next_seq

- **格式**：`label|text`，多選 `label1|text1;label2|text2`
- **next_seq**：單值 `2` 表示全部導向 seq 2；多值 `2,3` 表示第一選項→2、第二選項→3
- **「明天繼續」**：text 為 `【明天繼續】` / `明天繼續` / `明天` 時，程式直接推進（不需 next_seq）

## 整合流程（掛接新 block）

1. 在 dialogue 工作表新增 block（如 `day2_xxx_expand`）
2. 對應 handler 中：送出前一則時若有 dialogue block，改 quickReply 為 seq 1 選項，並記錄 progress（如 `transition_expand_1`）
3. 收到玩家回覆時：若在該 block 進行中，依 userText 匹配 qr_text，取得 next_seq 或 advance 動作
4. 用 `dialogueNodeToMessage(node)` 將節點轉成 LINE 訊息（單則或陣列），`replyMessage` 支援陣列

## 參考文件

- `01-開發實驗/程式碼/對話表_佈署說明.md` — 完整佈署步驟
- `01-開發實驗/程式碼/dialogue_第一版範例.csv` — CSV 範例
