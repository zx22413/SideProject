// ⚠️ 警告：此檔案包含敏感資訊（LINE Token、Google Sheets ID）
// 請勿將此檔案上傳到公開的 Git 倉庫或分享給他人
// 建議：在正式環境中使用 Google Apps Script 的 PropertiesService 儲存敏感資訊

// 【Cloudy V1.4 完整版程式碼】
// 版本：V1.4 - 2026-01-12（核心機制實作完成）
// 狀態：✅ 技術底層打通、✅ 對話桶系統、✅ 快速回覆、✅ 標籤記憶系統、✅ 圖文選單

const SPREADSHEET_ID = '1XWl0iPO5QMVMcI8_tYLzJipGFmfiWS4lVzLgNZi6ECk';
const TOKEN = 'IADUHTu/gVHrJEXQ0YpLeUN/mIS6zhMMpwyrz9/2OqTBy8gKutxHjxIptvSrLnPI0UySJmIwYHoqoKP2zV8qL+vauBSqixT3v9QdfubKhOmlD0530gtGw/ftdGdnxSfap58MazHBZ6wFlSQ5InckXwdB04t89/1O/w1cDnyilFU=';

/**
 * 從試算表 dialogueLibrary 分頁讀取所有台詞
 * 試算表結構：Column A = key, Column B = content
 */
function getDialogueLibrary() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("dialogueLibrary");
  const data = sheet.getDataRange().getValues();
  let library = {};
  
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const content = data[i][1];
    if (key && content) {
      if (!library[key]) library[key] = [];
      library[key].push(content);
    }
  }
  return library;
}

function doPost(e) {
  try {
    const event = JSON.parse(e.postData.contents).events[0];
    const replyToken = event.replyToken;
    const userId = event.source.userId;
    const userMsg = event.message.text;

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userSheet = ss.getSheetByName("userState");
    const userData = userSheet.getDataRange().getValues();
    const library = getDialogueLibrary(); // 讀取試算表台詞

    // 1. 尋找用戶
    let userRow = -1;
    for (let i = 1; i < userData.length; i++) {
      if (userData[i][0] === userId) { userRow = i + 1; break; }
    }
    if (userRow === -1) {
      userSheet.appendRow([userId, 1, "normal", "", new Date()]);
      userRow = userSheet.getLastRow();
    }
    
    // 取得當前天數 (B欄)
    const currentDay = userSheet.getRange(userRow, 2).getValue() || 1;

    // 2. 處理「餵食」觸發
    if (userMsg === "餵食") {
      sendFeedQuickReply(replyToken);
      return;
    }

    // 3. 處理「聊天」觸發 (Day 1 選擇題)
    if (userMsg === "聊天") {
      const qKey = `day${currentDay}_chat_q`;
      const question = library[qKey] ? library[qKey][0] : "雲寶現在想不出要聊什麼...";
      sendChatQuickReply(replyToken, question);
      return;
    }

    // 4. 處理餵食結果
    if (userMsg.startsWith("[餵食-")) {
      const moodMap = { "開心": "happy", "難過": "sad", "生氣": "angry" };
      const moodText = userMsg.match(/\[餵食-(.+?)\]/)[1];
      const moodKey = moodMap[moodText] || "happy";
      
      // 更新情緒 (C欄) 與 時間 (E欄)
      userSheet.getRange(userRow, 3).setValue(moodKey);
      userSheet.getRange(userRow, 5).setValue(new Date());

      const resKey = `day${currentDay}_feed_${moodKey}`;
      const bucket = library[resKey] || library["day1_feed_happy"]; // 防呆機制
      const response = bucket[Math.floor(Math.random() * bucket.length)];
      replyToLine(replyToken, response);
      return;
    }

    // 5. 處理聊天選擇結果 (機制 B：標籤系統)
    if (userMsg.startsWith("[聊天-")) {
      const choiceText = userMsg.match(/\[聊天-(.+?)\]/)[1];
      const choiceKey = choiceText === "全部拌在一起！" ? "A" : "B";
      const tag = choiceText === "全部拌在一起！" ? "拌拌派" : "分開派";
      
      // 更新標籤欄 (D 欄)
      userSheet.getRange(userRow, 4).setValue(tag);
      userSheet.getRange(userRow, 5).setValue(new Date());

      const resKey = `day${currentDay}_chat_${choiceKey}_res`;
      const response = library[resKey] ? library[resKey][0] : "雲寶記住了！";
      replyToLine(replyToken, response);
      return;
    }

    // 其他訊息回覆
    replyToLine(replyToken, "雲寶現在還聽不懂這個... 點點選單跟我玩好嗎？☁️");

  } catch (err) {
    // 錯誤處理
  }
}

// 傳送聊天快速回覆
function sendChatQuickReply(replyToken, text) {
  const payload = {
    'replyToken': replyToken,
    'messages': [{
      'type': 'text',
      'text': text,
      'quickReply': {
        'items': [
          { 'type': 'action', 'action': { 'type': 'message', 'label': '全部拌在一起！', 'text': '[聊天-全部拌在一起！]' }},
          { 'type': 'action', 'action': { 'type': 'message', 'label': '醬飯要分開。', 'text': '[聊天-醬飯要分開。]' }}
        ]
      }
    }]
  };
  postToLine(payload);
}

// 傳送餵食快速回覆
function sendFeedQuickReply(replyToken) {
  const payload = {
    'replyToken': replyToken,
    'messages': [{
      'type': 'text',
      'text': '主人主人... 今天要餵雲寶吃什麼情緒能量？☁️',
      'quickReply': {
        'items': [
          { 'type': 'action', 'action': { 'type': 'message', 'label': '開心 ☀️', 'text': '[餵食-開心]' }},
          { 'type': 'action', 'action': { 'type': 'message', 'label': '難過 💧', 'text': '[餵食-難過]' }},
          { 'type': 'action', 'action': { 'type': 'message', 'label': '生氣 🌶️', 'text': '[餵食-生氣]' }}
        ]
      }
    }]
  };
  postToLine(payload);
}

function postToLine(payload) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify(payload)
  });
}

function replyToLine(replyToken, text) {
  postToLine({
    'replyToken': replyToken,
    'messages': [{ 'type': 'text', 'text': text }]
  });
}

function doGet(e) { return ContentService.createTextOutput("OK! 雲寶測試成功"); }
function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log("成功連接到試算表：" + ss.getSheets()[0].getName());
}
