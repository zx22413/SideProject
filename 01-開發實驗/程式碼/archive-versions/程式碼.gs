// ==========================================
// 靈魂食堂 V1.4 - 核心重構版本 (2026-01-16)
// ==========================================
// 架構：標籤驅動 (Tag-driven) + 情緒映射 (Mood-mapping)
// 參考：Bird Alone 記憶感、黃昏旅店章節鎖定、紅弦俱樂部情緒控制

// ⚠️ 警告：此檔案包含敏感資訊（LINE Token、Google Sheets ID）
// 請勿將此檔案上傳到公開的 Git 倉庫或分享給他人
// 建議：在正式環境中使用 Google Apps Script 的 PropertiesService 儲存敏感資訊

const SPREADSHEET_ID = '1XWl0iPO5QMVMcI8_tYLzJipGFmfiWS4lVzLgNZi6ECk';
const TOKEN = 'IADUHTu/gVHrJEXQ0YpLeUN/mIS6zhMMpwyrz9/2OqTBy8gKutxHjxIptvSrLnPI0UySJmIwYHoqoKP2zV8qL+vauBSqixT3v9QdfubKhOmlD0530gtGw/ftdGdnxSfap58MazHBZ6wFlSQ5InckXwdB04t89/1O/w1cDnyilFU=';

// 調試模式開關：設為 true 時可跳過跨日檢查
const IS_DEBUG_MODE = true;

// 欄位定義：6欄位數據結構
const COL = { 
  ID: 1,        // A欄：userId
  DAY: 2,       // B欄：currentDay
  MOOD: 3,      // C欄：currentMood
  TAGS: 4,      // D欄：collectedTags (JSON)
  TIME: 5,      // E欄：lastActive
  PHASE: 6      // F欄：phase
};

/**
 * 從試算表 dialogueLibrary 分頁讀取所有台詞
 * 使用快取機制加速（從 10 秒降至 1 秒內）
 * 快取有效期：6 小時
 */
function getDialogueLibrary() {
  const cache = CacheService.getScriptCache();
  const cacheKey = "dialogueLibrary_v1";
  
  // 嘗試從快取讀取
  const cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 快取未命中，從試算表讀取
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("dialogueLibrary");
  if (!sheet) {
    Logger.log("警告：dialogueLibrary Sheet 不存在");
    return {};
  }
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
  
  // 存入快取（6 小時）
  cache.put(cacheKey, JSON.stringify(library), 21600);
  
  return library;
}

/**
 * 清除台詞庫快取（修改台詞後執行）
 */
function clearDialogueCache() {
  const cache = CacheService.getScriptCache();
  cache.remove("dialogueLibrary_v1");
  Logger.log("✅ 台詞庫快取已清除");
}

/**
 * 獲取用戶狀態（6欄位結構）
 * 優化版：使用 TextFinder 加速查找（比遍歷快 5-10 倍）
 */
function getUserState(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("userState") || ss.insertSheet("userState");
  
  // 設定表頭（僅首次建立時）
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["userId", "currentDay", "currentMood", "collectedTags", "lastActive", "phase"]);
  }
  
  // 使用 TextFinder 快速定位（取代慢速迴圈）
  const finder = sheet.createTextFinder(userId).matchEntireCell(true);
  const searchResult = finder.findNext();
  
  if (searchResult) {
    const row = searchResult.getRow();
    const data = sheet.getRange(row, 1, 1, 6).getValues()[0];
    
    return {
      row: row,
      userId: data[COL.ID - 1],
      currentDay: data[COL.DAY - 1] || 1,
      currentMood: data[COL.MOOD - 1] || "Neutral",
      collectedTags: JSON.parse(data[COL.TAGS - 1] || "[]"),
      lastActive: data[COL.TIME - 1] ? new Date(data[COL.TIME - 1]) : null,
      phase: data[COL.PHASE - 1] || "START"
    };
  }
  
  // 新用戶初始化
  const newUser = [
    userId,
    1,                    // currentDay
    "Neutral",            // currentMood
    "[]",                 // collectedTags (空陣列)
    new Date(),           // lastActive
    "START"               // phase
  ];
  sheet.appendRow(newUser);
  
  // 直接返回新用戶狀態（避免遞迴）
  return {
    row: sheet.getLastRow(),
    userId: userId,
    currentDay: 1,
    currentMood: "Neutral",
    collectedTags: [],
    lastActive: new Date(),
    phase: "START"
  };
}

/**
 * 保存用戶狀態（6欄位結構）
 */
function saveUserState(state) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("userState");
  
  // 確保 collectedTags 是 JSON 字串
  const tagsJson = Array.isArray(state.collectedTags) 
    ? JSON.stringify(state.collectedTags) 
    : state.collectedTags || "[]";
  
  sheet.getRange(state.row, COL.ID, 1, 6).setValues([[
    state.userId,
    state.currentDay,
    state.currentMood,
    tagsJson,
    new Date(),
    state.phase
  ]]);
}

/**
 * 跨日進度檢查（黃昏旅店機制）
 * 檢查玩家是否可以在當前日期進行下一階段
 */
function canProgress(state) {
  if (IS_DEBUG_MODE) {
    return { canProgress: true };
  }
  
  // 如果尚未完成今日，允許繼續
  if (state.phase !== "COMPLETED_TODAY") {
    return { canProgress: true };
  }
  
  // 如果已完成今日，檢查是否跨日
  if (!state.lastActive) {
    return { canProgress: true };
  }
  
  const now = new Date();
  const lastActiveDate = new Date(state.lastActive);
  
  // 檢查是否為同一天
  const isSameDay = now.getDate() === lastActiveDate.getDate() &&
                    now.getMonth() === lastActiveDate.getMonth() &&
                    now.getFullYear() === lastActiveDate.getFullYear();
  
  if (isSameDay) {
    return {
      canProgress: false,
      message: "靈魂正在消化剛才的味道... ☁️\n請明天再來吧。"
    };
  }
  
  // 跨日：自動推進到下一日
  return { 
    canProgress: true,
    shouldAdvanceDay: true
  };
}

/**
 * 動態台詞檢索（標籤驅動）
 * 根據 (day, mood, phase) 複合條件檢索 dialogueLibrary
 */
function findDialogue(day, mood, phase, library) {
  // 優先搜尋完全匹配的 key
  const keys = [
    `day${day}_${mood}_${phase}`,
    `day${day}_${phase}_${mood}`,
    `day${day}_${phase}`,
    `day${day}_${mood}`,
    `day${day}_default`
  ];
  
  for (let key of keys) {
    if (library[key] && library[key].length > 0) {
      const bucket = library[key];
      return bucket[Math.floor(Math.random() * bucket.length)];
    }
  }
  
  // 防呆機制：返回預設訊息
  return "靈魂靜靜地看著你，似乎在想些什麼... ☁️";
}

/**
 * 主處理函數：LINE Webhook 接收
 */
function doPost(e) {
  try {
    const event = JSON.parse(e.postData.contents).events[0];
    const { replyToken, source: { userId }, message: { text: userMsg } } = event;
    
    // 取得用戶狀態
    let state = getUserState(userId);
    
    // 取得台詞庫
    const library = getDialogueLibrary();
    
    // 1. 跨日與進度檢查（黃昏旅店機制）
    const progressCheck = canProgress(state);
    if (!progressCheck.canProgress) {
      replyToLine(replyToken, progressCheck.message);
      return;
    }
    
    // 若跨日，自動推進
    if (progressCheck.shouldAdvanceDay) {
      state.currentDay += 1;
      state.phase = "START";
      saveUserState(state);
    }
    
    // 2. 餵食邏輯（紅弦模式：更新 Mood）
    if (userMsg === "餵食") {
      sendFeedQuickReply(replyToken);
      return;
    }
    
    if (userMsg.startsWith("[餵食-")) {
      const match = userMsg.match(/\[餵食-(.+?)\]/);
      if (match) {
        const moodText = match[1];
        // 情緒映射：中文 → 英文代碼
        const moodMap = {
          "開心": "Sweet",
          "難過": "Bitter",
          "生氣": "Spicy"
        };
        state.currentMood = moodMap[moodText] || "Neutral";
        state.phase = "AFTER_FEED";
        saveUserState(state);
        
        // 動態檢索台詞
        const dialogue = findDialogue(state.currentDay, state.currentMood, state.phase, library);
        replyToLine(replyToken, dialogue);
      }
      return;
    }
    
    // 3. 聊天邏輯（Bird Alone 模式：累積 Tags）
    if (userMsg === "聊天") {
      const qKey = `day${state.currentDay}_chat_q`;
      const question = library[qKey] ? library[qKey][0] : "你想聊些什麼呢？";
      sendChatQuickReply(replyToken, question);
      return;
    }
    
    if (userMsg.startsWith("[聊天-")) {
      const match = userMsg.match(/\[聊天-(.+?)\]/);
      if (match) {
        const choice = match[1];
        
        // 標籤持久化：累加存入 collectedTags，不覆蓋舊標籤
        // 標籤格式：{mood}_{choice}
        const newTag = `${state.currentMood}_${choice}`;
        
        // 確保 collectedTags 是陣列
        if (!Array.isArray(state.collectedTags)) {
          state.collectedTags = [];
        }
        
        // 累加標籤（不重複）
        if (!state.collectedTags.includes(newTag)) {
          state.collectedTags.push(newTag);
        }
        
        state.phase = "COMPLETED_TODAY";
        saveUserState(state);
        
        // 動態檢索回應台詞
        const resKey = `day${state.currentDay}_chat_res`;
        const response = library[resKey] ? library[resKey][0] : "我記住了... ☁️";
        replyToLine(replyToken, response);
      }
      return;
    }
    
    // 其他訊息回覆
    replyToLine(replyToken, "靈魂靜靜地看著你... 請使用選單互動吧 ☁️");
    
  } catch (err) {
    Logger.log("錯誤：" + err.toString());
    // 靜默處理錯誤，避免暴露系統資訊
  }
}

/**
 * 傳送聊天快速回覆
 */
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

/**
 * 傳送餵食快速回覆
 */
function sendFeedQuickReply(replyToken) {
  const payload = {
    'replyToken': replyToken,
    'messages': [{
      'type': 'text',
      'text': '主人主人... 今天要餵靈魂什麼情緒能量？☁️',
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

/**
 * 傳送訊息到 LINE
 */
function postToLine(payload) {
  const options = {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };
  
  // 移除預設的等待時間，立即回應
  return UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', options);
}

/**
 * 改良版回覆函數：將 \n 分割成多則訊息
 */
function replyToLine(replyToken, text) {
  // 按 \n 分割訊息
  const lines = text.split('\\n');
  
  // 如果只有一行，直接回覆
  if (lines.length === 1) {
    postToLine({
      'replyToken': replyToken,
      'messages': [{ 'type': 'text', 'text': text }]
    });
    return;
  }
  
  // 多行訊息：最多5則（LINE API 限制）
  const messages = [];
  for (let i = 0; i < lines.length && i < 5; i++) {
    if (lines[i].trim() !== '') {
      messages.push({ 'type': 'text', 'text': lines[i] });
    }
  }
  
  postToLine({
    'replyToken': replyToken,
    'messages': messages
  });
}

/**
 * GET 請求處理（測試用）
 */
function doGet(e) {
  return ContentService.createTextOutput("OK! 靈魂食堂 V1.4 核心重構版本運行中");
}

/**
 * 測試函數：驗證用戶狀態初始化
 */
function testGetUserState() {
  const testUserId = "TEST_USER_" + new Date().getTime();
  const state = getUserState(testUserId);
  
  Logger.log("測試結果：");
  Logger.log("userId: " + state.userId);
  Logger.log("currentDay: " + state.currentDay);
  Logger.log("currentMood: " + state.currentMood);
  Logger.log("collectedTags: " + JSON.stringify(state.collectedTags));
  Logger.log("phase: " + state.phase);
  
  // 驗證 collectedTags 是空陣列
  if (Array.isArray(state.collectedTags) && state.collectedTags.length === 0) {
    Logger.log("✅ collectedTags 初始化正確：空陣列 []");
  } else {
    Logger.log("❌ collectedTags 初始化錯誤");
  }
}

/**
 * 測試函數：驗證標籤持久化
 */
function testTagPersistence() {
  const testUserId = "TEST_USER_" + new Date().getTime();
  let state = getUserState(testUserId);
  
  // 模擬添加標籤
  state.collectedTags.push("Sweet_全部拌在一起！");
  saveUserState(state);
  
  // 重新讀取
  state = getUserState(testUserId);
  
  Logger.log("標籤持久化測試：");
  Logger.log("collectedTags: " + JSON.stringify(state.collectedTags));
  
  if (state.collectedTags.includes("Sweet_全部拌在一起！")) {
    Logger.log("✅ 標籤持久化成功");
  } else {
    Logger.log("❌ 標籤持久化失敗");
  }
}