// 警告：此檔案包含敏感資訊（LINE Token、Google Sheets ID）
// 請勿將此檔案上傳到公開的 Git 倉庫或分享給他人
// 建議：在正式環境中使用 Google Apps Script 的 PropertiesService 儲存敏感資訊

// 靈魂食堂 V4.0 重構版
// 專案代號：CONFITEOR
// 版本：V4.0 - 2026-01-17（架構全面重構）
// 狀態：從 Cloudy V1.4 進化為「五味考古與標籤驅動」架構

const SPREADSHEET_ID = '1XWl0iPO5QMVMcI8_tYLzJipGFmfiWS4lVzLgNZi6ECk';
const TOKEN = 'IADUHTu/gVHrJEXQ0YpLeUN/mIS6zhMMpwyrz9/2OqTBy8gKutxHjxIptvSrLnPI0UySJmIwYHoqoKP2zV8qL+vauBSqixT3v9QdfubKhOmlD0530gtGw/ftdGdnxSfap58MazHBZ6wFlSQ5InckXwdB04t89/1O/w1cDnyilFU=';

// DEBUG 模式開關（上線前必須改為 false）
const IS_DEBUG_MODE = true;

// ========================================
// 五味映射系統 (CONFITEOR 核心機制)
// ========================================

/**
 * 五味與情緒的對應關係（基於中醫五行理論）
 */
const FLAVOR_EMOTION_MAP = {
  "sweet": {
    element: "Earth",
    targetEmotion: "anxiety",
    effect: "grounding",
    keywords: ["溫暖", "安全", "母親", "家"]
  },
  "sour": {
    element: "Wood",
    targetEmotion: "regret",
    effect: "focus",
    keywords: ["後悔", "錯誤", "回頭", "醒悟"]
  },
  "bitter": {
    element: "Fire",
    targetEmotion: "obsession",
    effect: "clarification",
    keywords: ["執著", "幻想", "清醒", "放下"]
  },
  "spicy": {
    element: "Metal",
    targetEmotion: "grief",
    effect: "catharsis",
    keywords: ["痛", "淚", "刺激", "活著"]
  },
  "salty": {
    element: "Water",
    targetEmotion: "amnesia",
    effect: "willpower",
    keywords: ["海", "淚", "原初", "根源"]
  }
};

/**
 * 五味中文對照表
 */
const FLAVOR_MAP = {
  "酸": "sour",
  "甜": "sweet",
  "苦": "bitter",
  "辣": "spicy",
  "鹹": "salty"
};

// ========================================
// 核心輔助函數
// ========================================

/**
 * 獲取用戶狀態（支援 V4.0 的 10 欄位結構）
 * @param {string} userId - LINE User ID
 * @return {object} 用戶狀態物件
 */
function getUserState(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const userSheet = ss.getSheetByName("userState");
  const userData = userSheet.getDataRange().getValues();
  
  for (let i = 1; i < userData.length; i++) {
    if (userData[i][0] === userId) {
      return {
        row: i + 1,
        userId: userData[i][0],
        currentDay: userData[i][1] || 1,
        guestID: userData[i][2] || "guest1",
        collectedTags: userData[i][3] || "[]",
        lastActive: userData[i][4] || new Date(),
        unlockedRecipe: userData[i][5] || "",
        phase: userData[i][6] || "sensory",
        inventory: userData[i][7] || "{}",
        completedGuests: userData[i][8] || "[]",
        lifetimeHeirlooms: userData[i][9] || 0
      };
    }
  }
  
  // 新用戶：建立初始狀態
  const newRow = [
    userId,           // A: userId
    1,                // B: currentDay
    "guest1",         // C: guestID
    "[]",             // D: collectedTags
    new Date(),       // E: lastActive
    "",               // F: unlockedRecipe
    "sensory",        // G: phase
    "{}",             // H: inventory
    "[]",             // I: completedGuests
    0                 // J: lifetimeHeirlooms
  ];
  userSheet.appendRow(newRow);
  
  return {
    row: userSheet.getLastRow(),
    userId: userId,
    currentDay: 1,
    guestID: "guest1",
    collectedTags: "[]",
    lastActive: new Date(),
    unlockedRecipe: "",
    phase: "sensory",
    inventory: "{}",
    completedGuests: "[]",
    lifetimeHeirlooms: 0
  };
}

/**
 * 儲存用戶狀態
 * @param {string} userId - LINE User ID
 * @param {object} updates - 要更新的欄位
 */
function saveUserState(userId, updates) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const userSheet = ss.getSheetByName("userState");
  const userState = getUserState(userId);
  const row = userState.row;
  
  // 更新指定欄位
  if (updates.currentDay !== undefined) userSheet.getRange(row, 2).setValue(updates.currentDay);
  if (updates.guestID !== undefined) userSheet.getRange(row, 3).setValue(updates.guestID);
  if (updates.collectedTags !== undefined) userSheet.getRange(row, 4).setValue(updates.collectedTags);
  if (updates.lastActive !== undefined) userSheet.getRange(row, 5).setValue(updates.lastActive);
  if (updates.unlockedRecipe !== undefined) userSheet.getRange(row, 6).setValue(updates.unlockedRecipe);
  if (updates.phase !== undefined) userSheet.getRange(row, 7).setValue(updates.phase);
  if (updates.inventory !== undefined) userSheet.getRange(row, 8).setValue(updates.inventory);
  if (updates.completedGuests !== undefined) userSheet.getRange(row, 9).setValue(updates.completedGuests);
  if (updates.lifetimeHeirlooms !== undefined) userSheet.getRange(row, 10).setValue(updates.lifetimeHeirlooms);
}

/**
 * 跨日檢查機制（宿命感設計）
 * @param {string} userId - LINE User ID
 * @return {object} { canProgress: boolean, reason: string }
 */
function canProgressToNextDay(userId) {
  const userState = getUserState(userId);
  const lastActive = new Date(userState.lastActive);
  const now = new Date();
  
  // 計算日期差（使用伺服器時間，防止客戶端作弊）
  const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
  
  // DEBUG 模式：跳過時間檢查
  if (IS_DEBUG_MODE) {
    return { 
      canProgress: true, 
      reason: "[DEBUG] 時間檢查已跳過" 
    };
  }
  
  // 只在 Day 2 及以後才檢查（Day 1 首次進入不限制）
  if (daysDiff < 1 && userState.currentDay > 1) {
    const formatTime = Utilities.formatDate(lastActive, "GMT+8", "MM/dd HH:mm");
    return {
      canProgress: false,
      reason: "今天的故事已經結束了。\n靈魂需要時間沉澱...\n\n明天再來吧。\n\n（上次互動：" + formatTime + "）"
    };
  }
  
  return { canProgress: true };
}

/**
 * 從試算表 dialogueLibrary 分頁讀取所有台詞（V4.0 擴充版）
 * 試算表結構：A=key, B=content, C=required_tags, D=unlock_tags, E=emotion
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
      library[key] = {
        content: content,
        required_tags: data[i][2] || "[]",
        unlock_tags: data[i][3] || "[]",
        emotion: data[i][4] || "neutral"
      };
    }
  }
  return library;
}

/**
 * 標籤驅動對話查找（核心邏輯）
 * @param {string} guestID - 靈魂編號
 * @param {number} day - 當前天數
 * @param {array} userTags - 玩家已收集的標籤
 * @return {object} 匹配的對話物件
 */
function findMatchingDialogue(guestID, day, userTags) {
  const library = getDialogueLibrary();
  const prefix = guestID + "_day" + day + "_";
  
  let bestMatch = null;
  let maxMatchScore = 0;
  
  for (let key in library) {
    if (key.indexOf(prefix) !== 0) continue;
    
    const entry = library[key];
    const requiredTags = JSON.parse(entry.required_tags || "[]");
    
    // 計算匹配度（擁有的必需標籤數量）
    let matchScore = 0;
    for (let j = 0; j < requiredTags.length; j++) {
      if (userTags.indexOf(requiredTags[j]) !== -1) {
        matchScore++;
      }
    }
    
    // 必須滿足所有必需標籤才算匹配
    if (matchScore > maxMatchScore && matchScore === requiredTags.length) {
      bestMatch = {
        key: key,
        content: entry.content,
        unlockTags: JSON.parse(entry.unlock_tags || "[]"),
        emotion: entry.emotion
      };
      maxMatchScore = matchScore;
    }
  }
  
  // 若無匹配，返回預設對話
  if (!bestMatch) {
    const defaultKey = guestID + "_day" + day + "_default";
    if (library[defaultKey]) {
      return {
        key: defaultKey,
        content: library[defaultKey].content,
        unlockTags: [],
        emotion: library[defaultKey].emotion
      };
    }
  }
  
  return bestMatch || { 
    content: "靈魂陷入了沉默...", 
    unlockTags: [], 
    emotion: "neutral" 
  };
}

/**
 * LINE Webhook 主函數（V4.0 重構版）
 */
function doPost(e) {
  try {
    const event = JSON.parse(e.postData.contents).events[0];
    const replyToken = event.replyToken;
    const userId = event.source.userId;
    const userMsg = event.message.text;

    // ========================================
    // DEBUG 指令處理（僅 DEBUG 模式有效）
    // ========================================
    if (IS_DEBUG_MODE && userMsg.indexOf("/debug") === 0) {
      handleDebugCommand(replyToken, userId, userMsg);
      return;
    }

    // ========================================
    // 核心改動 1: 跨日檢查
    // ========================================
    const progressCheck = canProgressToNextDay(userId);
    if (!progressCheck.canProgress) {
      replyToLine(replyToken, progressCheck.reason);
      return;
    }

    // ========================================
    // 核心改動 2: 讀取 V4.0 完整狀態
    // ========================================
    const userState = getUserState(userId);
    const guestID = userState.guestID;
    const currentDay = userState.currentDay;
    const collectedTags = JSON.parse(userState.collectedTags);
    const phase = userState.phase;

    // ========================================
    // 核心改動 3: 標籤驅動互動處理
    // ========================================
    
    // 處理「行動」觸發（Day 1 感官探索）
    if (userMsg.indexOf("[行動-") === 0) {
      handleActionTrigger(replyToken, userId, userMsg, guestID, currentDay, collectedTags);
      return;
    }

    // 處理「餵食」觸發（五味診斷）
    if (userMsg.indexOf("[餵食-") === 0) {
      handleFlavourFeeding(replyToken, userId, userMsg, guestID, currentDay, collectedTags);
      return;
    }

    // 處理「烹飪」觸發（Day 3 料理合成）
    if (userMsg.indexOf("[烹飪-") === 0) {
      handleCooking(replyToken, userId, userMsg, guestID);
      return;
    }

    // 處理「詢問」觸發（Day 2 深度對話）
    if (userMsg.indexOf("[詢問-") === 0) {
      handleInquiry(replyToken, userId, userMsg, guestID, currentDay, collectedTags);
      return;
    }

    // ========================================
    // 舊版指令兼容（逐步淘汰）
    // ========================================
    if (userMsg === "餵食" || userMsg === "聊天") {
      replyToLine(replyToken, "此功能已在 V4.0 重構。請使用選單與靈魂互動。");
      return;
    }

    // 其他訊息：引導使用選單
    replyToLine(replyToken, "點選下方選單與靈魂互動吧...");

  } catch (err) {
    Logger.log("錯誤: " + err);
    // 不回應錯誤給用戶（避免暴露系統資訊）
  }
}

// ========================================
// 核心互動處理函數
// ========================================

/**
 * 處理「行動」觸發（Day 1 感官探索）
 * 範例：[行動-熱茶] -> 新增「warmth」標籤
 */
function handleActionTrigger(replyToken, userId, userMsg, guestID, currentDay, collectedTags) {
  const match = userMsg.match(/\[行動-(.+?)\]/);
  if (!match) return;
  const action = match[1];
  
  // 行動與標籤的映射
  const actionTagMap = {
    "熱茶": "warmth",
    "毛毯": "softness",
    "鹹湯": "salty",
    "辣椒": "spicy",
    "糖果": "sweet",
    "檸檬": "sour"
  };
  
  const newTag = actionTagMap[action];
  if (newTag && collectedTags.indexOf(newTag) === -1) {
    collectedTags.push(newTag);
  }
  
  // 更新狀態
  saveUserState(userId, {
    collectedTags: JSON.stringify(collectedTags),
    lastActive: new Date()
  });
  
  // 查找匹配的對話
  const dialogue = findMatchingDialogue(guestID, currentDay, collectedTags);
  
  // 回傳對話 + 標籤提示
  let response = dialogue.content;
  if (newTag) {
    response += "\n\n你捕捉到了「" + newTag + "」的記憶碎片。";
  }
  
  replyToLine(replyToken, response);
}

/**
 * 處理「餵食」觸發（五味診斷）
 * 範例：[餵食-鹹] -> 觸發 salty 相關對話
 */
function handleFlavourFeeding(replyToken, userId, userMsg, guestID, currentDay, collectedTags) {
  const match = userMsg.match(/\[餵食-(.+?)\]/);
  if (!match) return;
  const flavor = match[1]; // "酸", "甜", "苦", "辣", "鹹"
  const flavorKey = FLAVOR_MAP[flavor]; // 轉為英文 key
  
  if (!flavorKey) {
    replyToLine(replyToken, "這個味道...我無法理解。");
    return;
  }
  
  const emotion = FLAVOR_EMOTION_MAP[flavorKey];
  
  // 添加五味標籤
  if (collectedTags.indexOf(flavorKey) === -1) {
    collectedTags.push(flavorKey);
  }
  
  // 更新狀態
  saveUserState(userId, {
    collectedTags: JSON.stringify(collectedTags),
    lastActive: new Date()
  });
  
  // 查找對應的反應對話
  const dialogueKey = guestID + "_day" + currentDay + "_feed_" + flavorKey;
  const library = getDialogueLibrary();
  const response = library[dialogueKey] ? library[dialogueKey].content : "（靈魂嚐了一口" + flavor + "味...）";
  
  replyToLine(replyToken, response);
}

/**
 * 處理「烹飪」觸發（Day 3 料理合成）
 * 範例：[烹飪-開始] -> 進入烹飪流程
 */
function handleCooking(replyToken, userId, userMsg, guestID) {
  const userState = getUserState(userId);
  const unlockedRecipe = userState.unlockedRecipe;
  
  if (!unlockedRecipe) {
    replyToLine(replyToken, "你還不知道要做什麼料理...\n也許需要更多線索？");
    return;
  }
  
  // TODO: 實作料理合成邏輯（Phase 2）
  replyToLine(replyToken, "開始烹飪【" + unlockedRecipe + "】...\n\n（烹飪系統開發中）");
}

/**
 * 處理「詢問」觸發（Day 2 深度對話）
 * 範例：[詢問-那是給誰的？] -> 觸發記憶解鎖
 */
function handleInquiry(replyToken, userId, userMsg, guestID, currentDay, collectedTags) {
  const match = userMsg.match(/\[詢問-(.+?)\]/);
  if (!match) return;
  const inquiry = match[1];
  
  // 查找對應的對話
  const dialogue = findMatchingDialogue(guestID, currentDay, collectedTags);
  
  // 解鎖新標籤
  if (dialogue.unlockTags.length > 0) {
    for (let i = 0; i < dialogue.unlockTags.length; i++) {
      const tag = dialogue.unlockTags[i];
      if (collectedTags.indexOf(tag) === -1) {
        collectedTags.push(tag);
      }
    }
    
    saveUserState(userId, {
      collectedTags: JSON.stringify(collectedTags),
      lastActive: new Date()
    });
  }
  
  replyToLine(replyToken, dialogue.content);
}

// ========================================
// DEBUG 指令處理
// ========================================

/**
 * 處理 DEBUG 指令
 * /debug reset - 重置用戶狀態
 * /debug skipday - 跳過一天
 * /debug addtag [tag] - 手動添加標籤
 * /debug state - 查看當前狀態
 */
function handleDebugCommand(replyToken, userId, userMsg) {
  const cmd = userMsg.split(" ");
  
  if (cmd[1] === "reset") {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userSheet = ss.getSheetByName("userState");
    const userState = getUserState(userId);
    userSheet.deleteRow(userState.row);
    replyToLine(replyToken, "[DEBUG] 用戶狀態已重置");
    return;
  }
  
  if (cmd[1] === "skipday") {
    const userState = getUserState(userId);
    const newDay = Math.min(3, userState.currentDay + 1);
    saveUserState(userId, {
      currentDay: newDay,
      lastActive: new Date(Date.now() - 86400000) // 倒退 24 小時
    });
    replyToLine(replyToken, "[DEBUG] 已推進到 Day " + newDay);
    return;
  }
  
  if (cmd[1] === "addtag") {
    const tag = cmd[2];
    const userState = getUserState(userId);
    const tags = JSON.parse(userState.collectedTags);
    if (tags.indexOf(tag) === -1) {
      tags.push(tag);
      saveUserState(userId, { collectedTags: JSON.stringify(tags) });
    }
    replyToLine(replyToken, "[DEBUG] 已添加標籤: " + tag);
    return;
  }
  
  if (cmd[1] === "state") {
    const userState = getUserState(userId);
    const stateInfo = "[DEBUG] 當前狀態:\nDay: " + userState.currentDay + "\nGuest: " + userState.guestID + "\nTags: " + userState.collectedTags + "\nPhase: " + userState.phase;
    replyToLine(replyToken, stateInfo);
    return;
  }
  
  replyToLine(replyToken, "[DEBUG] 可用指令:\n/debug reset\n/debug skipday\n/debug addtag [tag]\n/debug state");
}

// ========================================
// LINE API 通訊函數
// ========================================

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

function replyFlexMessage(replyToken, flexContent) {
  postToLine({
    'replyToken': replyToken,
    'messages': [{ 
      'type': 'flex',
      'altText': '靈魂食堂',
      'contents': flexContent
    }]
  });
}

// ========================================
// 測試與設置函數
// ========================================

function doGet(e) { 
  return ContentService.createTextOutput("OK! 靈魂食堂 V4.0 已啟動"); 
}

function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log("成功連接到試算表：" + ss.getName());
  
  // 檢查必要的 Sheet 是否存在
  const sheets = ["userState", "dialogueLibrary", "recipeDatabase", "guestConfig", "heirlooms"];
  for (let i = 0; i < sheets.length; i++) {
    const sheetName = sheets[i];
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log("⚠️ 缺少 Sheet: " + sheetName);
    } else {
      Logger.log("✅ Sheet 存在: " + sheetName);
    }
  }
}

// ========================================
// 舊版函數（逐步淘汰，保留兼容性）
// ========================================

/**
 * @deprecated 此函數將在 V4.1 移除，請使用新的標籤驅動系統
 */
function sendFeedQuickReply(replyToken) {
  const payload = {
    'replyToken': replyToken,
    'messages': [{
      'type': 'text',
      'text': 'V4.0 已重構餵食機制。\n請使用 [餵食-酸/甜/苦/辣/鹹] 進行五味診斷。',
      'quickReply': {
        'items': [
          { 'type': 'action', 'action': { 'type': 'message', 'label': '酸', 'text': '[餵食-酸]' }},
          { 'type': 'action', 'action': { 'type': 'message', 'label': '甜', 'text': '[餵食-甜]' }},
          { 'type': 'action', 'action': { 'type': 'message', 'label': '苦', 'text': '[餵食-苦]' }},
          { 'type': 'action', 'action': { 'type': 'message', 'label': '辣', 'text': '[餵食-辣]' }},
          { 'type': 'action', 'action': { 'type': 'message', 'label': '鹹', 'text': '[餵食-鹹]' }}
        ]
      }
    }]
  };
  postToLine(payload);
}

/**
 * @deprecated 此函數將在 V4.1 移除
 */
function sendChatQuickReply(replyToken, text) {
  const payload = {
    'replyToken': replyToken,
    'messages': [{
      'type': 'text',
      'text': 'V4.0 已重構對話機制。\n請使用 [行動-XXX] 或 [詢問-XXX] 進行互動。',
      'quickReply': {
        'items': [
          { 'type': 'action', 'action': { 'type': 'message', 'label': '給他熱茶', 'text': '[行動-熱茶]' }},
          { 'type': 'action', 'action': { 'type': 'message', 'label': '遞上毛毯', 'text': '[行動-毛毯]' }}
        ]
      }
    }]
  };
  postToLine(payload);
}
