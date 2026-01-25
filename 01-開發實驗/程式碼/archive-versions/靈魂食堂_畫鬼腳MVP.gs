// ============================================================
// 靈魂食堂 - 畫鬼腳 MVP 測試版
// 版本: 1.0
// 最後更新: 2026-01-18
// ============================================================
// 
// 功能說明:
// - 3 天 3 節點的畫鬼腳劇情
// - 9 種路徑組合（A/B/C x X/Y/Z）
// - 裝飾性標籤系統
// - 5 種主要結局
//
// Google Sheets 需求:
// - Sheet 名稱: "userState"
// - 欄位: A=userId | B=pathCode | C=lastActiveDay
// ============================================================

// ============================================================
// 配置區
// ============================================================
const SPREADSHEET_ID = '1204bJ1DWPWidrYCJlfXF9rnmyyS8vwqFWI9YZuItsoc';
const CONFIG = {
  LINE_CHANNEL_ACCESS_TOKEN: "61EF5KOcntCRoS2JtzTVYcCV4b8abGo5mWvw6OEDXDqMHHvHVLnkmzBNBMG6N8vr0UySJmIwYHoqoKP2zV8qL+vauBSqixT3v9QdfubKhOnqgeVWfIbOPheM8Gic8hj1yxV+DiBQYaN64tVnBkh2nQdB04t89/1O/w1cDnyilFU=", // 請填入你的 LINE Channel Access Token
  SHEET_NAME: "userState",
  DEBUG_MODE: true // 測試時設為 true，可以看到更多 log
};

// ============================================================
// LINE Webhook 入口
// ============================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // LINE 驗證請求可能沒有 events，直接返回成功
    if (!data.events || data.events.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({status: "ok"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const event = data.events[0];
    
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
  return ContentService.createTextOutput("靈魂食堂 Bot is running! ✅")
    .setMimeType(ContentService.MimeType.TEXT);
}

// ============================================================
// 訊息處理主邏輯
// ============================================================
function handleMessage(event) {
  const userId = event.source.userId;
  const userText = event.message.text.trim();
  
  // 獲取用戶狀態
  const state = getUserState(userId);
  
  // 特殊指令
  if (userText === "重新開始" || userText === "restart") {
    resetUser(userId);
    replyMessage(event.replyToken, getWelcomeMessage());
    return;
  }
  
  if (userText === "狀態" || userText === "status") {
    const statusMsg = state ? 
      `當前路徑: ${state.pathCode}\n當前天數: ${getCurrentDay(state.pathCode)}` :
      "尚未開始遊戲";
    replyMessage(event.replyToken, {type: "text", text: statusMsg});
    return;
  }
  
  // 新用戶 - 開始遊戲
  if (!state) {
    // 初始化用戶狀態
    updateUserState(userId, {
      pathCode: "",
      lastActiveDay: new Date().toISOString()
    });
    replyMessage(event.replyToken, getDay1Opening());
    return;
  }
  
  // 根據當前進度處理
  const currentDay = getCurrentDay(state.pathCode);
  
  if (currentDay === 0) {
    // Day 1 選擇（pathCode 為空）
    // 判斷是否為有效選項
    if (userText === "A" || userText === "B" || userText === "C" || 
        userText.includes("熱茶") || userText.includes("茶") ||
        userText.includes("毛毯") || userText.includes("毯") ||
        userText.includes("沉默") || userText.includes("不說話")) {
      handleDay1Choice(event, userId, userText);
    } else {
      // 顯示 Day 1 選擇介面
      replyMessage(event.replyToken, getDay1Opening());
    }
  } else if (currentDay === 2) {
    // Day 2: 如果用戶輸入的不是選項，顯示 Day 2 選擇介面
    if (userText === "X" || userText === "Y" || userText === "Z" || 
        userText.includes("職業") || userText.includes("工作") ||
        userText.includes("家人") || userText.includes("家庭") ||
        userText.includes("死因") || userText.includes("怎麼來")) {
      handleDay2Choice(event, userId, userText, state.pathCode);
    } else {
      // 顯示 Day 2 選擇介面
      replyMessage(event.replyToken, getDay2Choice(state.pathCode));
    }
  } else if (currentDay === 3) {
    // Day 3 自動顯示結局
    replyMessage(event.replyToken, getDay3Ending(state.pathCode));
  }
}

// ============================================================
// Postback 處理
// ============================================================
function handlePostback(event) {
  const data = event.postback.data;
  const userId = event.source.userId;
  
  if (data === "start_game") {
    resetUser(userId);
    replyMessage(event.replyToken, getDay1Opening());
  }
}

// ============================================================
// Day 1 處理邏輯
// ============================================================
function handleDay1Choice(event, userId, choice) {
  let pathCode = "";
  let flexMessage = null;
  
  // 判斷用戶選擇
  if (choice === "A" || choice.includes("熱茶") || choice.includes("茶")) {
    pathCode = "A";
    flexMessage = getDay1ResponseA();
  } else if (choice === "B" || choice.includes("毛毯") || choice.includes("毯")) {
    pathCode = "B";
    flexMessage = getDay1ResponseB();
  } else if (choice === "C" || choice.includes("沉默") || choice.includes("不說話")) {
    pathCode = "C";
    flexMessage = getDay1ResponseC();
  } else {
    // 無法識別的輸入
    replyMessage(event.replyToken, {
      type: "text",
      text: "請選擇一個選項喔：\nA. 熱茶\nB. 毛毯\nC. 沉默"
    });
    return;
  }
  
  // 更新用戶狀態
  updateUserState(userId, {
    pathCode: pathCode,
    lastActiveDay: new Date().toISOString()
  });
  
  // 回覆訊息
  replyMessage(event.replyToken, flexMessage);
}

// ============================================================
// Day 2 處理邏輯
// ============================================================
function handleDay2Choice(event, userId, choice, currentPath) {
  let secondChoice = "";
  let flexMessage = null;
  
  // 判斷用戶選擇
  if (choice === "X" || choice.includes("職業") || choice.includes("工作")) {
    secondChoice = "X";
    flexMessage = getDay2ResponseX(currentPath);
  } else if (choice === "Y" || choice.includes("家人") || choice.includes("家庭")) {
    secondChoice = "Y";
    flexMessage = getDay2ResponseY(currentPath);
  } else if (choice === "Z" || choice.includes("死因") || choice.includes("怎麼來")) {
    secondChoice = "Z";
    flexMessage = getDay2ResponseZ(currentPath);
  } else {
    replyMessage(event.replyToken, {
      type: "text",
      text: "請選擇一個選項喔：\nX. 問職業\nY. 問家人\nZ. 問死因"
    });
    return;
  }
  
  // 更新完整路徑
  const fullPath = currentPath + "-" + secondChoice;
  updateUserState(userId, {
    pathCode: fullPath,
    lastActiveDay: new Date().toISOString()
  });
  
  // 回覆訊息
  replyMessage(event.replyToken, flexMessage);
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
        Logger.log("找到用戶: " + userId + ", pathCode: " + data[i][1]);
        return {
          userId: data[i][0],
          pathCode: data[i][1] || "",
          lastActiveDay: data[i][2] || ""
        };
      }
    }
    Logger.log("用戶不存在: " + userId);
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
        if (updates.pathCode !== undefined) sheet.getRange(i + 1, 2).setValue(updates.pathCode);
        if (updates.lastActiveDay !== undefined) sheet.getRange(i + 1, 3).setValue(updates.lastActiveDay);
        found = true;
        Logger.log("更新用戶: " + userId + ", pathCode: " + updates.pathCode);
        break;
      }
    }
    
    if (!found) {
      sheet.appendRow([userId, updates.pathCode || "", updates.lastActiveDay || ""]);
      Logger.log("新增用戶: " + userId + ", pathCode: " + updates.pathCode);
    }
  } catch (error) {
    Logger.log("updateUserState 錯誤: " + error);
  }
}

function resetUser(userId) {
  updateUserState(userId, {
    pathCode: "",
    lastActiveDay: new Date().toISOString()
  });
}

function getCurrentDay(pathCode) {
  if (!pathCode || pathCode === "") return 0; // 新用戶
  if (pathCode.length === 1) return 2; // "A" → 已選擇 Day 1，進入 Day 2
  if (pathCode.length === 3) return 3; // "A-X" → 已選擇 Day 2，進入 Day 3
  return 3;
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
// Day 0: 歡迎訊息
// ============================================================
function getWelcomeMessage() {
  return {
    type: "text",
    text: "歡迎來到靈魂食堂 🌧️\n\n在生與死的交界，有一間永遠下著雨的食堂...\n\n準備好開始了嗎？",
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "message",
            label: "🍽️ 開始",
            text: "開始"
          }
        }
      ]
    }
  };
}

// ============================================================
// Day 1: 開場
// ============================================================
function getDay1Opening() {
  return {
    type: "text",
    text: "🌧️ Day 1 - 初遇\n\n━━━━━━━━━━━━━━━\n\n雨夜，食堂的門被推開...\n\n一位老人踉蹌走入，渾身濕透。他的手指僵硬地彎曲著，像凍僵的樹枝。\n\n【Mr. Needle】\n「好冷...這裡是哪裡？」\n「我的手...動不了了...」\n「我是...我是誰？」\n\n━━━━━━━━━━━━━━━\n\n你看著這位顫抖的老人。\n作為食堂主人，你決定...",
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "message",
            label: "☕ 遞上熱茶",
            text: "A"
          }
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "🧣 拿毛毯給他",
            text: "B"
          }
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "🤐 保持沉默",
            text: "C"
          }
        }
      ]
    }
  };
}

// ============================================================
// Day 1: 路徑 A - 熱茶
// ============================================================
function getDay1ResponseA() {
  return {
    type: "flex",
    altText: "你遞上一杯熱茶",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "✨ 路徑A：溫暖",
            weight: "bold",
            size: "lg",
            color: "#FF6B6B"
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
                text: "[你默默遞上一杯冒著蒸氣的熱茶]",
                size: "sm",
                color: "#999999",
                wrap: true
              },
              {
                type: "text",
                text: "【Mr. Needle 顫抖的手捧起茶杯】",
                size: "sm",
                color: "#666666",
                wrap: true
              },
              {
                type: "text",
                text: "「這溫度...像...像母親的手...」",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「她總是在冬天煮熱茶給我...」",
                wrap: true
              },
              {
                type: "text",
                text: "「那時我的手還能...還能...」",
                wrap: true
              },
              {
                type: "text",
                text: "[他看著自己僵硬的手指，困惑地皺眉]",
                size: "sm",
                color: "#999999",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「我的手...是用來做什麼的？」",
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
                text: "📦 收集到的記憶碎片",
                weight: "bold",
                size: "sm"
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "🏷️",
                    size: "sm",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: "#溫暖",
                    size: "sm",
                    color: "#FF6B6B",
                    flex: 1
                  }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "🏷️",
                    size: "sm",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: "#母愛",
                    size: "sm",
                    color: "#FFB6C1",
                    flex: 1
                  }
                ]
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: "💭 明天再來，或許他會想起更多...",
            size: "xs",
            color: "#999999",
            margin: "lg",
            wrap: true
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
              label: "明天見",
              text: "明天"
            },
            style: "primary",
            color: "#FF6B6B"
          }
        ]
      }
    }
  };
}

// ============================================================
// Day 1: 路徑 B - 毛毯
// ============================================================
function getDay1ResponseB() {
  return {
    type: "flex",
    altText: "你拿毛毯給他",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "✨ 路徑B：直接",
            weight: "bold",
            size: "lg",
            color: "#4ECDC4"
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
                text: "[你拿起毛毯，輕輕蓋在他肩上]",
                size: "sm",
                color: "#999999",
                wrap: true
              },
              {
                type: "text",
                text: "【Mr. Needle 摸著毛毯的質地】",
                size: "sm",
                color: "#666666",
                wrap: true
              },
              {
                type: "text",
                text: "「謝謝...但我不冷。」",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「我只是在想...一件很重要的事。」",
                wrap: true
              },
              {
                type: "text",
                text: "「和【布料】有關的事...」",
                wrap: true
              },
              {
                type: "text",
                text: "[他的眼神變得專注，盯著自己的手]",
                size: "sm",
                color: "#999999",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「我記得...我在縫什麼東西。」",
                wrap: true
              },
              {
                type: "text",
                text: "「銀色的針，白色的線...」",
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
                text: "📦 收集到的記憶碎片",
                weight: "bold",
                size: "sm"
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "🏷️",
                    size: "sm",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: "#理性",
                    size: "sm",
                    color: "#4ECDC4",
                    flex: 1
                  }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "🏷️",
                    size: "sm",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: "#針線",
                    size: "sm",
                    color: "#95E1D3",
                    flex: 1
                  }
                ]
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: "💭 明天再來，或許他會想起更多...",
            size: "xs",
            color: "#999999",
            margin: "lg",
            wrap: true
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
              label: "明天見",
              text: "明天"
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
// Day 1: 路徑 C - 沉默
// ============================================================
function getDay1ResponseC() {
  return {
    type: "flex",
    altText: "你保持沉默",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "✨ 路徑C：冷漠",
            weight: "bold",
            size: "lg",
            color: "#95A5A6"
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
                text: "[你站在吧台後，靜靜觀察]",
                size: "sm",
                color: "#999999",
                wrap: true
              },
              {
                type: "text",
                text: "【Mr. Needle 自言自語】",
                size: "sm",
                color: "#666666",
                wrap: true
              },
              {
                type: "text",
                text: "「......沒人嗎？」",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「也對，我早就習慣一個人了...」",
                wrap: true
              },
              {
                type: "text",
                text: "「在那個小小的工作室裡...」",
                wrap: true
              },
              {
                type: "text",
                text: "「只有我和針線...」",
                wrap: true
              },
              {
                type: "text",
                text: "[他的聲音越來越小]",
                size: "sm",
                color: "#999999",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「......你不說話也好。」",
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
                text: "📦 收集到的記憶碎片",
                weight: "bold",
                size: "sm"
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "🏷️",
                    size: "sm",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: "#孤獨",
                    size: "sm",
                    color: "#95A5A6",
                    flex: 1
                  }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "🏷️",
                    size: "sm",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: "#距離",
                    size: "sm",
                    color: "#BDC3C7",
                    flex: 1
                  }
                ]
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: "💭 明天再來，或許他還願意說話...",
            size: "xs",
            color: "#999999",
            margin: "lg",
            wrap: true
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
              label: "明天見",
              text: "明天"
            },
            style: "primary",
            color: "#95A5A6"
          }
        ]
      }
    }
  };
}

// ============================================================
// Day 2: 開場（根據 Day 1 路徑）
// ============================================================
function getDay2Opening(previousPath) {
  const openings = {
    "A": "【Mr. Needle 看著你】\n「是你昨天給我熱茶的對吧？」\n「我...想起了一些事。」",
    "B": "【Mr. Needle 點了點頭】\n「謝謝你昨天的毛毯。」\n「我想起了一些事...」",
    "C": "【Mr. Needle 獨自坐著】\n「......」\n「我想起了一些事...」"
  };
  
  return openings[previousPath] || openings["A"];
}

// ============================================================
// Day 2: 路徑 X - 問職業
// ============================================================
function getDay2ResponseX(previousPath) {
  const opening = getDay2Opening(previousPath);
  
  return {
    type: "flex",
    altText: "Day 2 - 他想起了職業",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🌧️ Day 2 - 記憶",
            weight: "bold",
            size: "lg"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "text",
            text: opening,
            wrap: true,
            margin: "lg",
            size: "sm"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "[你決定問他...]",
                size: "sm",
                color: "#999999",
                wrap: true
              },
              {
                type: "text",
                text: "「你最驕傲的作品是什麼？」",
                wrap: true,
                color: "#4A90E2",
                margin: "md"
              },
              {
                type: "separator",
                margin: "md"
              },
              {
                type: "text",
                text: "【Mr. Needle 的眼神亮起】",
                size: "sm",
                color: "#666666",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「我的作品...？」",
                wrap: true
              },
              {
                type: "text",
                text: "「我是個裁縫。對，我記起來了。」",
                wrap: true
              },
              {
                type: "text",
                text: "「我縫過很多衣服...西裝、大衣、襯衫...」",
                wrap: true
              },
              {
                type: "text",
                text: "「那根【銀色的針】...跟了我一輩子。」",
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
                text: "📦 新的記憶碎片",
                weight: "bold",
                size: "sm"
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "🏷️",
                    size: "sm",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: "#針",
                    size: "sm",
                    color: "#C0C0C0",
                    flex: 1
                  }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "🏷️",
                    size: "sm",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: "#技藝",
                    size: "sm",
                    color: "#8B4513",
                    flex: 1
                  }
                ]
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: "💭 明天，該為他準備最後的料理了...",
            size: "xs",
            color: "#999999",
            margin: "lg",
            wrap: true
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
              label: "準備料理",
              text: "準備料理"
            },
            style: "primary"
          }
        ]
      }
    }
  };
}

// ============================================================
// Day 2: 路徑 Y - 問家人
// ============================================================
function getDay2ResponseY(previousPath) {
  const opening = getDay2Opening(previousPath);
  
  return {
    type: "flex",
    altText: "Day 2 - 他想起了女兒",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🌧️ Day 2 - 記憶",
            weight: "bold",
            size: "lg"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "text",
            text: opening,
            wrap: true,
            margin: "lg",
            size: "sm"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "[你決定問他...]",
                size: "sm",
                color: "#999999",
                wrap: true
              },
              {
                type: "text",
                text: "「那件作品...是給誰的？」",
                wrap: true,
                color: "#4A90E2",
                margin: "md"
              },
              {
                type: "separator",
                margin: "md"
              },
              {
                type: "text",
                text: "【Mr. Needle 的眼神變得柔和】",
                size: "sm",
                color: "#666666",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「給誰的...？」",
                wrap: true
              },
              {
                type: "text",
                text: "「啊...是給...給一個很重要的人...」",
                wrap: true
              },
              {
                type: "text",
                text: "[他閉上眼睛，努力回憶]",
                size: "sm",
                color: "#999999",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「她笑起來像...像【蜜糖】一樣甜。」",
                wrap: true
              },
              {
                type: "text",
                text: "「她小時候總是躲在我的工作室裡玩針線...」",
                wrap: true
              },
              {
                type: "text",
                text: "「她說：爸爸，我結婚的時候，你要幫我做最美的婚紗！」",
                wrap: true
              },
              {
                type: "text",
                text: "[他的聲音開始顫抖]",
                size: "sm",
                color: "#999999",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「婚紗...對，我在縫婚紗...」",
                wrap: true
              },
              {
                type: "text",
                text: "「但我...我縫完了嗎？」",
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
                text: "📦 新的記憶碎片",
                weight: "bold",
                size: "sm"
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "🏷️",
                    size: "sm",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: "#女兒",
                    size: "sm",
                    color: "#FFB6C1",
                    flex: 1
                  }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "🏷️",
                    size: "sm",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: "#蜜糖",
                    size: "sm",
                    color: "#FFD700",
                    flex: 1
                  }
                ]
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: "💔 他記起了女兒，但記憶還不完整...\n明天，該為他準備最後的料理了...",
            size: "xs",
            color: "#999999",
            margin: "lg",
            wrap: true
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
              label: "準備料理",
              text: "準備料理"
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
// Day 2: 路徑 Z - 問死因
// ============================================================
function getDay2ResponseZ(previousPath) {
  const opening = getDay2Opening(previousPath);
  
  return {
    type: "flex",
    altText: "Day 2 - 他想起了死亡",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🌧️ Day 2 - 記憶",
            weight: "bold",
            size: "lg"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "text",
            text: opening,
            wrap: true,
            margin: "lg",
            size: "sm"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "[你決定問他...]",
                size: "sm",
                color: "#999999",
                wrap: true
              },
              {
                type: "text",
                text: "「你記得自己怎麼來這裡的嗎？」",
                wrap: true,
                color: "#4A90E2",
                margin: "md"
              },
              {
                type: "separator",
                margin: "md"
              },
              {
                type: "text",
                text: "【Mr. Needle 顫抖起來】",
                size: "sm",
                color: "#666666",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「來這裡...？」",
                wrap: true
              },
              {
                type: "text",
                text: "「雪...對，有很多【雪】...」",
                wrap: true
              },
              {
                type: "text",
                text: "「雪山上...我迷路了...」",
                wrap: true
              },
              {
                type: "text",
                text: "「我要去找...找什麼？」",
                wrap: true
              },
              {
                type: "text",
                text: "「我的手...越來越冷...動不了了...」",
                wrap: true
              },
              {
                type: "text",
                text: "[他抱住自己，瑟瑟發抖]",
                size: "sm",
                color: "#999999",
                wrap: true,
                margin: "md"
              },
              {
                type: "text",
                text: "「好冷...真的好冷...」",
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
                text: "📦 新的記憶碎片",
                weight: "bold",
                size: "sm"
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "🏷️",
                    size: "sm",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: "#雪",
                    size: "sm",
                    color: "#E0F7FA",
                    flex: 1
                  }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "🏷️",
                    size: "sm",
                    flex: 0
                  },
                  {
                    type: "text",
                    text: "#死亡",
                    size: "sm",
                    color: "#546E7A",
                    flex: 1
                  }
                ]
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: "❄️ 他想起了死亡的寒冷...\n明天，該為他準備最後的料理了...",
            size: "xs",
            color: "#999999",
            margin: "lg",
            wrap: true
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
              label: "準備料理",
              text: "準備料理"
            },
            style: "primary",
            color: "#546E7A"
          }
        ]
      }
    }
  };
}

// Day 2 選擇介面
function getDay2Choice(previousPath) {
  return {
    type: "text",
    text: "[他的手指輕輕摩擦著桌面，像在回憶某種觸感]\n\n「我的手...是用來縫東西的。」\n「我是個裁縫。一個很普通的裁縫。」\n「但有一件作品...我必須完成...」\n\n你決定問他...",
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "message",
            label: "🪡 問他的職業",
            text: "X"
          }
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "👨‍👧 問他的家人",
            text: "Y"
          }
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "❄️ 問死亡原因",
            text: "Z"
          }
        }
      ]
    }
  };
}

// ============================================================
// Day 3: 結局生成
// ============================================================
function getDay3Ending(pathCode) {
  const endings = {
    "A-X": getEndingAX(),
    "A-Y": getEndingAY(),  // 完美結局
    "A-Z": getEndingAZ(),
    "B-X": getEndingBX(),
    "B-Y": getEndingBY(),  // 完美結局
    "B-Z": getEndingBZ(),
    "C-X": getEndingCX(),
    "C-Y": getEndingCY(),
    "C-Z": getEndingCZ()
  };
  
  return endings[pathCode] || endings["A-X"];
}

// A-X: 溫暖針線湯 - 普通結局
function getEndingAX() {
  return {
    type: "flex",
    altText: "結局：溫暖針線湯",
    contents: {
      type: "bubble",
      hero: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🍜",
            size: "5xl",
            align: "center"
          }
        ],
        backgroundColor: "#FF6B6B20",
        paddingAll: "lg"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "溫暖針線湯",
            weight: "bold",
            size: "xl",
            color: "#FF6B6B"
          },
          {
            type: "text",
            text: "標籤：#溫暖 #針",
            size: "xs",
            color: "#999999",
            margin: "sm"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "text",
            text: "你端上一碗熱湯。\n湯裡飄著針線的影子。",
            wrap: true,
            margin: "lg",
            size: "sm"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "【Mr. Needle 喝了一口】",
                size: "sm",
                color: "#666666"
              },
              {
                type: "text",
                text: "「我記起來了...」",
                wrap: true
              },
              {
                type: "text",
                text: "「我是個裁縫。」",
                wrap: true
              },
              {
                type: "text",
                text: "「我縫過很多衣服...」",
                wrap: true
              },
              {
                type: "text",
                text: "[他看著自己的手，露出平靜的笑容]",
                size: "sm",
                color: "#999999",
                margin: "md"
              },
              {
                type: "text",
                text: "「這雙手...做過不少事呢。」",
                wrap: true
              },
              {
                type: "text",
                text: "「謝謝你，主廚。」",
                wrap: true
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: "[他的身影化作淡淡的光點，飄向窗外]",
            size: "sm",
            color: "#999999",
            margin: "lg",
            wrap: true
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: "✨ 普通結局",
                weight: "bold",
                size: "sm"
              },
              {
                type: "text",
                text: "🎁 遺物：彩色線團",
                size: "xs",
                color: "#999999"
              }
            ]
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "button",
            action: {
              type: "message",
              label: "試試其他結局",
              text: "重新開始"
            },
            style: "link"
          }
        ]
      }
    }
  };
}

// A-Y: 母愛蜜糖湯 - 完美結局 ⭐
function getEndingAY() {
  return {
    type: "flex",
    altText: "完美結局：母愛蜜糖湯",
    contents: {
      type: "bubble",
      hero: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "⭐",
            size: "5xl",
            align: "center"
          }
        ],
        backgroundColor: "#FFD70020",
        paddingAll: "lg"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "⭐ 母愛蜜糖湯",
            weight: "bold",
            size: "xl",
            color: "#FFD700"
          },
          {
            type: "text",
            text: "標籤：#溫暖 #蜜糖 #女兒",
            size: "xs",
            color: "#999999",
            margin: "sm"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "text",
            text: "你端上一碗特別的湯。\n湯色金黃，帶著蜜糖的甜香，\n還有母親懷抱般的溫暖。",
            wrap: true,
            margin: "lg",
            size: "sm"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "【Mr. Needle 喝了一口，眼眶濕潤】",
                size: "sm",
                color: "#666666"
              },
              {
                type: "text",
                text: "「我記起來了...全部記起來了！」",
                wrap: true
              },
              {
                type: "text",
                text: "「婚紗！我在縫婚紗！」",
                wrap: true
              },
              {
                type: "text",
                text: "「是給我女兒的婚紗...」",
                wrap: true
              },
              {
                type: "text",
                text: "[他閉上眼睛，淚水滑落]",
                size: "sm",
                color: "#999999",
                margin: "md"
              },
              {
                type: "text",
                text: "「我縫完了。就放在老家閣樓的箱子裡。」",
                wrap: true
              },
              {
                type: "text",
                text: "「雖然我沒能親手交給她...」",
                wrap: true
              },
              {
                type: "text",
                text: "「但她會找到的，對吧？」",
                wrap: true
              },
              {
                type: "text",
                text: "[他露出安心的笑容]",
                size: "sm",
                color: "#999999",
                margin: "md"
              },
              {
                type: "text",
                text: "「謝謝你，主廚。」",
                wrap: true
              },
              {
                type: "text",
                text: "「最後一針...我縫好了。」",
                wrap: true
              },
              {
                type: "text",
                text: "「她一定很美...穿著那件婚紗...」",
                wrap: true
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: "[他的身影化作銀色光點，飄向窗外的雨幕]",
            size: "sm",
            color: "#999999",
            margin: "lg",
            wrap: true
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: "⭐ 完美結局！",
                weight: "bold",
                size: "sm",
                color: "#FFD700"
              },
              {
                type: "text",
                text: "🎁 遺物：銀頂針",
                size: "xs",
                color: "#999999"
              },
              {
                type: "text",
                text: "「背面刻著：For my dearest」",
                size: "xxs",
                color: "#999999"
              }
            ]
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "button",
            action: {
              type: "message",
              label: "試試其他結局",
              text: "重新開始"
            },
            style: "link"
          }
        ]
      }
    }
  };
}

// A-Z: 冬日暖心湯 - 普通結局
function getEndingAZ() {
  return {
    type: "flex",
    altText: "結局：冬日暖心湯",
    contents: {
      type: "bubble",
      hero: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "☕",
            size: "5xl",
            align: "center"
          }
        ],
        backgroundColor: "#4A90E220",
        paddingAll: "lg"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "冬日暖心湯",
            weight: "bold",
            size: "xl",
            color: "#4A90E2"
          },
          {
            type: "text",
            text: "標籤：#溫暖 #雪",
            size: "xs",
            color: "#999999",
            margin: "sm"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "text",
            text: "你端上一碗熱湯。\n湯裡融化著雪的記憶。",
            wrap: true,
            margin: "lg",
            size: "sm"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "【Mr. Needle 捧著熱湯】",
                size: "sm",
                color: "#666666"
              },
              {
                type: "text",
                text: "「啊...我記起來了...」",
                wrap: true
              },
              {
                type: "text",
                text: "「雪山上...我迷路了...」",
                wrap: true
              },
              {
                type: "text",
                text: "「手越來越冷...然後就...」",
                wrap: true
              },
              {
                type: "text",
                text: "[他放下湯碗，平靜地看著窗外]",
                size: "sm",
                color: "#999999",
                margin: "md"
              },
              {
                type: "text",
                text: "「原來...我已經死了。」",
                wrap: true
              },
              {
                type: "text",
                text: "「謝謝你的湯。很溫暖。」",
                wrap: true
              },
              {
                type: "text",
                text: "「我該走了。」",
                wrap: true
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: "[他釋然地離去]",
            size: "sm",
            color: "#999999",
            margin: "lg",
            wrap: true
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: "✨ 普通結局",
                weight: "bold",
                size: "sm"
              },
              {
                type: "text",
                text: "🎁 遺物：溫暖的石頭",
                size: "xs",
                color: "#999999"
              }
            ]
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "button",
            action: {
              type: "message",
              label: "試試其他結局",
              text: "重新開始"
            },
            style: "link"
          }
        ]
      }
    }
  };
}

// B-Y: 家族傳承餐 - 完美結局 ⭐
function getEndingBY() {
  return {
    type: "flex",
    altText: "完美結局：家族傳承餐",
    contents: {
      type: "bubble",
      hero: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "⭐",
            size: "5xl",
            align: "center"
          }
        ],
        backgroundColor: "#FFD70020",
        paddingAll: "lg"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "⭐ 家族傳承餐",
            weight: "bold",
            size: "xl",
            color: "#FFD700"
          },
          {
            type: "text",
            text: "標籤：#理性 #針線 #女兒",
            size: "xs",
            color: "#999999",
            margin: "sm"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "text",
            text: "你端上一份精緻的料理。\n每一針、每一線，\n都是傳承的味道。",
            wrap: true,
            margin: "lg",
            size: "sm"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "【Mr. Needle 品嚐著料理】",
                size: "sm",
                color: "#666666"
              },
              {
                type: "text",
                text: "「這味道...是技藝，是傳承。」",
                wrap: true
              },
              {
                type: "text",
                text: "「我想起來了...婚紗！」",
                wrap: true
              },
              {
                type: "text",
                text: "「我在為女兒縫婚紗...」",
                wrap: true
              },
              {
                type: "text",
                text: "「每一針都是我教她的手法。」",
                wrap: true
              },
              {
                type: "text",
                text: "「雖然我沒能親眼看到她穿上...」",
                wrap: true
              },
              {
                type: "text",
                text: "「但這份技藝...已經傳給她了。」",
                wrap: true
              },
              {
                type: "text",
                text: "[他露出欣慰的笑容]",
                size: "sm",
                color: "#999999",
                margin: "md"
              },
              {
                type: "text",
                text: "「田中家的針線活...會一直傳下去的。」",
                wrap: true
              }
            ]
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: "[他滿足地化作光點]",
            size: "sm",
            color: "#999999",
            margin: "lg",
            wrap: true
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: "⭐ 完美結局！",
                weight: "bold",
                size: "sm",
                color: "#FFD700"
              },
              {
                type: "text",
                text: "🎁 遺物：銀頂針",
                size: "xs",
                color: "#999999"
              }
            ]
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "button",
            action: {
              type: "message",
              label: "試試其他結局",
              text: "重新開始"
            },
            style: "link"
          }
        ]
      }
    }
  };
}

// 剩餘結局的簡化版本（可根據需要擴充）
function getEndingBX() {
  return {type: "text", text: "結局 B-X: 理性縫線餐\n\n他平靜地想起了自己的職業，安詳離去。\n\n遺物：織布樣本"};
}

function getEndingBZ() {
  return {type: "text", text: "結局 B-Z: 寒冬清醒湯\n\n記憶混亂，他困惑地離去。\n\n遺物：冰冷的針"};
}

function getEndingCX() {
  return {type: "text", text: "結局 C-X: 孤獨針線飯\n\n他未能解開心結，困惑離去。\n\n遺物：生鏽的針"};
}

function getEndingCY() {
  return {type: "text", text: "結局 C-Y: 無言的思念\n\n他想起了女兒，但為時已晚...悲傷離去。\n\n遺物：褪色的線"};
}

function getEndingCZ() {
  return {type: "text", text: "結局 C-Z: 冰冷的真相\n\n他絕望地面對死亡的真相。\n\n遺物：冰碎片"};
}

// ============================================================
// 測試用函數
// ============================================================
function testGetUserState() {
  Logger.log(getUserState("test123"));
}

function testDay1() {
  Logger.log(JSON.stringify(getDay1Opening()));
}

function testDay1ResponseA() {
  Logger.log(JSON.stringify(getDay1ResponseA()));
}
