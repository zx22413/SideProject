// ============================================================
// 靈魂食堂 - 田中太郎重構版（神秘感優先）
// 版本: 2.0
// 創建日期: 2026-01-20
// 基於: 畫鬼腳 MVP v1.0
// ============================================================
// 
// 新增功能:
// - 時段系統（Night→Day→Cooking→After Hours）
// - 記憶即食材系統（關鍵詞捕捉→食材解鎖）
// - 話題選單系統（類似紅弦俱樂部）
// - 黑貓角色（老油條店長貓）
// - 完整的田中太郎故事線
//
// Google Sheets 需求:
// - Sheet 名稱: "userState"
// - 欄位: A=userId | B=currentDay | C=phase | D=collectedMemories | E=topicsDone | F=lastActive
// ============================================================

// ============================================================
// 配置區
// ============================================================
const SPREADSHEET_ID = '1204bJ1DWPWidrYCJlfXF9rnmyyS8vwqFWI9YZuItsoc';
const CONFIG = {
  LINE_CHANNEL_ACCESS_TOKEN: "61EF5KOcntCRoS2JtzTVYcCV4b8abGo5mWvw6OEDXDqMHHvHVLnkmzBNBMG6N8vr0UySJmIwYHoqoKP2zV8qL+vauBSqixT3v9QdfubKhOnqgeVWfIbOPheM8Gic8hj1yxV+DiBQYaN64tVnBkh2nQdB04t89/1O/w1cDnyilFU=",
  SHEET_NAME: "userStateTanaka",
  DEBUG_MODE: true
};

// 時段定義
const PHASE = {
  NIGHT: "night",      // 夜晚：觀察階段
  DAY: "day",          // 白天：對話階段（話題選擇）
  COOKING: "cooking",  // 傍晚：料理階段
  AFTER: "after"       // 深夜：揭露階段
};

// ============================================================
// LINE Webhook 入口
// ============================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (!data.events || data.events.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({status: "ok"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const event = data.events[0];
    
    // ✨ 立即顯示 Loading Animation（在任何處理之前）
    // 這樣用戶按下按鈕後會立即看到 Loading 動畫
    if (event.source && event.source.userId) {
      showLoadingAnimation(event.source.userId, 10);
    }
    
    if (CONFIG.DEBUG_MODE) {
      Logger.log("收到事件: " + JSON.stringify(event));
    }
    
    // 處理文字訊息
    if (event.type === "message" && event.message.type === "text") {
      handleMessage(event);
    }
    
    // 處理 Postback（按鈕點擊）
    if (event.type === "postback") {
      handlePostback(event);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: "ok"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log("錯誤: " + error);
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// GET 請求處理（供測試用）
// ============================================================
function doGet(e) {
  return ContentService.createTextOutput("靈魂食堂 - 田中太郎版 is running! ✅")
    .setMimeType(ContentService.MimeType.TEXT);
}

// ============================================================
// 訊息處理主邏輯
// ============================================================
function handleMessage(event) {
  const userId = event.source.userId;
  const userText = event.message.text.trim();
  
  // 獲取用戶狀態
  let state = getUserState(userId);
  
  // 特殊指令
  if (userText === "重新開始" || userText === "restart") {
    resetUser(userId);
    replyMessage(event.replyToken, getOpening());
    return;
  }
  
  if (userText === "狀態" || userText === "status") {
    if (!state) {
      replyMessage(event.replyToken, {type: "text", text: "尚未開始遊戲"});
      return;
    }
    const statusMsg = `Day ${state.currentDay} - ${state.phase}\n收集的記憶: ${state.collectedMemories.length}個\n已完成話題: ${state.topicsDone.length}個`;
    replyMessage(event.replyToken, {type: "text", text: statusMsg});
    return;
  }
  
  // 新用戶 - 開始遊戲
  if (!state) {
    initializeUser(userId);
    replyMessage(event.replyToken, getOpening());
    return;
  }
  
  // 根據當前天數和階段處理
  routeByPhase(event, userId, state, userText);
}

// ============================================================
// 階段路由器
// ============================================================
function routeByPhase(event, userId, state, userText) {
  const day = state.currentDay;
  const phase = state.phase;
  
  if (CONFIG.DEBUG_MODE) {
    Logger.log(`Day ${day}, Phase: ${phase}, Text: ${userText}`);
  }
  
  // Day 1 路由
  if (day === 1) {
    if (phase === PHASE.NIGHT) {
      handleDay1Night(event, userId, state, userText);
    } else if (phase === PHASE.DAY) {
      handleDay1Day(event, userId, state, userText);
    } else if (phase === PHASE.COOKING) {
      handleDay1Cooking(event, userId, state, userText);
    } else if (phase === PHASE.AFTER) {
      handleDay1After(event, userId, state, userText);
    }
  }
  // Day 2 路由
  else if (day === 2) {
    if (phase === PHASE.DAY) {
      handleDay2Day(event, userId, state, userText);
    } else if (phase === PHASE.COOKING) {
      handleDay2Cooking(event, userId, state, userText);
    } else if (phase === PHASE.AFTER) {
      handleDay2After(event, userId, state, userText);
    }
  }
  // Day 3 路由
  else if (day === 3) {
    if (phase === PHASE.COOKING) {
      handleDay3Cooking(event, userId, state, userText);
    } else if (phase === PHASE.AFTER) {
      handleDay3Ending(event, userId, state, userText);
    }
  }
}

// ============================================================
// Postback 處理
// ============================================================
function handlePostback(event) {
  const data = event.postback.data;
  const userId = event.source.userId;
  const state = getUserState(userId);
  
  if (data === "start_game") {
    resetUser(userId);
    replyMessage(event.replyToken, getOpening());
    return;
  }
  
  // 處理話題選擇的 postback
  if (data.startsWith("topic_")) {
    const topic = data.replace("topic_", "");
    
    // Day 1 話題
    if (state.currentDay === 1) {
      handleTopicChoice(event, userId, state, topic);
    }
    // Day 2 話題
    else if (state.currentDay === 2) {
      handleDay2TopicChoice(event, userId, state, topic);
    }
    return;
  }
  
  // 處理階段推進（帶狀態檢查，防止重複點擊舊按鈕）
  if (data.startsWith("next_phase")) {
    // 解析格式：next_phase:day:phase 或舊版 next_phase
    const parts = data.split(":");
    
    if (parts.length === 3) {
      // 新格式：next_phase:day:phase
      const buttonDay = parseInt(parts[1]);
      const buttonPhase = parts[2];
      
      // 檢查按鈕是否過期（當前狀態已經不是按鈕創建時的狀態）
      if (state && (state.currentDay !== buttonDay || state.phase !== buttonPhase)) {
        // 按鈕已過期，給予友善提示
        replyMessage(event.replyToken, {
          type: "text",
          text: "⏰ 這個選項已經過期了喔～\n\n故事已經往前推進，請繼續目前的劇情吧！"
        });
        return;
      }
    }
    
    // 按鈕有效，執行階段推進
    advancePhase(event, userId, state);
    return;
  }
}

// ============================================================
// 用戶狀態管理
// ============================================================
function getUserState(userId) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        return {
          userId: data[i][0],
          currentDay: data[i][1] || 1,
          phase: data[i][2] || PHASE.NIGHT,
          collectedMemories: JSON.parse(data[i][3] || "[]"),
          topicsDone: JSON.parse(data[i][4] || "[]"),
          lastActive: data[i][5] || ""
        };
      }
    }
    return null;
  } catch (error) {
    Logger.log("getUserState 錯誤: " + error);
    return null;
  }
}

function updateUserState(userId, updates) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        if (updates.currentDay !== undefined) sheet.getRange(i + 1, 2).setValue(updates.currentDay);
        if (updates.phase !== undefined) sheet.getRange(i + 1, 3).setValue(updates.phase);
        if (updates.collectedMemories !== undefined) sheet.getRange(i + 1, 4).setValue(JSON.stringify(updates.collectedMemories));
        if (updates.topicsDone !== undefined) sheet.getRange(i + 1, 5).setValue(JSON.stringify(updates.topicsDone));
        if (updates.lastActive !== undefined) sheet.getRange(i + 1, 6).setValue(updates.lastActive);
        found = true;
        break;
      }
    }
    
    if (!found) {
      sheet.appendRow([
        userId,
        updates.currentDay || 1,
        updates.phase || PHASE.NIGHT,
        JSON.stringify(updates.collectedMemories || []),
        JSON.stringify(updates.topicsDone || []),
        updates.lastActive || new Date().toISOString()
      ]);
    }
  } catch (error) {
    Logger.log("updateUserState 錯誤: " + error);
  }
}

function initializeUser(userId) {
  updateUserState(userId, {
    currentDay: 1,
    phase: PHASE.NIGHT,
    collectedMemories: [],
    topicsDone: [],
    lastActive: new Date().toISOString()
  });
}

function resetUser(userId) {
  initializeUser(userId);
}

function addMemory(userId, state, memory) {
  if (!state.collectedMemories.includes(memory)) {
    state.collectedMemories.push(memory);
    updateUserState(userId, { collectedMemories: state.collectedMemories });
  }
}

function addTopic(userId, state, topic) {
  if (!state.topicsDone.includes(topic)) {
    state.topicsDone.push(topic);
    updateUserState(userId, { topicsDone: state.topicsDone });
  }
}

function advancePhase(event, userId, state) {
  // 重新獲取最新狀態，避免連點導致的競爭條件
  const currentState = getUserState(userId);
  if (!currentState) return;
  
  let newPhase = currentState.phase;
  let newDay = currentState.currentDay;
  
  // 階段推進邏輯（只允許單步推進，避免跳躍）
  if (currentState.phase === PHASE.NIGHT) {
    newPhase = PHASE.DAY;
  } else if (currentState.phase === PHASE.DAY) {
    newPhase = PHASE.COOKING;
  } else if (currentState.phase === PHASE.COOKING) {
    newPhase = PHASE.AFTER;
  } else if (currentState.phase === PHASE.AFTER) {
    // 進入下一天
    newDay += 1;
    if (newDay <= 3) {
      newPhase = (newDay === 3) ? PHASE.COOKING : PHASE.DAY;
    }
  }
  
  // 如果 phase 沒有變化，不做任何事（避免重複處理）
  if (newPhase === currentState.phase && newDay === currentState.currentDay) {
    return;
  }
  
  updateUserState(userId, { 
    currentDay: newDay, 
    phase: newPhase,
    lastActive: new Date().toISOString()
  });
  
  // 更新本地 state 引用
  state.currentDay = newDay;
  state.phase = newPhase;
  
  showLoadingAnimation(userId, 5);
  
  if (newDay === 1 && newPhase === PHASE.DAY) {
    // Day 1 Night → Day 1 Day：加入過渡文字
    replyMessage(event.replyToken, [
      { type: "text", text: "【看向老人】\n\n他的眼神空洞，\n像是在看著很遠很遠的地方。" },
      getDay1DayShift(state)
    ]);
  } else if (newDay === 2 && newPhase === PHASE.DAY) {
    replyMessage(event.replyToken, getDay2DayShift(state));
  } else if (newDay === 3 && newPhase === PHASE.COOKING) {
    // Day 2 After → Day 3 Cooking：加入與黑貓的過渡對話
    replyMessage(event.replyToken, [
      { type: "text", text: "━━━━━━━━━━━━━━━\n\n【第三天】\n\n━━━━━━━━━━━━━━━" },
      { type: "text", text: "【黑貓跳上窗台】\n\n「今天是最後一天了。」\n\n「...你準備好了嗎？」" },
      { type: "text", text: "窗外的雨，\n似乎小了一點。\n\n空氣中瀰漫著淡淡的期待感。" },
      getDay3CookingStart(state)
    ]);
  }
}

// ============================================================
// LINE 訊息發送
// ============================================================
function replyMessage(replyToken, message) {
  const url = "https://api.line.me/v2/bot/message/reply";
  const payload = {
    replyToken: replyToken,
    messages: Array.isArray(message) ? message : [message]
  };
  
  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + CONFIG.LINE_CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify(payload)
  };
  
  try {
    UrlFetchApp.fetch(url, options);
  } catch (error) {
    Logger.log("發送訊息失敗: " + error);
  }
}

// ============================================================
// Push Message（主動發送多條訊息）
// ============================================================
function pushMessages(userId, messages) {
  const url = "https://api.line.me/v2/bot/message/push";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + CONFIG.LINE_CHANNEL_ACCESS_TOKEN
  };
  
  const payload = {
    to: userId,
    messages: Array.isArray(messages) ? messages : [messages]  // 最多 5 條
  };
  
  const options = {
    method: "post",
    headers: headers,
    payload: JSON.stringify(payload)
  };
  
  try {
    UrlFetchApp.fetch(url, options);
  } catch (error) {
    Logger.log("Push 訊息失敗: " + error);
  }
}

// ============================================================
// Loading Animation（顯示「打字中」動畫）
// ============================================================
function showLoadingAnimation(chatId, seconds = 5) {
  // LINE API 要求：loadingSeconds 必須是 5 的倍數（5, 10, 15, ..., 60）
  // 且需要 LINE 版本 13.16.0+ (手機) 或 9.1.2+ (桌面)
  
  // 確保是 5 的倍數
  let validSeconds = Math.round(seconds / 5) * 5;
  if (validSeconds < 5) validSeconds = 5;
  if (validSeconds > 60) validSeconds = 60;
  
  const url = "https://api.line.me/v2/bot/chat/loading/start";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + CONFIG.LINE_CHANNEL_ACCESS_TOKEN
  };
  
  const payload = {
    chatId: chatId,
    loadingSeconds: validSeconds
  };
  
  const options = {
    method: "post",
    headers: headers,
    payload: JSON.stringify(payload)
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    if (CONFIG.DEBUG_MODE) {
      Logger.log("Loading Animation 請求成功: " + response.getResponseCode());
    }
  } catch (error) {
    if (CONFIG.DEBUG_MODE) {
      Logger.log("Loading Animation 失敗: " + error);
    }
  }
}

// ============================================================
// 開場：極簡神秘版
// ============================================================
function getOpening() {
  return [
    {
      type: "text",
      text: "━━━━━━━━━━━━━━━\n\n雨聲。\n\n━━━━━━━━━━━━━━━"
    },
    {
      type: "text",
      text: "你睜開眼。\n\n眼前是一間老舊的食堂。\n木質吧台，生鏽的爐灶，\n窗外只有雨。\n\n你不記得自己怎麼來的。"
    },
    {
      type: "flex",
      altText: "黑貓登場",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
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
            {
              type: "box",
              layout: "vertical",
              margin: "lg",
              spacing: "md",
              contents: [
                {
                  type: "text",
                  text: "【一隻黑貓趴在吧台上】",
                  size: "sm",
                  color: "#999999",
                  wrap: true
                },
                {
                  type: "text",
                  text: "「...」",
                  wrap: true
                },
                {
                  type: "text",
                  text: "【牠睜開眼，盯著你看了一會兒】",
                  size: "sm",
                  color: "#999999",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "text",
                  text: "「哦，醒了啊。」",
                  wrap: true
                },
                {
                  type: "text",
                  text: "【黑貓打了個哈欠】",
                  size: "sm",
                  color: "#999999",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "text",
                  text: "「行吧，那就開工吧。」",
                  wrap: true
                },
                {
                  type: "text",
                  text: "「等等會有客人來。」",
                  wrap: true
                },
                {
                  type: "text",
                  text: "「煮點吃的給他們，別餓死人就好。」",
                  wrap: true
                }
              ]
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "message",
                label: "等等，這裡是...？",
                text: "這裡是...？"
              },
              style: "primary"
            }
          ]
        }
      }
    }
  ];
}

// ============================================================
// Day 1 Night Shift - 初遇
// ============================================================
function handleDay1Night(event, userId, state, userText) {
  // 回應玩家的困惑
  if (userText.includes("這裡") || userText.includes("哪裡") || userText === "這裡是...？") {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, getBlackCatResponse1());
    return;
  }
  
  // 「我是誰」- 使用更嚴格的匹配，避免誤觸發
  if (userText === "我是誰？" || userText === "我是誰") {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, getBlackCatResponse2());
    return;
  }
  
  // 客人進場
  if (userText === "等待" || userText === "明天" || userText.includes("客人")) {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, getTanakaEnter());
    return;
  }
  
  // 預設回應（避免鬼打牆）- 引導進入正確流程
  showLoadingAnimation(userId, 5);
  replyMessage(event.replyToken, [
    {
      type: "text",
      text: "【黑貓】\n「...發什麼呆？」"
    },
    {
      type: "text",
      text: "【黑貓用尾巴指向窗外】\n「問你問題呢。這裡是哪裡？你是誰？想清楚再說。」",
      quickReply: {
        items: [
          {
            type: "action",
            action: { type: "message", label: "這裡是...？", text: "這裡是...？" }
          },
          {
            type: "action",
            action: { type: "message", label: "我是誰？", text: "我是誰？" }
          }
        ]
      }
    }
  ]);
}

function getBlackCatResponse1() {
  return {
    type: "text",
    text: "【黑貓伸懶腰】\n\n「食堂啊。」\n\n「你看不出來嗎？有廚房，有桌椅，不是食堂是什麼？」",
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "message",
            label: "我是誰？",
            text: "我是誰？"
          }
        }
      ]
    }
  };
}

function getBlackCatResponse2() {
  return {
    type: "text",
    text: "【黑貓舔了舔爪子】\n\n「主廚啊。」\n\n「至少在這裡是。」\n\n【牠跳下吧台，慢悠悠走向廚房】\n\n「別問那麼多，等等就知道了。」",
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "message",
            label: "...等待",
            text: "等待"
          }
        }
      ]
    }
  };
}

function getTanakaEnter() {
  return [
    {
      type: "text",
      text: "━━━━━━━━━━━━━━━\n\n[門被推開的聲音]\n\n━━━━━━━━━━━━━━━"
    },
    {
      type: "flex",
      altText: "客人來了",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "🌧️ Night Shift 22:30",
              weight: "bold",
              size: "md",
              color: "#546E7A"
            },
            {
              type: "separator",
              margin: "md"
            },
            {
              type: "box",
              layout: "vertical",
              margin: "lg",
              spacing: "md",
              contents: [
                {
                  type: "text",
                  text: "[門被推開]",
                  size: "sm",
                  color: "#999999",
                  wrap: true
                },
                {
                  type: "text",
                  text: "風雨灌入。",
                  wrap: true
                },
                {
                  type: "text",
                  text: "一位老人踉蹌走進來，\n渾身濕透。",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "text",
                  text: "他的大衣破舊，\n雙手僵硬地彎曲著。",
                  wrap: true
                },
                {
                  type: "text",
                  text: "【老人跌坐在椅子上】",
                  size: "sm",
                  color: "#999999",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "text",
                  text: "「...冷...」",
                  wrap: true
                }
              ]
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "postback",
                label: "👁️ 觀察他",
                data: "next_phase:1:night"
              },
              style: "primary"
            }
          ]
        }
      }
    }
  ];
}

// ============================================================
// Day 1 Day Shift - 話題選擇
// ============================================================
function getDay1DayShift(state) {
  const topicsDone = state ? (state.topicsDone || []) : [];
  const buttons = [];
  
  // 你的手（推薦，完整劇情線）
  if (!topicsDone.includes("hands_part1")) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "🗨️ 你的手（推薦）",
        text: "你的手...是做什麼工作的？"
      },
      style: "primary",
      color: "#FF6B6B"
    });
  }
  
  // 你從哪裡來
  if (!topicsDone.includes("origin")) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "🗨️ 你從哪裡來",
        text: "你從哪裡來？"
      },
      style: "primary",
      color: "#4ECDC4"
    });
  }
  
  // 窗外的雨
  if (!topicsDone.includes("rain")) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "🗨️ 窗外的雨",
        text: "窗外一直在下雨..."
      },
      style: "primary",
      color: "#95A5A6"
    });
  }
  
  // 沉默陪伴
  if (!topicsDone.includes("silence")) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "🤐 沉默陪伴",
        text: "【靜靜陪伴】"
      },
      style: "link"
    });
  }
  
  // 如果已經完成至少一個話題，顯示「進入廚房」
  if (topicsDone.length > 0) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "🍳 進入廚房",
        text: "【進入廚房】"
      },
      style: "primary",
      color: "#28A745"
    });
  }
  
  return {
    type: "flex",
    altText: "Day 1 - 白天",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🌅 Day Shift 10:00",
            weight: "bold",
            size: "md",
            color: "#FF9800"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "老人坐在窗邊發呆。\n雨還在下。",
                wrap: true
              },
              {
                type: "text",
                text: "【黑貓趴在吧台上，半睡半醒】",
                size: "sm",
                color: "#999999",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: topicsDone.length > 0 ? "「還要繼續聊嗎？」" : "「去跟他聊聊，套點情報出來。」",
                wrap: true
              },
              {
                type: "separator",
                margin: "lg"
              },
              {
                type: "text",
                text: topicsDone.length > 0 ? `已收集 ${topicsDone.length} 個話題` : "你決定和他聊聊...",
                wrap: true,
                margin: "lg",
                weight: "bold",
                size: "sm",
                color: topicsDone.length > 0 ? "#FFD700" : "#000000"
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: buttons
      }
    }
  };
}

function handleDay1Day(event, userId, state, userText) {
  const topicsDone = state.topicsDone || [];
  
  // 玩家選擇「你的手」話題
  if (userText === "你的手...是做什麼工作的？") {
    showLoadingAnimation(userId, 5);
    
    // 先回覆避免 timeout
    replyMessage(event.replyToken, { type: "text", text: "..." });
    
    // 延遲後發送 Part 1
    Utilities.sleep(500);
    pushMessages(userId, getDay1TopicHandsMessages_Part1());
    
    // 記錄進度
    addTopic(userId, state, "hands_part1");
    return;
  }
  
  // 處理「繼續」→ 發送 Part 2
  if (userText === "【繼續】" && topicsDone.includes("hands_part1") && !topicsDone.includes("hands_part2")) {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, { type: "text", text: "..." });
    Utilities.sleep(500);
    pushMessages(userId, getDay1TopicHandsMessages_Part2());
    
    // 添加記憶並記錄進度
    addMemory(userId, state, "針");
    addMemory(userId, state, "縫線");
    addMemory(userId, state, "寒冷");
    addMemory(userId, state, "裁縫手藝");
    addTopic(userId, state, "hands_part2");
    return;
  }
  
  // 處理「進入廚房」（任何話題完成後都可以進入）
  if (userText === "【進入廚房】" && topicsDone.length > 0) {
    showLoadingAnimation(userId, 5);
    updateUserState(userId, { 
      phase: PHASE.COOKING,
      lastActive: new Date().toISOString()
    });
    replyMessage(event.replyToken, getDay1CookingScene(state));
    return;
  }
  
  // 處理其他話題 - 對話完後回到選擇畫面
  if (userText === "你從哪裡來？") {
    showLoadingAnimation(userId, 5);
    
    // 添加記憶
    addTopic(userId, state, "origin");
    addMemory(userId, state, "失憶");
    addMemory(userId, state, "迷茫");
    
    // 回覆對話 + 回到選擇畫面
    const updatedState = getUserState(userId); // 重新獲取更新後的狀態
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "老人：「我...不記得了...」"
      },
      {
        type: "text",
        text: "✨ 獲得記憶食材：失憶、迷茫"
      },
      getDay1DayShift(updatedState)
    ]);
    return;
  }
  
  if (userText === "窗外一直在下雨...") {
    showLoadingAnimation(userId, 5);
    
    // 添加記憶
    addTopic(userId, state, "rain");
    addMemory(userId, state, "雨聲");
    addMemory(userId, state, "潮濕");
    
    // 回覆對話 + 回到選擇畫面
    const updatedState = getUserState(userId);
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "老人：「雨...對，一直在下...」"
      },
      {
        type: "text",
        text: "✨ 獲得記憶食材：雨聲、潮濕"
      },
      getDay1DayShift(updatedState)
    ]);
    return;
  }
  
  if (userText === "【靜靜陪伴】") {
    showLoadingAnimation(userId, 5);
    
    // 添加記憶
    addTopic(userId, state, "silence");
    addMemory(userId, state, "寧靜");
    addMemory(userId, state, "陪伴");
    
    // 回覆對話 + 回到選擇畫面
    const updatedState = getUserState(userId);
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "你靜靜坐在他身邊。"
      },
      {
        type: "text",
        text: "老人：「...謝謝。」"
      },
      {
        type: "text",
        text: "✨ 獲得記憶食材：寧靜、陪伴"
      },
      getDay1DayShift(updatedState)
    ]);
    return;
  }
  
  // 預設回應（避免卡住）- 回到選擇畫面
  showLoadingAnimation(userId, 5);
  replyMessage(event.replyToken, [
    {
      type: "text",
      text: "【黑貓】\n「...你要跟他聊什麼？」"
    },
    getDay1DayShift(state)
  ]);
}

function handleTopicChoice(event, userId, state, topic) {
  const topicsDone = state.topicsDone || [];
  
  if (topic === "hands") {
    // ✅ 新版：分段發送
    showLoadingAnimation(userId, 5);
    
    // 先回覆避免 timeout
    replyMessage(event.replyToken, { type: "text", text: "..." });
    
    // 延遲後發送 Part 1
    Utilities.sleep(500);
    pushMessages(userId, getDay1TopicHandsMessages_Part1());
    
    // 記錄進度
    addTopic(userId, state, "hands_part1");
    return;
  }
  
  // 其他話題保持舊版（暫時）
  let response = null;
  let memories = [];
  
  if (topic === "origin") {
    response = getTopicOriginResponse();
    memories = ["寒冷", "失憶"];
  } else if (topic === "rain") {
    response = getTopicRainResponse();
    memories = ["困惑"];
  } else if (topic === "silence") {
    response = getTopicSilenceResponse();
    memories = ["信任"];
  }
  
  // 添加記憶
  addTopic(userId, state, topic);
  memories.forEach(m => addMemory(userId, state, m));
  
  // 更新階段到 Cooking
  updateUserState(userId, {
    phase: PHASE.COOKING,
    lastActive: new Date().toISOString()
  });
  
  replyMessage(event.replyToken, response);
}

// ============================================================
// Day 1 話題回應 - 分段版本（嚴格按設計規範）
// ============================================================

// Part 1：初步對話（5 條純文字）
function getDay1TopicHandsMessages_Part1() {
  return [
    {
      type: "text",
      text: "【老人慢慢抬起手，盯著指尖】"
    },
    {
      type: "text",
      text: "他的手在微微顫抖。"
    },
    {
      type: "text",
      text: "指尖佈滿針孔的痕跡，\n像被時間刺穿的布料。"
    },
    {
      type: "text",
      text: "「我的手...有很多小洞。」"
    },
    {
      type: "text",
      text: "「是針扎的。」",
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "繼續聽", text: "【繼續】" }
        }]
      }
    }
  ];
}

// Part 2：記憶閃現（5 條，含 1 張記憶卡片）
function getDay1TopicHandsMessages_Part2() {
  return [
    {
      type: "text",
      text: "【記憶碎片閃現...】"
    },
    getDay1HandsMemoryCard(),
    {
      type: "text",
      text: "【老人回過神，眼神變得清晰】"
    },
    {
      type: "text",
      text: "「對！我是裁縫！」"
    },
    {
      type: "text",
      text: "✨ 獲得記憶食材：🪡 針、🧵 縫線、💧 寒冷",
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "進入廚房", text: "【進入廚房】" }
        }]
      }
    }
  ];
}

// 記憶卡片：針線工作的記憶
function getDay1HandsMemoryCard() {
  return {
    type: "flex",
    altText: "記憶碎片",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "💭 記憶碎片",
            size: "sm",
            color: "#FFD700",
            weight: "bold"
          },
          {
            type: "separator",
            margin: "md",
            color: "#FFD700"
          },
          {
            type: "text",
            text: "【深夜的閣樓】",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: "針在微弱的燈光下閃爍。",
            wrap: true,
            margin: "xs",
            size: "sm"
          },
          {
            type: "text",
            text: "一針一線...",
            wrap: true,
            margin: "md",
            size: "sm"
          },
          {
            type: "text",
            text: "「不能歪...」\n「一針一線...都不能錯...」",
            wrap: true,
            margin: "xs",
            size: "xs",
            color: "#AAAAAA"
          }
        ]
      },
      styles: {
        body: {
          backgroundColor: "#FFF9E6"
        }
      }
    }
  };
}

function getTopicOriginResponse() {
  return {
    type: "text",
    text: "【話題：你從哪裡來】\n\n你：「你從哪裡來？」\n\n老人：「我...不記得了...」\n\n[獲得記憶：失憶]"
  };
}

function getTopicRainResponse() {
  return {
    type: "text",
    text: "【話題：窗外的雨】\n\n你：「窗外一直在下雨...」\n\n老人：「雨...對，一直在下...」\n\n[獲得記憶：困惑]"
  };
}

function getTopicSilenceResponse() {
  return {
    type: "text",
    text: "【沉默陪伴】\n\n你靜靜坐在他身邊。\n\n老人：「...謝謝。」\n\n[獲得記憶：信任]"
  };
}

// ============================================================
// Day 1 Cooking Time - 料理階段
// ============================================================
function handleDay1Cooking(event, userId, state, userText) {
  const topicsDone = state.topicsDone || [];
  
  // ⚠️ 安全檢查：如果用戶輸入的是話題選擇，將 phase 重置為 DAY 並處理
  // 這可以防止因競爭條件導致的 phase 錯誤
  const topicInputs = [
    "你的手...是做什麼工作的？",
    "你從哪裡來？",
    "窗外一直在下雨...",
    "【靜靜陪伴】"
  ];
  if (topicInputs.includes(userText)) {
    // 重置 phase 為 DAY
    updateUserState(userId, { phase: PHASE.DAY });
    state.phase = PHASE.DAY;
    // 調用 handleDay1Day 處理
    handleDay1Day(event, userId, state, userText);
    return;
  }
  
  if (userText === "廚房" || userText === "【進入廚房】" || userText === "【廚房】" || userText.includes("料理")) {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, getDay1CookingScene(state));
    return;
  } 
  else if (userText === "做熱茶" || userText === "【做熱茶】" || userText.includes("熱茶")) {
    showLoadingAnimation(userId, 5);
    
    // ✅ 新版：分段發送
    replyMessage(event.replyToken, { type: "text", text: "..." });
    Utilities.sleep(500);
    pushMessages(userId, getDay1CookingTea_Part1());
    
    // 記錄進度
    addTopic(userId, state, "cooking_tea_part1");
    return;
  }
  // 處理【繼續】→ Part 2
  else if (userText === "【繼續】" && topicsDone.includes("cooking_tea_part1") && !topicsDone.includes("cooking_tea_part2")) {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, { type: "text", text: "..." });
    Utilities.sleep(500);
    pushMessages(userId, getDay1CookingTea_Part2());
    addTopic(userId, state, "cooking_tea_part2");
    return;
  }
  // 處理【繼續】→ Part 3
  else if (userText === "【繼續】" && topicsDone.includes("cooking_tea_part2") && !topicsDone.includes("cooking_tea_part3")) {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, { type: "text", text: "..." });
    Utilities.sleep(500);
    pushMessages(userId, getDay1CookingTea_Part3());
    addTopic(userId, state, "cooking_tea_part3");
    
    // 更新到 AFTER 階段
    updateUserState(userId, {
      phase: PHASE.AFTER,
      lastActive: new Date().toISOString()
    });
    return;
  }
  else if (userText === "做熱湯" || userText === "【做熱湯】" || userText.includes("熱湯")) {
    showLoadingAnimation(userId, 5);
    // 更新狀態到 AFTER
    updateUserState(userId, {
      phase: PHASE.AFTER,
      lastActive: new Date().toISOString()
    });
    replyMessage(event.replyToken, getDay1CookingSoup());
    return;
  } 
  else {
    // 預設回應 - 直接顯示廚房場景（不使用 quickReply，避免與雙選項衝突）
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "【黑貓】\n「...你要煮什麼？」"
      },
      getDay1CookingScene(state)
    ]);
  }
}

function getDay1CookingScene(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  
  // 構建記憶食材列表
  let memoryText = "";
  if (memories.length > 0) {
    memoryText = memories.map(m => `• ${m}`).join("\n");
  } else {
    memoryText = "（尚未收集）";
  }
  
  return {
    type: "flex",
    altText: "進入廚房",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🍳 Cooking Time 18:00",
            weight: "bold",
            color: "#F4511E"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "【黑貓蹲在料理台上，盯著你】",
                size: "sm",
                color: "#999999",
                wrap: true
              },
              {
                type: "text",
                text: "「怎麼樣？聊出什麼了？」",
                wrap: true
              },
              {
                type: "text",
                text: "【黑貓】\n「嗯哼。」",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「那就煮點東西讓他想起來唄。」",
                wrap: true
              },
              {
                type: "separator",
                margin: "lg"
              },
              {
                type: "text",
                text: "【食材櫃自動開啟】",
                size: "sm",
                color: "#999999",
                wrap: true,
                margin: "lg"
              },
              {
                type: "text",
                text: "[基礎食材]",
                weight: "bold",
                size: "sm"
              },
              {
                type: "text",
                text: "• 熱水\n• 茶葉\n• 鹽\n• 蔬菜",
                size: "xs",
                color: "#AAAAAA"
              },
              {
                type: "text",
                text: `[記憶食材]（發光） - ${memories.length} 個`,
                weight: "bold",
                size: "sm",
                margin: "md"
              },
              {
                type: "text",
                text: memoryText,
                size: "xs",
                color: "#FFD700",
                wrap: true
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            action: {
              type: "message",
              label: "☕ 做熱茶",
              text: "【做熱茶】"
            },
            style: "primary",
            color: "#FF6B6B"
          },
          {
            type: "button",
            action: {
              type: "message",
              label: "🍜 做熱湯",
              text: "【做熱湯】"
            },
            style: "primary",
            color: "#4ECDC4"
          }
        ]
      }
    }
  };
}

// ============================================================
// Day 1 After Hours - 記憶劇場
// ============================================================
function handleDay1After(event, userId, state, userText) {
  // 處理「明天繼續」
  if (userText === "【明天繼續】" || userText === "明天繼續" || userText === "明天") {
    showLoadingAnimation(userId, 5);
    // 推進到 Day 2
    updateUserState(userId, {
      currentDay: 2,
      phase: PHASE.DAY,
      lastActive: new Date().toISOString()
    });
    // 獲取更新後的狀態
    const updatedState = getUserState(userId);
    replyMessage(event.replyToken, getDay2DayShift(updatedState));
    return;
  }
  
  // 預設回應
  showLoadingAnimation(userId, 5);
  replyMessage(event.replyToken, {
    type: "text",
    text: "【黑貓打哈欠】\n\n「今天就到這吧。明天再說。」",
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "message",
            label: "明天繼續",
            text: "【明天繼續】"
          }
        }
      ]
    }
  });
}

// Day 1 Cooking Tea - Part 1（烹飪過程）- 最多 5 條消息
function getDay1CookingTea_Part1() {
  return [
    {
      type: "text",
      text: "【烹飪演出】\n\n你將熱水注入茶壺。"
    },
    {
      type: "text",
      text: "【黑貓】\n「把那個也放進去。」"
    },
    {
      type: "text",
      text: "你：「寒冷的記憶...？」\n\n【你小心地將那團發光的藍色霧氣放入茶壺】"
    },
    {
      type: "text",
      text: "茶水開始變色。"
    },
    {
      type: "text",
      text: "從透明，變成淡淡的藍。\n\n像冬日的天空。",
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "繼續", text: "【繼續】" }
        }]
      }
    }
  ];
}

// Day 1 Cooking Tea - Part 2（記憶劇場）
function getDay1CookingTea_Part2() {
  return [
    {
      type: "text",
      text: "你將茶遞給老人。"
    },
    {
      type: "text",
      text: "【老人接過茶杯】"
    },
    {
      type: "text",
      text: "他的手顫抖著，幾乎拿不穩。"
    },
    {
      type: "text",
      text: "但當茶水碰到嘴唇的瞬間..."
    },
    {
      type: "text",
      text: "「...這個溫度。」",
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "繼續", text: "【繼續】" }
        }]
      }
    }
  ];
}

// Day 1 Cooking Tea - Part 3（記憶劇場卡片 + 結束）
function getDay1CookingTea_Part3() {
  return [
    {
      type: "text",
      text: "【記憶在茶水中浮現...】"
    },
    getDay1CookingMemoryCard(),
    {
      type: "text",
      text: "【老人睜開眼，眼中有淚光】"
    },
    {
      type: "text",
      text: "「有個人...曾經給我泡過茶。」"
    },
    {
      type: "text",
      text: "「很小的手...捧著茶杯的小手...」",
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "明天繼續", text: "【明天繼續】" }
        }]
      }
    }
  ];
}

// Day 1 記憶劇場卡片
function getDay1CookingMemoryCard() {
  return {
    type: "flex",
    altText: "記憶劇場",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "💭 記憶劇場",
            size: "sm",
            color: "#FFD700",
            weight: "bold"
          },
          {
            type: "separator",
            margin: "md",
            color: "#FFD700"
          },
          {
            type: "text",
            text: "【深夜的閣樓】",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: "小女孩（雀躍）：",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: "「爸爸，給你茶。」",
            wrap: true,
            margin: "xs"
          },
          {
            type: "text",
            text: "他（疲憊，沒抬頭）：",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: "「...謝謝。」",
            wrap: true,
            margin: "xs",
            color: "#AAAAAA"
          }
        ]
      },
      styles: {
        body: {
          backgroundColor: "#FFF9E6"
        }
      }
    }
  };
}

// 舊版本（保留以防需要）
function getDay1CookingTea_OLD() {
  return [
    {
      type: "text",
      text: "【烹飪演出】\n\n你將熱水注入茶壺。\n\n【黑貓】\n「把那個也放進去。」\n\n你：「寒冷的記憶...？」\n\n【你小心地將那團發光的藍色霧氣放入茶壺】"
    },
    {
      type: "text",
      text: "茶水開始變色。\n\n從透明，變成淡淡的藍。\n\n像冬日的天空。"
    },
    {
      type: "flex",
      altText: "Day 1 結束",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "🌃 After Hours 23:00",
              weight: "bold",
              color: "#546E7A"
            },
            {
              type: "separator",
              margin: "md"
            },
            {
              type: "box",
              layout: "vertical",
              margin: "lg",
              spacing: "md",
              contents: [
                {
                  type: "text",
                  text: "你將茶遞給老人。",
                  wrap: true
                },
                {
                  type: "text",
                  text: "【老人接過茶杯】",
                  size: "sm",
                  color: "#999999",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "text",
                  text: "他的手顫抖著，\n幾乎拿不穩。",
                  wrap: true,
                  size: "sm"
                },
                {
                  type: "text",
                  text: "但當茶水碰到嘴唇的瞬間...",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "separator",
                  margin: "lg"
                },
                {
                  type: "text",
                  text: "「...這個溫度。」",
                  wrap: true,
                  margin: "lg"
                },
                {
                  type: "text",
                  text: "【他閉上眼睛】",
                  size: "sm",
                  color: "#999999",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "text",
                  text: "「好像...在哪裡感受過這種溫暖...」",
                  wrap: true
                },
                {
                  type: "separator",
                  margin: "lg"
                },
                {
                  type: "text",
                  text: "【記憶碎片閃現】",
                  size: "sm",
                  color: "#FFD700",
                  wrap: true,
                  margin: "lg",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: "小小的手，捧著茶杯。\n\n「爸爸，給你茶。」\n\n「...謝謝。」",
                  wrap: true,
                  size: "sm",
                  color: "#999999"
                },
                {
                  type: "separator",
                  margin: "lg"
                },
                {
                  type: "text",
                  text: "【老人睜開眼，眼中有淚光】",
                  size: "sm",
                  color: "#999999",
                  wrap: true,
                  margin: "lg"
                },
                {
                  type: "text",
                  text: "「有個人...曾經給我泡過茶。」",
                  wrap: true
                },
                {
                  type: "text",
                  text: "「很小的手...捧著茶杯的小手...」",
                  wrap: true
                }
              ]
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "💭 Day 1 結束",
              size: "sm",
              color: "#999999",
              align: "center"
            },
            {
              type: "separator",
              margin: "md"
            },
            {
              type: "button",
              action: {
                type: "message",
                label: "明天繼續",
                text: "【明天繼續】"
              },
              style: "primary",
              margin: "md"
            }
          ]
        }
      }
    }
  ];
}

function getDay1CookingSoup() {
  return {
    type: "text",
    text: "【熱湯版本】\n\n你做了一碗熱湯...\n\n（這個版本尚未實作，請選擇做熱茶）"
  };
}

// ============================================================
// Day 2 Day Shift - 深入探索（動態版本）
// ============================================================
function getDay2DayShift(state) {
  const topicsDone = state ? (state.topicsDone || []) : [];
  const buttons = [];
  
  // 那個夢（推薦，完整劇情線）
  if (!topicsDone.includes("dream_part1") && !topicsDone.includes("dream_part3")) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "💭 那個夢（推薦）",
        text: "你夢到了什麼？"
      },
      style: "primary",
      color: "#E91E63"
    });
  }
  
  // 你在找什麼
  if (!topicsDone.includes("search")) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "🔍 你在找什麼",
        text: "你在找什麼？"
      },
      style: "primary",
      color: "#4ECDC4"
    });
  }
  
  // 你怎麼來的
  if (!topicsDone.includes("death")) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "❄️ 你怎麼來的",
        text: "你是怎麼來到這裡的？"
      },
      style: "primary",
      color: "#546E7A"
    });
  }
  
  // 計算 Day 2 完成的話題數量
  const day2Topics = ["dream_part3", "search", "death"];
  const day2Done = day2Topics.filter(t => topicsDone.includes(t)).length;
  
  // 如果已經完成至少一個 Day 2 話題，顯示「進入廚房」
  if (day2Done > 0) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "🍳 進入廚房",
        text: "【進入廚房】"
      },
      style: "primary",
      color: "#28A745"
    });
  }
  
  return {
    type: "flex",
    altText: "Day 2 - 白天",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🌅 Day 2 - Day Shift 10:00",
            weight: "bold",
            color: "#FF9800"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "老人坐在窗邊。\n今天他的眼神沒那麼空洞了。",
                wrap: true
              },
              {
                type: "text",
                text: "【老人】\n「早安...主廚。」",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「昨天的茶...很好喝。」",
                wrap: true
              },
              {
                type: "text",
                text: "「我做了一個夢...」",
                wrap: true
              },
              {
                type: "separator",
                margin: "lg"
              },
              {
                type: "text",
                text: day2Done > 0 ? `已收集 ${day2Done} 個 Day 2 話題` : "你可以問更深入的問題...",
                wrap: true,
                margin: "lg",
                size: "sm",
                weight: "bold",
                color: day2Done > 0 ? "#FFD700" : "#000000"
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: buttons
      }
    }
  };
}

function handleDay2Day(event, userId, state, userText) {
  const topicsDone = state.topicsDone || [];
  
  // 計算 Day 2 完成的話題數量
  const day2Topics = ["dream_part3", "search", "death"];
  const day2Done = day2Topics.filter(t => topicsDone.includes(t)).length;
  
  // === 進入廚房 ===
  if (userText === "【進入廚房】" && day2Done > 0) {
    showLoadingAnimation(userId, 5);
    updateUserState(userId, { phase: PHASE.COOKING });
    replyMessage(event.replyToken, getDay2CookingScene(state));
    return;
  }
  
  // === 話題：那個夢（分段版本）===
  
  // 玩家選擇「那個夢」話題 - 發送第 1 波
  if (userText === "你夢到了什麼？") {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, { type: "text", text: "..." });
    Utilities.sleep(500);
    pushMessages(userId, getDay2TopicDreamMessages_Part1());
    addTopic(userId, state, "dream_part1");
    addMemory(userId, state, "蜜糖笑容");
    return;
  }
  
  // 玩家點擊「繼續」- 發送第 2 波（記憶閃現）
  if (userText === "【繼續】" && topicsDone.includes("dream_part1") && !topicsDone.includes("dream_part2")) {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, { type: "text", text: "..." });
    Utilities.sleep(500);
    pushMessages(userId, getDay2TopicDreamMessages_Part2());
    addTopic(userId, state, "dream_part2");
    addMemory(userId, state, "女兒-美雪");
    addMemory(userId, state, "婚紗");
    return;
  }
  
  // 玩家點擊「繼續聽他說」- 發送第 3 波（情緒爆發）+ 回到選擇畫面
  if (userText === "【繼續聽他說】" && topicsDone.includes("dream_part2") && !topicsDone.includes("dream_part3")) {
    showLoadingAnimation(userId, 5);
    
    // 添加記憶
    addTopic(userId, state, "dream_part3");
    addMemory(userId, state, "眼淚");
    
    // 獲取更新後的狀態
    const updatedState = getUserState(userId);
    
    // 發送情緒爆發訊息 + 回到選擇畫面
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "【老人睜開眼，淚流滿面】"
      },
      {
        type: "text",
        text: "「美雪...」\n「我有女兒。她叫美雪。」"
      },
      {
        type: "text",
        text: "【他抓住你的手】\n\n「我...我都在工作...」\n「我從來沒有好好看過她笑...」\n\n「但我在為她縫婚紗...最後一針...我有沒有縫好？」"
      },
      {
        type: "text",
        text: "✨ 獲得記憶食材：😢 眼淚、👧 女兒-美雪、💍 婚紗"
      },
      getDay2DayShift(updatedState)
    ]);
    return;
  }
  
  // 玩家選擇「安慰他」- 回到選擇畫面
  if (userText === "沒事的...你盡力了..." && topicsDone.includes("dream_part3")) {
    showLoadingAnimation(userId, 5);
    const updatedState = getUserState(userId);
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "【老人】\n「...謝謝你。」"
      },
      getDay2DayShift(updatedState)
    ]);
    return;
  }
  
  // === 話題：你在找什麼（改為回到選擇畫面）===
  if (userText === "你在找什麼？") {
    showLoadingAnimation(userId, 5);
    
    // 添加記憶
    addTopic(userId, state, "search");
    addMemory(userId, state, "執念");
    addMemory(userId, state, "婚紗");
    
    // 獲取更新後的狀態
    const updatedState = getUserState(userId);
    
    // 回覆對話 + 回到選擇畫面
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "老人：「婚紗...我在縫婚紗...」"
      },
      {
        type: "text",
        text: "「給我女兒...給美雪的婚紗...」"
      },
      {
        type: "text",
        text: "✨ 獲得記憶食材：🎯 執念、💍 婚紗"
      },
      getDay2DayShift(updatedState)
    ]);
    return;
  }
  
  // === 話題：你怎麼來的（改為回到選擇畫面）===
  if (userText === "你是怎麼來到這裡的？") {
    showLoadingAnimation(userId, 5);
    
    // 添加記憶
    addTopic(userId, state, "death");
    addMemory(userId, state, "雪");
    addMemory(userId, state, "死亡");
    addMemory(userId, state, "寒冷");
    
    // 獲取更新後的狀態
    const updatedState = getUserState(userId);
    
    // 回覆對話 + 回到選擇畫面（合併訊息，確保不超過 5 條）
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "【老人的眼神變得恍惚】\n\n「雪...對，有很多雪...」"
      },
      {
        type: "text",
        text: "「我在閣樓...縫最後一針的時候...」\n「窗外...下著大雪...」\n\n「然後...我迷路了...」"
      },
      {
        type: "text",
        text: "✨ 獲得記憶食材：❄️ 雪、💀 死亡、💧 寒冷"
      },
      getDay2DayShift(updatedState)
    ]);
    return;
  }
  
  // === 預設回應（避免鬼打牆）===
  // 回到選擇畫面
  showLoadingAnimation(userId, 5);
  replyMessage(event.replyToken, [
    {
      type: "text",
      text: "【黑貓】\n「...你想跟他聊什麼？」"
    },
    getDay2DayShift(state)
  ]);
}

function handleDay2TopicChoice(event, userId, state, topic) {
  addTopic(userId, state, topic);
  
  let response = null;
  let memories = [];
  
  if (topic === "dream") {
    response = getDay2TopicDream();
    memories = ["蜜糖笑容", "女兒-美雪", "婚禮"];
  } else if (topic === "search") {
    response = getDay2TopicSearch();
    memories = ["執念", "婚紗"];
  } else if (topic === "death") {
    response = getDay2TopicDeath();
    memories = ["雪", "死亡", "寒冷"];
  }
  
  memories.forEach(m => addMemory(userId, state, m));
  
  updateUserState(userId, {
    phase: PHASE.COOKING,
    lastActive: new Date().toISOString()
  });
  
  replyMessage(event.replyToken, response);
}

function getDay2TopicDream() {
  return {
    type: "flex",
    altText: "Day 2 - 那個夢",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "💭 話題：那個夢",
            weight: "bold",
            color: "#FFB6C1"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "你：「你夢到了什麼？」",
                wrap: true,
                color: "#4A90E2"
              },
              {
                type: "text",
                text: "【老人望向窗外，聲音很輕】",
                size: "sm",
                color: "#999999",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「我夢到...一個小女孩。」",
                wrap: true
              },
              {
                type: "text",
                text: "「她坐在我對面喝茶。」",
                wrap: true
              },
              {
                type: "text",
                text: "「她笑起來...很甜。像...」",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "【他努力回想，聲音顫抖】",
                size: "sm",
                color: "#999999",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「像蜜糖一樣甜。」",
                wrap: true,
                weight: "bold"
              },
              {
                type: "separator",
                margin: "lg"
              },
              {
                type: "text",
                text: "你：「她是誰？」",
                wrap: true,
                color: "#4A90E2",
                margin: "lg"
              },
              {
                type: "text",
                text: "【老人搖頭，表情痛苦】",
                size: "sm",
                color: "#999999",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「女兒...」",
                wrap: true
              },
              {
                type: "separator",
                margin: "lg"
              },
              {
                type: "text",
                text: "【記憶如潮水般湧來】",
                size: "sm",
                color: "#FFD700",
                wrap: true,
                margin: "lg",
                weight: "bold"
              },
              {
                type: "text",
                text: "小女孩：「爸爸！你看我畫的！」\n他（冷淡）：「嗯...爸爸要工作了...」",
                wrap: true,
                size: "xs",
                color: "#999999"
              },
              {
                type: "text",
                text: "女人：「爸，我要結婚了。」\n他：「...恭喜。需要我做什麼嗎？」\n「不用了，婚紗我已經訂好了。」",
                wrap: true,
                size: "xs",
                color: "#999999",
                margin: "md"
              },
              {
                type: "text",
                text: "深夜閣樓，他的呢喃：\n「美雪...爸爸這次...一定會做好...」",
                wrap: true,
                size: "xs",
                color: "#999999",
                margin: "md"
              },
              {
                type: "separator",
                margin: "lg"
              },
              {
                type: "text",
                text: "【老人睜開眼，淚流滿面】",
                size: "sm",
                color: "#999999",
                wrap: true,
                margin: "lg"
              },
              {
                type: "text",
                text: "「美雪...」",
                wrap: true,
                weight: "bold"
              },
              {
                type: "text",
                text: "「我有女兒。她叫美雪。」",
                wrap: true
              },
              {
                type: "text",
                text: "「我在為她縫製婚紗...」",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「但...最後一針...我有沒有縫好？」",
                wrap: true
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: "✅ 核心記憶解鎖",
                weight: "bold",
                size: "sm",
                color: "#4CAF50"
              },
              {
                type: "text",
                text: "👧 女兒-美雪 | 🍯 蜜糖笑容 | 💍 婚紗",
                size: "xs",
                color: "#999999"
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "message",
              label: "進入廚房",
              text: "廚房"
            },
            style: "primary",
            color: "#FFB6C1"
          }
        ]
      }
    }
  };
}

// ============================================================
// Day 2 - 「那個夢」話題 - 分段版本（UX 優化）
// ============================================================

// 第 1 波：初步對話（5 條訊息）
function getDay2TopicDreamMessages_Part1() {
  return [
    {
      type: "text",
      text: "【老人望向窗外，聲音很輕】"
    },
    {
      type: "text",
      text: "「我夢到...一個小女孩。」"
    },
    {
      type: "text",
      text: "「她坐在我對面喝茶。」\n\n「她笑起來...很甜。像...」"
    },
    {
      type: "text",
      text: "【他努力回想，聲音顫抖】\n\n「像蜜糖一樣甜。」"
    },
    {
      type: "text",
      text: "✨ 獲得記憶食材：🍯 蜜糖笑容",
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "繼續聽", text: "【繼續】" }
        }]
      }
    }
  ];
}

// 第 2 波：記憶閃現（5 條訊息）
function getDay2TopicDreamMessages_Part2() {
  return [
    {
      type: "text",
      text: "【記憶開始閃現...】"
    },
    getDay2MemoryCard1(),
    getDay2MemoryCard2(),
    getDay2MemoryCard3(),
    {
      type: "text",
      text: "【記憶碎片逐漸清晰...】",
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "繼續", text: "【繼續聽他說】" }
        }]
      }
    }
  ];
}

// 第 3 波：情緒爆發（4 條訊息）
function getDay2TopicDreamMessages_Part3() {
  return [
    {
      type: "text",
      text: "【老人睜開眼，淚流滿面】"
    },
    {
      type: "text",
      text: "「美雪...」\n「我有女兒。她叫美雪。」"
    },
    {
      type: "text",
      text: "【他抓住你的手】"
    },
    {
      type: "text",
      text: "「我...我都在工作...」\n「我從來沒有好好看過她笑...」\n\n「但我在為她縫婚紗...最後一針...我有沒有縫好？」",
      quickReply: {
        items: [
          {
            type: "action",
            action: { type: "message", label: "安慰他", text: "沒事的...你盡力了..." }
          },
          {
            type: "action",
            action: { type: "message", label: "進入廚房", text: "【進入廚房】" }
          }
        ]
      }
    }
  ];
}

// 記憶卡片 1
function getDay2MemoryCard1() {
  return {
    type: "flex",
    altText: "記憶碎片",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "💭 記憶碎片",
            size: "sm",
            color: "#FFD700",
            weight: "bold"
          },
          {
            type: "separator",
            margin: "md",
            color: "#FFD700"
          },
          {
            type: "text",
            text: "小女孩（雀躍）：",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: "「爸爸！你看我畫的！」",
            wrap: true,
            margin: "xs"
          },
          {
            type: "text",
            text: "他（冷淡，沒抬頭）：",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: "「嗯...爸爸要工作了...」",
            wrap: true,
            margin: "xs",
            color: "#AAAAAA"
          }
        ]
      },
      styles: {
        body: {
          backgroundColor: "#FFF9E6"
        }
      }
    }
  };
}

// 記憶卡片 2
function getDay2MemoryCard2() {
  return {
    type: "flex",
    altText: "記憶碎片",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "💭 記憶碎片",
            size: "sm",
            color: "#FFD700",
            weight: "bold"
          },
          {
            type: "separator",
            margin: "md",
            color: "#FFD700"
          },
          {
            type: "text",
            text: "女人（期待）：",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: "「爸，我要結婚了。」",
            wrap: true,
            margin: "xs"
          },
          {
            type: "text",
            text: "他（語氣平淡）：",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: "「...恭喜。需要我做什麼嗎？」",
            wrap: true,
            margin: "xs",
            color: "#AAAAAA"
          },
          {
            type: "text",
            text: "女人（失望）：",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: "「不用了，婚紗我已經訂好了。」",
            wrap: true,
            margin: "xs",
            color: "#AAAAAA"
          }
        ]
      },
      styles: {
        body: {
          backgroundColor: "#FFF9E6"
        }
      }
    }
  };
}

// 記憶卡片 3
function getDay2MemoryCard3() {
  return {
    type: "flex",
    altText: "記憶碎片",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "💭 記憶碎片",
            size: "sm",
            color: "#FFD700",
            weight: "bold"
          },
          {
            type: "separator",
            margin: "md",
            color: "#FFD700"
          },
          {
            type: "text",
            text: "深夜閣樓：",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: "他的呢喃：",
            size: "xs",
            color: "#999999",
            margin: "xs"
          },
          {
            type: "text",
            text: "「美雪...爸爸這次...」",
            wrap: true,
            margin: "xs"
          },
          {
            type: "text",
            text: "「一定會做好...一定...」",
            wrap: true,
            margin: "xs",
            weight: "bold"
          },
          {
            type: "text",
            text: "【針在昏黃燈下閃爍】",
            size: "xs",
            color: "#999999",
            margin: "md"
          }
        ]
      },
      styles: {
        body: {
          backgroundColor: "#FFF9E6"
        }
      }
    }
  };
}

function getDay2TopicSearch() {
  return {
    type: "text",
    text: "【話題：你在找什麼】\n\n你：「你在找什麼？」\n\n老人：「婚紗...我在縫婚紗...」\n\n✨ 獲得記憶：🎯 執念、💍 婚紗",
    quickReply: {
      items: [{
        type: "action",
        action: { type: "message", label: "進入廚房", text: "【進入廚房】" }
      }]
    }
  };
}

function getDay2TopicDeath() {
  return {
    type: "text",
    text: "【話題：你怎麼來的】\n\n你：「你記得自己怎麼來這裡的嗎？」\n\n老人：「雪...對，有很多雪...我迷路了...」\n\n✨ 獲得記憶：❄️ 雪、💀 死亡、💧 寒冷",
    quickReply: {
      items: [{
        type: "action",
        action: { type: "message", label: "進入廚房", text: "【進入廚房】" }
      }]
    }
  };
}

function handleDay2Cooking(event, userId, state, userText) {
  // ⚠️ 安全檢查：如果用戶輸入的是 Day 2 話題選擇，將 phase 重置為 DAY 並處理
  const day2TopicInputs = [
    "你夢到了什麼？",
    "你在找什麼？",
    "你是怎麼來到這裡的？"
  ];
  if (day2TopicInputs.includes(userText)) {
    updateUserState(userId, { phase: PHASE.DAY });
    state.phase = PHASE.DAY;
    handleDay2Day(event, userId, state, userText);
    return;
  }
  
  if (userText === "廚房" || userText === "【進入廚房】" || userText === "【廚房】" || userText.includes("料理")) {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, getDay2CookingScene(state));
    return;
  } else if (userText.includes("燉菜") || userText.includes("蜜汁") || userText === "【做蜜汁燉菜】") {
    showLoadingAnimation(userId, 5);
    // 更新狀態到 AFTER
    updateUserState(userId, {
      phase: PHASE.AFTER,
      lastActive: new Date().toISOString()
    });
    replyMessage(event.replyToken, getDay2CookingResult());
    return;
  } else {
    // 預設回應 - 顯示廚房場景
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "【黑貓】\n「...你要煮什麼？」"
      },
      getDay2CookingScene(state)
    ]);
  }
}

function getDay2CookingScene(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  
  // 構建記憶食材列表
  let memoryText = "";
  if (memories.length > 0) {
    memoryText = memories.map(m => `• ${m}`).join("\n");
  } else {
    memoryText = "（尚未收集）";
  }
  
  return {
    type: "flex",
    altText: "Day 2 - 廚房",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🍳 Day 2 - Cooking Time 18:00",
            weight: "bold",
            color: "#F4511E"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "【黑貓蹲在櫃子上】",
                size: "sm",
                color: "#999999",
                wrap: true
              },
              {
                type: "text",
                text: "「哦？食材變多了啊。」",
                wrap: true
              },
              {
                type: "text",
                text: `[記憶食材]（發光）- ${memories.length} 個`,
                weight: "bold",
                size: "sm",
                margin: "md"
              },
              {
                type: "text",
                text: memoryText,
                size: "xs",
                color: "#FFD700",
                wrap: true
              },
              {
                type: "text",
                text: "[基礎食材]",
                weight: "bold",
                size: "sm",
                margin: "md"
              },
              {
                type: "text",
                text: "• 🍯 蜂蜜\n• 🐟 鹹魚\n• 🫚 薑",
                size: "xs",
                color: "#AAAAAA"
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            action: {
              type: "message",
              label: "🍜 蜜汁燉菜（蜜糖+眼淚+蜂蜜）",
              text: "【做蜜汁燉菜】"
            },
            style: "primary",
            color: "#E91E63"
          }
        ]
      }
    }
  };
}

function getDay2CookingResult() {
  return [
    {
      type: "text",
      text: "【烹飪演出】\n\n你將記憶食材一個個放入鍋中...\n\n藍色的「寒冷」\n金色的「蜜糖笑容」\n透明的「眼淚」\n\n它們在鍋中交融。"
    },
    {
      type: "text",
      text: "【黑貓跳上灶台旁邊，聞了聞】\n\n「嗯。不錯。」\n\n你：「...聞起來又甜又鹹。」\n\n【黑貓】\n「對啊。愛這種東西，本來就這樣。」\n「矛盾，複雜。但也最真。」"
    },
    {
      type: "text",
      text: "[料理完成]\n\n琥珀色的燉菜。"
    },
    {
      type: "flex",
      altText: "Day 2 After Hours",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "🌃 After Hours",
              weight: "bold",
              color: "#546E7A"
            },
            {
              type: "separator",
              margin: "md"
            },
            {
              type: "box",
              layout: "vertical",
              margin: "lg",
              spacing: "md",
              contents: [
                {
                  type: "text",
                  text: "你將料理端給老人。",
                  wrap: true
                },
                {
                  type: "text",
                  text: "【老人看著這碗燉菜】",
                  size: "sm",
                  color: "#999999",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "text",
                  text: "琥珀色的湯汁，\n散發著奇特的香氣。",
                  wrap: true,
                  size: "sm"
                },
                {
                  type: "text",
                  text: "【他舀起一口，放進嘴裡】",
                  size: "sm",
                  color: "#999999",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "text",
                  text: "沉默。",
                  wrap: true
                },
                {
                  type: "text",
                  text: "眼淚突然滑落。",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "text",
                  text: "「這味道...又甜又鹹...」",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "separator",
                  margin: "lg"
                },
                {
                  type: "text",
                  text: "【記憶劇場全面開啟】",
                  size: "sm",
                  color: "#FFD700",
                  wrap: true,
                  margin: "lg",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: "「我記起來了...」",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "text",
                  text: "「我在為美雪縫製婚紗。」",
                  wrap: true
                },
                {
                  type: "text",
                  text: "「但...最後一針...我有沒有縫好？」",
                  wrap: true,
                  margin: "md"
                }
              ]
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "💭 Day 2 結束",
              size: "sm",
              color: "#999999",
              align: "center"
            },
            {
              type: "separator",
              margin: "md"
            },
            {
              type: "button",
              action: {
                type: "postback",
                label: "最後一天",
                data: "next_phase:2:after"
              },
              style: "primary",
              margin: "md"
            }
          ]
        }
      }
    }
  ];
}

function handleDay2After(event, userId, state, userText) {
  // 處理「最後一天」或「明天」
  if (userText === "【最後一天】" || userText === "最後一天" || userText === "明天" || userText === "【明天繼續】") {
    showLoadingAnimation(userId, 5);
    // 推進到 Day 3
    updateUserState(userId, {
      currentDay: 3,
      phase: PHASE.COOKING,
      lastActive: new Date().toISOString()
    });
    // 獲取更新後的狀態
    const updatedState = getUserState(userId);
    replyMessage(event.replyToken, getDay3CookingStart(updatedState));
    return;
  }
  
  // 預設回應
  showLoadingAnimation(userId, 5);
  replyMessage(event.replyToken, {
    type: "text",
    text: "【黑貓看著窗外】\n\n「...明天，就是最後一天了。」",
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "message",
            label: "最後一天",
            text: "【最後一天】"
          }
        }
      ]
    }
  });
}

// ============================================================
// Day 3 - 真相與告別（動態版本）
// ============================================================
function getDay3CookingStart(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  
  // 構建記憶食材列表
  let memoryText = "";
  if (memories.length > 0) {
    memoryText = memories.map(m => `• ${m}`).join("\n");
  } else {
    memoryText = "（尚未收集）";
  }
  
  return {
    type: "flex",
    altText: "Day 3 - 最終料理",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🍳 Day 3 - 最終料理",
            weight: "bold",
            color: "#F4511E"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "【黑貓坐在料理台上】",
                size: "sm",
                color: "#999999",
                wrap: true
              },
              {
                type: "text",
                text: "「最後一次了。」",
                wrap: true
              },
              {
                type: "text",
                text: "「把你收集到的全放進去吧。」",
                wrap: true
              },
              {
                type: "text",
                text: `[所有記憶食材] - ${memories.length} 個`,
                weight: "bold",
                size: "sm",
                margin: "md"
              },
              {
                type: "text",
                text: memoryText,
                size: "xs",
                color: "#FFD700",
                wrap: true
              },
              {
                type: "separator",
                margin: "md"
              },
              {
                type: "text",
                text: "[配方：蜜汁炙燒鹹魚]",
                weight: "bold",
                size: "sm",
                margin: "md"
              },
              {
                type: "text",
                text: "🐟 鹹魚（眼淚與時間）\n🍯 蜂蜜（女兒的笑）\n🫚 薑（溫暖的刺激）\n🪡 針（核心執念）\n💍 婚紗（未完成的愛）",
                size: "xs",
                color: "#AAAAAA",
                wrap: true
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "message",
              label: "🐟 製作蜜汁炙燒鹹魚",
              text: "【製作最終料理】"
            },
            style: "primary",
            color: "#F57C00"
          }
        ]
      }
    }
  };
}

function handleDay3Cooking(event, userId, state, userText) {
  const topicsDone = state.topicsDone || [];
  
  if (userText.includes("最終料理") || userText.includes("製作") || userText === "【製作最終料理】") {
    showLoadingAnimation(userId, 5);
    
    // ✅ 新版：分段發送 Part 1
    replyMessage(event.replyToken, { type: "text", text: "..." });
    Utilities.sleep(500);
    pushMessages(userId, getDay3CookingProcess_Part1());
    
    // 記錄進度
    addTopic(userId, state, "cooking_final_part1");
    return;
  } 
  // 處理【繼續】→ Part 2（記憶融合卡片 + 完成）
  else if (userText === "【繼續】" && topicsDone.includes("cooking_final_part1") && !topicsDone.includes("cooking_final_part2")) {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, { type: "text", text: "..." });
    Utilities.sleep(500);
    pushMessages(userId, getDay3CookingProcess_Part2());
    addTopic(userId, state, "cooking_final_part2");
    return;
  }
  // 處理【端出料理】
  else if (userText.includes("端出") || userText === "【端出料理】") {
    showLoadingAnimation(userId, 5);
    // 更新到結局階段
    updateUserState(userId, {
      phase: PHASE.AFTER,
      lastActive: new Date().toISOString()
    });
    replyMessage(event.replyToken, getDay3Ending());
    return;
  } 
  else {
    // 預設回應 - 顯示廚房場景
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "【黑貓】\n「準備好了嗎？這是最後一道料理了。」"
      },
      getDay3CookingStart(state)
    ]);
  }
}

// Day 3 Cooking - Part 1（烹飪過程）- 合併訊息確保不超過 5 條
function getDay3CookingProcess_Part1() {
  return [
    {
      type: "text",
      text: "【烹飪演出】\n\n你將鹹魚放入熱油...\n\n滋滋作響。"
    },
    {
      type: "text",
      text: "然後，小心地將那些發光的記憶\n一個個放入鍋中。"
    },
    {
      type: "text",
      text: "藍色的針、\n金色的笑容、\n透明的眼淚、\n白色的婚紗..."
    },
    {
      type: "text",
      text: "它們在高溫下融化，\n裹住每一吋魚肉。",
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "繼續", text: "【繼續】" }
        }]
      }
    }
  ];
}

// Day 3 Cooking - Part 2（記憶融合卡片 + 完成）
function getDay3CookingProcess_Part2() {
  return [
    getDay3CookingMemoryCard(),
    {
      type: "text",
      text: "[料理完成]"
    },
    {
      type: "text",
      text: "琥珀色的魚肉閃著光。"
    },
    {
      type: "text",
      text: "這是田中太郎的記憶。\n\n完整的。",
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "端給他", text: "【端出料理】" }
        }]
      }
    }
  ];
}

// Day 3 記憶融合卡片
function getDay3CookingMemoryCard() {
  return {
    type: "flex",
    altText: "記憶融合",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "💭 記憶融合",
            size: "sm",
            color: "#FFD700",
            weight: "bold"
          },
          {
            type: "separator",
            margin: "md",
            color: "#FFD700"
          },
          {
            type: "text",
            text: "【黑貓看著鍋裡的料理】",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: "「嗯。」",
            wrap: true,
            margin: "xs"
          },
          {
            type: "text",
            text: "「他這輩子...就這樣了。」",
            wrap: true,
            margin: "md"
          },
          {
            type: "text",
            text: "「甜的，鹹的，溫暖的，刺痛的...」",
            wrap: true,
            margin: "md",
            size: "sm"
          },
          {
            type: "text",
            text: "「什麼都有。」",
            wrap: true,
            size: "sm"
          },
          {
            type: "text",
            text: "「全混在這一鍋裡了。」",
            wrap: true,
            size: "sm",
            weight: "bold"
          }
        ]
      },
      styles: {
        body: {
          backgroundColor: "#FFF9E6"
        }
      }
    }
  };
}

function getDay3Ending() {
  return [
    {
      type: "text",
      text: "━━━━━━━━━━━━━━━\n\n你端著料理走出廚房。\n\n老人坐在窗邊。\n\n窗外的雨...停了。\n\n━━━━━━━━━━━━━━━"
    },
    {
      type: "flex",
      altText: "Day 3 - 真相",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "⭐ 最終章",
              weight: "bold",
              size: "xl",
              color: "#FFD700",
              align: "center"
            },
            {
              type: "separator",
              margin: "md"
            },
            {
              type: "box",
              layout: "vertical",
              margin: "lg",
              spacing: "md",
              contents: [
                {
                  type: "text",
                  text: "【老人】",
                  size: "sm",
                  color: "#999999",
                  wrap: true
                },
                {
                  type: "text",
                  text: "「主廚。我...全都想起來了。」",
                  wrap: true
                },
                {
                  type: "text",
                  text: "你：「想起什麼？」",
                  wrap: true,
                  color: "#4A90E2",
                  margin: "md"
                },
                {
                  type: "text",
                  text: "「那天是聖誕夜。」",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "text",
                  text: "「我在閣樓縫最後一針。」",
                  wrap: true
                },
                {
                  type: "text",
                  text: "「當針穿過布料的瞬間...」",
                  wrap: true
                },
                {
                  type: "separator",
                  margin: "lg"
                },
                {
                  type: "text",
                  text: "【最終記憶】",
                  size: "sm",
                  color: "#FFD700",
                  wrap: true,
                  margin: "lg",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: "「...好了。」",
                  wrap: true,
                  size: "sm",
                  color: "#999999"
                },
                {
                  type: "text",
                  text: "【他把婚紗疊好】",
                  wrap: true,
                  size: "sm",
                  color: "#999999"
                },
                {
                  type: "text",
                  text: "「美雪...爸爸做好了。」",
                  wrap: true,
                  size: "sm",
                  color: "#999999"
                },
                {
                  type: "text",
                  text: "【他將婚紗放入衣櫃深處】",
                  wrap: true,
                  size: "sm",
                  color: "#999999"
                },
                {
                  type: "text",
                  text: "「等你回家...就會看到了...」",
                  wrap: true,
                  size: "sm",
                  color: "#999999"
                },
                {
                  type: "separator",
                  margin: "lg"
                },
                {
                  type: "text",
                  text: "【老人睜開眼】",
                  size: "sm",
                  color: "#999999",
                  wrap: true,
                  margin: "lg"
                },
                {
                  type: "text",
                  text: "淚如雨下。",
                  wrap: true
                },
                {
                  type: "text",
                  text: "「我縫好了...」",
                  wrap: true,
                  margin: "md",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: "「最後一針...我縫好了！」",
                  wrap: true,
                  weight: "bold"
                },
                {
                  type: "text",
                  text: "「美雪...」",
                  wrap: true,
                  margin: "md"
                },
                {
                  type: "text",
                  text: "「婚紗在老家閣樓的衣櫃裡。」",
                  wrap: true
                },
                {
                  type: "text",
                  text: "「白色的，純白的婚紗。」",
                  wrap: true
                },
                {
                  type: "text",
                  text: "「爸爸用最好的絲綢，和媽媽留下的蕾絲...」",
                  wrap: true
                }
              ]
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "message",
                label: "告別",
                text: "【告別】"
              },
              style: "primary",
              color: "#F57C00"
            }
          ]
        }
      }
    }
  ];
}

function handleDay3Ending(event, userId, state, userText) {
  if (userText.includes("告別") || userText.includes("再見") || userText === "【告別】") {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, getDay3Farewell());
    return;
  }
  
  // 處理其他相關輸入
  if (userText.includes("美雪") || userText.includes("婚紗") || userText.includes("女兒")) {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, {
      type: "text",
      text: "【老人淚流滿面】\n\n「美雪...爸爸做好了...」\n「婚紗在老家閣樓的衣櫃裡...」",
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "告別", text: "【告別】" }
        }]
      }
    });
    return;
  }
  
  // 預設回應 - 引導告別
  showLoadingAnimation(userId, 5);
  replyMessage(event.replyToken, {
    type: "text",
    text: "【黑貓】\n「...是時候說再見了。」\n\n【老人的身影開始發光】",
    quickReply: {
      items: [{
        type: "action",
        action: { type: "message", label: "告別", text: "【告別】" }
      }]
    }
  });
}

function getDay3Farewell() {
  return [
    {
      type: "flex",
      altText: "告別",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "【他站起身】",
              size: "sm",
              color: "#999999",
              wrap: true
            },
            {
              type: "text",
              text: "【他的身影開始發光】",
              size: "sm",
              color: "#999999",
              wrap: true,
              margin: "md"
            },
            {
              type: "text",
              text: "「謝謝你，主廚。」",
              wrap: true,
              margin: "md"
            },
            {
              type: "text",
              text: "「謝謝你讓我記起來。」",
              wrap: true
            },
            {
              type: "text",
              text: "「我以為...我一事無成就死了。」",
              wrap: true,
              margin: "md"
            },
            {
              type: "text",
              text: "「但原來...」",
              wrap: true
            },
            {
              type: "text",
              text: "「我完成了。」",
              wrap: true,
              weight: "bold"
            },
            {
              type: "separator",
              margin: "lg"
            },
            {
              type: "text",
              text: "【他化作光點】",
              size: "sm",
              color: "#999999",
              wrap: true,
              margin: "lg"
            },
            {
              type: "text",
              text: "【飄向窗外】",
              size: "sm",
              color: "#999999",
              wrap: true
            },
            {
              type: "text",
              text: "【雨停了】",
              size: "sm",
              color: "#999999",
              wrap: true
            },
            {
              type: "text",
              text: "【第一次，窗外出現了光】",
              size: "sm",
              color: "#FFD700",
              wrap: true,
              weight: "bold"
            }
          ]
        }
      }
    },
    {
      type: "flex",
      altText: "遺物",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "🎁 遺物",
              weight: "bold",
              size: "xl",
              color: "#FFD700",
              align: "center"
            },
            {
              type: "separator",
              margin: "md"
            },
            {
              type: "text",
              text: "🪡",
              size: "5xl",
              align: "center",
              margin: "lg"
            },
            {
              type: "text",
              text: "銀頂針",
              align: "center",
              weight: "bold",
              margin: "md"
            },
            {
              type: "text",
              text: "背面刻著：\n*For my dearest Miyuki*",
              align: "center",
              size: "xs",
              color: "#999999",
              wrap: true,
              margin: "md"
            }
          ]
        }
      }
    },
    {
      type: "text",
      text: "━━━━━━━━━━━━━━━\n\n【黑貓跳上吧台，看了看銀頂針】\n\n「...」\n\n「第一個客人，處理得還行。」\n\n━━━━━━━━━━━━━━━\n\n⭐ Guest 1 完結\n\n感謝遊玩！",
      quickReply: {
        items: [
          {
            type: "action",
            action: {
              type: "message",
              label: "重新開始",
              text: "重新開始"
            }
          }
        ]
      }
    }
  ];
}
