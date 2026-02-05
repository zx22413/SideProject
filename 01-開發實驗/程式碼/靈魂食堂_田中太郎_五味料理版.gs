// ============================================================
// 靈魂食堂 - 田中太郎重構版（神秘感優先）
// 版本: V4.14 (優化 LIFF 體驗)
// 創建日期: 2026-01-20
// 最後更新: 2026-02-05
// 基於: 畫鬼腳 MVP v1.0
// ============================================================
//
// v2.0 功能:
// - 時段系統（Night→Day→Cooking→After Hours）
// - 記憶即食材系統（關鍵詞捕捉→食材解鎖）
// - 話題選單系統（類似紅弦俱樂部）
// - 黑貓角色（老油條店長貓）
// - 完整的田中太郎故事線
//
// v3.0 新增功能（2026-01-24）:
// - Day 1 熱湯選項（清醒+收斂，D 衰敗軸）
// - Day 2 多料理選項（蜜汁燉菜、苦辛醒神湯、撫慰鹹粥）
// - 五味結算系統（calculateFlavorBalance、determineEnding）
// - 三種結局分支（苦味過重/回甘平衡/甜味過重）
// - 不同遺物顯示（彎曲的針/銀頂針/泛黃照片）
// - 整合人生紀實片段到記憶劇場
//
// V4.5 新增功能（2026-01-26）- 劇本昇華三痛點:
// - 新增記憶標籤：失語、缺席的典禮、空蕩的店
// - Day 1 延伸話題：空蕩的店（職人黃昏）
// - Day 2 延伸話題：缺席的典禮（裂痕事件）
// - 撫慰鹹粥增強：翻譯者概念（雪子作為溝通介面）
//
// V4.6 新增功能（2026-01-27）- 結局變體系統:
// - 結局名稱動態化（18 種：3 預設 + 4 變體 × 3 結局 + 全收集 × 3）
// - 黑貓評論動態化（18 種觀眾代言人式評論）
// - 遺物描述動態化（18 種）
// - 告別對話模組化堆疊（開頭骨架 + 變體層/全收集專屬 + 結尾骨架）
// - 全收集專屬設計（變體記憶 >= 3 時觸發專屬對話/名稱/評論）
// - 最終章動態引言（根據變體記憶顯示不同引言）
//
// Google Sheets 需求:
// - Sheet 名稱: "userStateTanaka"
// - 欄位: A=userId | B=currentDay | C=phase | D=collectedMemories | E=topicsDone | F=lastActive | G=dishesCooked | H=lifetimeHeirlooms
//
// V4.7 新增功能（2026-01-28）- 敘事修復與圖鑑系統:
// - 新增 getTruthMonologue(endingType) - 三種結局各有不同的「真相揭露」過程
// - 修復甜味結局「大徹大悟後又裝睡」的敘事割裂問題
// - 新增 lifetimeHeirlooms 欄位 - 永久記錄已獲得的遺物（跨輪次保留）
// - 遺物採用策略A（覆蓋制）：每次更新為最新變體描述
// - 為 Rich Menu 圖鑑系統準備資料結構
//
// V4.8 新增功能（2026-01-28）- Rich Menu UX 完整實作:
// - Rich Menu 分級管制系統：
//   - 沉浸破壞型（人物紀傳/遺物圖鑑）：遊戲進行中黑貓攔截
//   - 工具輔助型（靈魂狀態/遊戲說明）：隨時可開
// - 回程票系統 restoreGameScreen()：解決「洗版後找不到選項」問題
// - 靈魂狀態面板：五味進度條 + 已收集記憶 + 黑貓評論
// - 新增 Debug 指令：/debug richmenu, /debug bio, /debug status 等
// - 所有圖鑑 Flex Card 添加「返回遊戲」按鈕
// - 相容舊版 Rich Menu postback 格式（action=xxx）
//
// V4.9 新增功能（2026-01-29）- Day 3 動態料理系統:
// - Day 3 最終料理動態化（根據五味傾向）：
//   - 🍬 甜味過重：糖霜幻景拼盤
//   - 🦴 苦味過重：千針冷骨湯
//   - 🐟 平衡：百味蜜汁炙燒魚
// - 修正苦味結局真相獨白：「職人的徒勞」主題
//   - 核心概念：做到了，卻沒有意義（不是「做不到」）
// - Day 3 料理演出動態化（Part1/Part2/MemoryCard 皆根據結局類型調整）
// - 黑貓料理評論動態化（三種結局各有不同台詞）
// - 向下相容：支援新舊料理名稱觸發
//
// V4.10 新增功能（2026-01-30）- Day 1-2 料理演出動態化:
// - 統一採用「有啥食材顯示啥」邏輯（參考 Day 3 設計）
// - Day 1 熱茶演出動態化：根據實際收集的記憶（針/縫線/寒冷/寧靜/陪伴）
// - Day 1 熱湯演出動態化：根據實際收集的記憶（雨聲/失憶/迷茫）
// - Day 2 蜜汁燉菜演出動態化：移除錯誤的「寒冷」，只顯示蜜糖笑容/眼淚
// - Day 2 苦辛醒神湯演出動態化：根據實際收集的記憶（執念/雪/死亡）
// - Day 2 苦辛醒神湯記憶劇場改為 Flex Card（閣樓場景 + 雪中場景）
// - 修改函數：getDay1CookingTea_Part1(state)、getDay1CookingSoup_Part1(state)
//             getDay2CookingResult(state)、getDay2CookingResult_苦辛(state)
//
// V4.11 新增功能（2026-02-02）- Day 1-2 記憶碎片 Hero 圖整合:
// - 視覺風格：Hollow Knight / Alto's Odyssey 美學
// - 整合 11 張 Hero 圖到 Flex Card：
//   - Day 1: 開場黑貓、老人進場、針與線、閣樓送茶、空蕩工房
//   - Day 2: 小女孩畫作、結婚消息（電話分割畫面）、深夜呢喃
//   - Day 2 料理記憶劇場: 最後一針、雪中行走、翻譯者/雪子
// - 更新函數：getDay1HandsMemoryCard()、getDay2MemoryCard1/2/3()
//             getDay2CookingResult_苦辛()、getDay2CookingResult_撫慰()
// - 撫慰鹹粥記憶劇場：純文字改為帶 Hero 圖的 Flex Card
//
// V4.12 新增功能（2026-02-03）- Day 3 告別場景 Hero 圖整合:
// - 告別場景根據結局類型顯示不同 Hero 圖（苦味/甜味/平衡）
// - 修復圖片緩存問題（day1_memory_hands_needle、day2_memory_promise 加上 ?v=2）
//
// V4.13 新增功能（2026-02-03）- LIFF 做飯小遊戲 API + 遺物圖片:
// - doGet() 新增 LIFF API 路由處理（action: getCookingState / submitCooking / pushCookingComplete）
// - getCookingStateForLiff(userId) - 返回玩家可用記憶、當日可做料理、所需食材表
// - submitCookingFromLiff(userId, selectedMemories) - 處理料理提交
// - calculateEndingFromMemories(memories)、getDishNameByEnding(endingType)
// - 遺物圖鑑卡片改用圖片（彎曲的針/泛黃照片/銀頂針），createHeirloomCard() 支援 imageUrl
//
// V4.14 新增功能（2026-02-05）- LIFF 體驗優化與顯示修復:
// - **修復**：點擊料理沒反應（劇情照常往下走宛如沒有 LIFF）→ 料理階段正確顯示 LIFF 按鈕並導向小遊戲
// - **MVP 擴增**：提示玩家要做的料理與所需食材（getCookingState 返回 availableRecipes、recipeRequirements，前端/訊息整合）
// - **修復**：遺物圖鑑與突見（圖像）無法正確顯示 → Flex Card 結構含 imageUrl、回應改 push 確保送達
// - **修復**：carousel 最後一張卡片尺寸以符合 LINE 規範（輪播內 bubble 同尺寸）
// ============================================================

// ============================================================
// 配置區（使用 Script Properties 安全管理敏感資訊）
// ============================================================
// 
// 🔐 安全設定說明：
// 敏感資訊（Token、Sheet ID）存放在 GAS 的「指令碼屬性」中，不會出現在程式碼裡
// 設定方法：GAS 編輯器 → 專案設定（齒輪圖示）→ 指令碼屬性 → 新增以下屬性：
//   - SPREADSHEET_ID: 你的 Google Sheets ID
//   - LINE_CHANNEL_ACCESS_TOKEN: 你的 LINE Channel Access Token
//
// ============================================================

// 從 Script Properties 讀取敏感配置
const scriptProperties = PropertiesService.getScriptProperties();
const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID') || '';
const LINE_TOKEN = scriptProperties.getProperty('LINE_CHANNEL_ACCESS_TOKEN') || '';

// 非敏感配置（可以直接寫在程式碼中）
const CONFIG = {
  LINE_CHANNEL_ACCESS_TOKEN: LINE_TOKEN,  // 從 Script Properties 讀取
  SHEET_NAME: "userStateTanaka",
  DEBUG_MODE: true,  // 上線前改為 false
  
  // LIFF 做飯小遊戲設定（V4.13 新增）
  // TODO: 替換為實際的 LIFF ID
  LIFF_ENABLED: true,  // 設為 true 啟用 LIFF 料理模式，設為 false 關閉 LIFF 料理模式
  LIFF_ID: '2009042883-1e0HSFLa',
  LIFF_URL: 'https://liff.line.me/2009042883-1e0HSFLa'
};

// 時段定義
const PHASE = {
  NIGHT: "night",      // 夜晚：觀察階段
  DAY: "day",          // 白天：對話階段（話題選擇）
  COOKING: "cooking",  // 傍晚：料理階段
  AFTER: "after"       // 深夜：揭露階段
};

// 五味數值對照表（依據企劃書 + 縱向話題延伸設計）
const MEMORY_FLAVOR_MAP = {
  // Day 1
  "針":       { sweet: 0, sour: 1, bitter: 2, spicy: 0, salty: 1 },
  "縫線":     { sweet: 1, sour: 0, bitter: 1, spicy: 0, salty: 2 },
  "寒冷":     { sweet: 0, sour: 2, bitter: 2, spicy: 1, salty: 0 },
  "裁縫手藝": { sweet: 3, sour: 0, bitter: 1, spicy: 0, salty: 2 },
  "銀座的驕傲": { sweet: 1, sour: 0, bitter: 1, spicy: 0, salty: 3 },
  "失憶":     { sweet: 0, sour: 2, bitter: 2, spicy: 0, salty: 0 },
  "迷茫":     { sweet: 0, sour: 1, bitter: 2, spicy: 1, salty: 0 },
  "雨聲":     { sweet: 0, sour: 0, bitter: 1, spicy: 1, salty: 1 },
  "潮濕":     { sweet: 0, sour: 1, bitter: 1, spicy: 1, salty: 0 },
  "寧靜":     { sweet: 1, sour: 0, bitter: 1, spicy: 0, salty: 1 },
  "陪伴":     { sweet: 2, sour: 0, bitter: 0, spicy: 0, salty: 1 },
  // Day 2
  "蜜糖笑容": { sweet: 3, sour: 0, bitter: 0, spicy: 0, salty: 1 },
  "女兒-美雪": { sweet: 2, sour: 1, bitter: 0, spicy: 1, salty: 2 },
  "婚紗":     { sweet: 2, sour: 2, bitter: 1, spicy: 0, salty: 1 },
  "眼淚":     { sweet: 0, sour: 1, bitter: 1, spicy: 3, salty: 0 },
  "美雪的笑容": { sweet: 6, sour: 0, bitter: 0, spicy: 0, salty: 1 },
  "第一次叫爸爸": { sweet: 5, sour: 0, bitter: 0, spicy: 0, salty: 2 },
  "執念":     { sweet: 0, sour: 1, bitter: 3, spicy: 0, salty: 1 },
  "雪":       { sweet: 0, sour: 1, bitter: 2, spicy: 1, salty: 1 },
  "死亡":     { sweet: 0, sour: 2, bitter: 3, spicy: 0, salty: 0 },
  "最後一針": { sweet: 0, sour: 1, bitter: 3, spicy: 0, salty: 1 },
  "閣樓":     { sweet: 0, sour: 1, bitter: 2, spicy: 0, salty: 1 },
  // V4.5 新增：劇本昇華三痛點
  "失語":       { sweet: 0, sour: 3, bitter: 1, spicy: 0, salty: 2 },  // 翻譯者概念
  "缺席的典禮": { sweet: 0, sour: 1, bitter: 3, spicy: 3, salty: 0 },  // 裂痕事件
  "空蕩的店":   { sweet: 0, sour: 2, bitter: 1, spicy: 0, salty: 3 }   // 時代孤獨
};

// ============================================================
// LINE Webhook 入口
// ============================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // LIFF 料理提交：body 為 { userId, selectedMemories }，無 events
    if (data.userId && Array.isArray(data.selectedMemories) && !data.events) {
      return handleLiffSubmitCooking(data);
    }
    
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
// GET 請求處理（LIFF API + 測試用）
// ============================================================
function doGet(e) {
  // 如果有 action 參數，處理 LIFF API 請求
  if (e && e.parameter && e.parameter.action) {
    return handleLiffApiGet(e);
  }
  
  // 預設：測試回應
  return ContentService.createTextOutput("靈魂食堂 - 田中太郎版 is running! ✅")
    .setMimeType(ContentService.MimeType.TEXT);
}

// ============================================================
// LIFF API - GET 請求處理
// ============================================================
function handleLiffApiGet(e) {
  const action = e.parameter.action;
  const userId = e.parameter.userId;
  
  // CORS headers - 允許 LIFF 跨域請求
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  try {
    let result;
    
    switch (action) {
      case 'getCookingState':
        result = getCookingStateForLiff(userId);
        break;
      case 'submitCooking':
        // GET 提交料理（避免 CORS preflight），參數：userId, selectedMemories（JSON 字串）
        var selectedJson = e.parameter.selectedMemories;
        if (!userId || selectedJson === undefined) {
          result = { error: 'Invalid parameters', message: 'userId and selectedMemories required' };
        } else {
          try {
            var selected = JSON.parse(selectedJson);
            if (!Array.isArray(selected)) selected = [];
            result = applyLiffSubmitCooking(userId, selected);
          } catch (err) {
            result = { error: 'Invalid parameters', message: 'selectedMemories must be JSON array' };
          }
        }
        break;
      case 'pushCookingComplete':
        // 當 isInClient=false 時，LIFF 無法 sendMessages，改由此 API 主動推送劇情
        var dishName = e.parameter.dishName;
        if (!userId || !dishName) {
          result = { error: 'Invalid parameters', message: 'userId and dishName required' };
        } else {
          result = pushLiffCookingCompleteStoryline(userId, dishName);
        }
        break;
      case 'ping':
        result = { status: 'ok', timestamp: new Date().toISOString() };
        break;
      default:
        result = { error: 'Unknown action', action: action };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// LIFF API - 料理所需食材對照表（與 getDay1/2AvailableRecipes 一致）
// ============================================================
var LIFF_RECIPE_REQUIREMENTS = {
  "熱茶": "寒冷、針、縫線 或 寧靜＋陪伴",
  "熱湯": "雨聲、失憶 或 迷茫",
  "蜜汁燉菜": "蜜糖笑容 ＋ 眼淚",
  "苦辛醒神湯": "執念 ＋ （雪 或 死亡）",
  "撫慰鹹粥": "寧靜 ＋ 陪伴",
  "糖霜幻景拼盤": "依五味結算（甜味偏多）",
  "千針冷骨湯": "依五味結算（苦辣偏多）",
  "百味蜜汁炙燒魚": "依五味結算（平衡）"
};

// ============================================================
// LIFF API - getCookingState
// 返回玩家可用的記憶食材、當日可做料理與所需食材表
// ============================================================
function getCookingStateForLiff(userId) {
  if (!userId) {
    return { error: 'userId is required' };
  }
  
  const state = getUserState(userId);
  
  if (!state) {
    return {
      error: 'User not found',
      currentDay: 0,
      collectedMemories: [],
      phase: 'unknown'
    };
  }
  
  const memories = state.collectedMemories || [];
  const day = state.currentDay || 1;
  var availableRecipes = [];
  if (day === 1) {
    availableRecipes = getDay1AvailableRecipes(memories);
  } else if (day === 2) {
    availableRecipes = getDay2AvailableRecipes(memories);
  } else if (day === 3) {
    availableRecipes = ["糖霜幻景拼盤", "千針冷骨湯", "百味蜜汁炙燒魚"];
  }
  
  // 返回料理所需的資料（含當日可做料理與所需食材對照表）
  return {
    userId: userId,
    currentDay: day,
    phase: state.phase,
    collectedMemories: memories,
    topicsDone: state.topicsDone || [],
    availableRecipes: availableRecipes,
    recipeRequirements: LIFF_RECIPE_REQUIREMENTS
  };
}

// ============================================================
// LIFF API - POST 請求處理（料理提交）
// 依 currentDay 回傳當日料理名稱（Day 1 熱茶/熱湯、Day 2 三選一、Day 3 結局料理）
// ============================================================
function submitCookingFromLiff(userId, selectedMemories) {
  if (!userId || !selectedMemories || selectedMemories.length === 0) {
    return { error: 'Invalid parameters' };
  }
  
  const state = getUserState(userId);
  if (!state) {
    return { error: 'User not found' };
  }
  
  const endingType = calculateEndingFromMemories(selectedMemories);
  const dishName = getDishNameForLiffSubmit(state.currentDay || 1, selectedMemories, endingType);
  
  return {
    success: true,
    userId: userId,
    selectedMemories: selectedMemories,
    endingType: endingType,
    dishName: dishName
  };
}

/**
 * 依 currentDay 與選中的記憶回傳 LIFF 提交後的料理名稱
 */
function getDishNameForLiffSubmit(currentDay, selectedMemories, endingType) {
  const sel = selectedMemories || [];
  const has = (x) => sel.includes(x);
  if (currentDay === 1) {
    if (has("雨聲") || has("失憶") || has("迷茫")) return "熱湯";
    if (has("寒冷") || has("針") || has("縫線") || (has("寧靜") && has("陪伴"))) return "熱茶";
    return "熱茶"; // 預設
  }
  if (currentDay === 2) {
    if (has("蜜糖笑容") && has("眼淚")) return "蜜汁燉菜";
    if (has("執念") && (has("雪") || has("死亡"))) return "苦辛醒神湯";
    if (has("寧靜") && has("陪伴")) return "撫慰鹹粥";
    return "蜜汁燉菜"; // 預設
  }
  return getDishNameByEnding(endingType);
}

// ============================================================
// LIFF 輔助函數 - 從記憶計算結局
// ============================================================
function calculateEndingFromMemories(memories) {
  // 五味計數
  const flavorCount = {
    sweet: 0,
    sour: 0,
    bitter: 0,
    spicy: 0,
    salty: 0
  };
  
  // 記憶到五味的映射
  const memoryFlavorMap = {
    "裁縫手藝": "sweet",
    "失去的名字": "salty",
    "空蕩的店": "bitter",
    "銀座的驕傲": "sweet",
    "小女孩畫作": "sweet",
    "結婚消息": "sour",
    "深夜呢喃": "bitter",
    "缺席的典禮": "sour",
    "失語": "spicy",
    "童年的茶": "sweet",
    "送茶的小手": "sweet",
    "空蕩工房": "bitter",
    "最後一針": "bitter",
    "雪中行走": "spicy",
    "翻譯者": "salty"
  };
  
  // 統計五味
  memories.forEach(memory => {
    const flavor = memoryFlavorMap[memory];
    if (flavor && flavorCount[flavor] !== undefined) {
      flavorCount[flavor]++;
    }
  });
  
  // 判斷主導味道
  const sweetSour = flavorCount.sweet + flavorCount.sour;
  const bitterSpicy = flavorCount.bitter + flavorCount.spicy;
  
  if (sweetSour > bitterSpicy + 1) {
    return "ENDING_SWEET";
  } else if (bitterSpicy > sweetSour + 1) {
    return "ENDING_BITTER";
  } else {
    return "ENDING_BALANCED";
  }
}

// ============================================================
// LIFF 輔助函數 - 取得料理名稱
// ============================================================
function getDishNameByEnding(endingType) {
  switch (endingType) {
    case "ENDING_SWEET":
      return "糖霜幻景拼盤";
    case "ENDING_BITTER":
      return "千針冷骨湯";
    case "ENDING_BALANCED":
    default:
      return "百味蜜汁炙燒魚";
  }
}

/**
 * 共用：依 userId + selectedMemories 計算料理結果並更新玩家狀態，回傳 { success, dishName } 或 { error }。
 * 供 doPost (handleLiffSubmitCooking) 與 doGet (submitCooking) 使用。
 */
function applyLiffSubmitCooking(userId, selectedMemories) {
  const result = submitCookingFromLiff(userId, selectedMemories);
  if (result.error || !result.success) return result;
  const state = getUserState(userId);
  if (state) {
    addDishCooked(userId, state, result.dishName);
    const currentDay = state.currentDay || 1;
    if (currentDay !== 3) {
      updateUserState(userId, {
        phase: PHASE.AFTER,
        lastActive: new Date().toISOString()
      });
    }
  }
  return { success: true, dishName: result.dishName };
}

/**
 * doPost 內處理 LIFF 料理提交：更新玩家狀態並回傳 dishName
 * LIFF 會再以 sendMessage 發「【料理完成】{dishName}」，由 handleMessage 推送後續劇情
 */
function handleLiffSubmitCooking(data) {
  const result = applyLiffSubmitCooking(data.userId, data.selectedMemories);
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 處理 LIFF 發送的「【料理完成】{dishName}」訊息，推送對應劇情（Day 1/2/3）
 * @returns {boolean} 是否已處理
 */
function handleLiffCookingCompleteMessage(event, userId, state, dishName) {
  const day = state.currentDay || 1;
  showLoadingAnimation(userId, 5);
  if (day === 1) {
    if (dishName === "熱茶") {
      addTopic(userId, state, "cooking_tea_part1");
      replyMessage(event.replyToken, getDay1CookingTea_Part1(state));
      return true;
    }
    if (dishName === "熱湯") {
      addTopic(userId, state, "cooking_soup_part1");
      replyMessage(event.replyToken, getDay1CookingSoup_Part1(state));
      return true;
    }
  }
  if (day === 2) {
    if (dishName === "蜜汁燉菜") {
      replyMessage(event.replyToken, getDay2CookingResult(state));
      return true;
    }
    if (dishName === "苦辛醒神湯") {
      replyMessage(event.replyToken, getDay2CookingResult_苦辛(state));
      return true;
    }
    if (dishName === "撫慰鹹粥") {
      addMemory(userId, state, "失語");
      replyMessage(event.replyToken, getDay2CookingResult_撫慰());
      return true;
    }
  }
  if (day === 3 && (dishName === "糖霜幻景拼盤" || dishName === "千針冷骨湯" || dishName === "百味蜜汁炙燒魚")) {
    addTopic(userId, state, "cooking_final_part1");
    addTopic(userId, state, "cooking_final_part2");
    replyMessage(event.replyToken, getDay3CookingProcess_Part2(state));
    return true;
  }
  return false;
}

/**
 * 當 LIFF 在外部瀏覽器開啟（isInClient=false）時，無法使用 sendMessages，
 * 改由此 API 主動推送劇情。邏輯與 handleLiffCookingCompleteMessage 相同，改用 pushMessages。
 * @returns {{ success: boolean, error?: string }}
 */
function pushLiffCookingCompleteStoryline(userId, dishName) {
  const state = getUserState(userId);
  if (!state || !dishName) {
    return { success: false, error: 'User state or dishName missing' };
  }
  const day = state.currentDay || 1;
  showLoadingAnimation(userId, 5);
  if (day === 1) {
    if (dishName === "熱茶") {
      addTopic(userId, state, "cooking_tea_part1");
      pushMessages(userId, getDay1CookingTea_Part1(state));
      return { success: true };
    }
    if (dishName === "熱湯") {
      addTopic(userId, state, "cooking_soup_part1");
      pushMessages(userId, getDay1CookingSoup_Part1(state));
      return { success: true };
    }
  }
  if (day === 2) {
    if (dishName === "蜜汁燉菜") {
      pushMessages(userId, getDay2CookingResult(state));
      return { success: true };
    }
    if (dishName === "苦辛醒神湯") {
      pushMessages(userId, getDay2CookingResult_苦辛(state));
      return { success: true };
    }
    if (dishName === "撫慰鹹粥") {
      addMemory(userId, state, "失語");
      pushMessages(userId, getDay2CookingResult_撫慰());
      return { success: true };
    }
  }
  if (day === 3 && (dishName === "糖霜幻景拼盤" || dishName === "千針冷骨湯" || dishName === "百味蜜汁炙燒魚")) {
    addTopic(userId, state, "cooking_final_part1");
    addTopic(userId, state, "cooking_final_part2");
    pushMessages(userId, getDay3CookingProcess_Part2(state));
    return { success: true };
  }
  return { success: false, error: 'dishName not matched' };
}

// ============================================================
// LIFF 料理按鈕生成（用於整合到料理場景）
// ============================================================
/**
 * 生成 LIFF 料理按鈕（URI 類型）
 * 當 CONFIG.LIFF_ENABLED 為 true 時，料理場景可使用此按鈕取代傳統按鈕
 * 
 * 整合方式（以 Day 1 為例）：
 * 1. 在 getDay1CookingScene() 中，將傳統按鈕替換為 LIFF 按鈕
 * 2. 玩家點擊後會打開 LIFF 網頁，拖拉食材完成料理
 * 3. LIFF 完成後自動回傳結果到聊天室
 * 
 * @param {string} label - 按鈕文字
 * @returns {object} Flex Message 按鈕元件
 */
function getLiffCookingButton(label) {
  if (!CONFIG.LIFF_ENABLED || CONFIG.LIFF_ID === 'YOUR_LIFF_ID_HERE') {
    // LIFF 未啟用，返回空物件
    return null;
  }
  
  return {
    type: "button",
    action: {
      type: "uri",
      label: label || "🍳 開始料理",
      uri: CONFIG.LIFF_URL
    },
    style: "primary",
    color: "#e09f3e"
  };
}

/**
 * 檢查是否應使用 LIFF 料理模式
 * @returns {boolean}
 */
function shouldUseLiffCooking() {
  return CONFIG.LIFF_ENABLED && CONFIG.LIFF_ID !== 'YOUR_LIFF_ID_HERE';
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
  
  // ============================================================
  // LIFF 料理完成訊息：由 LIFF sendMessage 發送，推送對應劇情
  // ============================================================
  if (userText.startsWith("【料理完成】")) {
    const dishName = userText.replace("【料理完成】", "").trim();
    Logger.log("【料理完成】 userId=" + userId + " dishName=" + dishName + " currentDay=" + (state ? state.currentDay : "null") + " handled=" + (dishName && state ? "pending" : "skip"));
    if (dishName && state) {
      const handled = handleLiffCookingCompleteMessage(event, userId, state, dishName);
      Logger.log("【料理完成】 handleLiffCookingCompleteMessage returned handled=" + handled);
      if (handled) return;
    }
    // 未處理時回覆明確說明，不 fallback 到廚房場景（避免被誤解為「食材有缺」）
    replyMessage(event.replyToken, {
      type: "text",
      text: "【黑貓】\n「料理結果無法辨識…請再試一次。若問題持續，請從廚房再次點選開始料理。」"
    });
    return;
  }
  
  // ============================================================
  // Rich Menu 文字指令（V4.8 新增 - 支援 LINE Official Account Manager）
  // ============================================================
  
  // /menu bio - 人物紀傳（沉浸破壞型：遊戲中攔截）
  if (userText === "/menu bio") {
    handleOpenBio(event, userId, state);
    return;
  }
  
  // /menu heirloom - 遺物圖鑑（沉浸破壞型：遊戲中攔截）
  if (userText === "/menu heirloom") {
    handleOpenHeirloom(event, userId, state);
    return;
  }
  
  // /menu status - 靈魂狀態（工具輔助型：隨時可開）
  if (userText === "/menu status") {
    handleOpenStatus(event, userId, state);
    return;
  }
  
  // /menu help - 遊戲說明（工具輔助型：隨時可開）
  if (userText === "/menu help") {
    handleOpenHelp(event, userId, state);
    return;
  }
  
  // ============================================================
  // Rich Menu Debug 指令（V4.7 新增）
  // ============================================================
  if (CONFIG.DEBUG_MODE) {
    // /debug richmenu - 測試 Rich Menu 各按鈕
    if (userText === "/debug richmenu") {
      replyMessage(event.replyToken, {
        type: "text",
        text: "🔧 Rich Menu Debug 模式\n\n" +
              "可用指令：\n" +
              "• /debug bio - 測試人物紀傳\n" +
              "• /debug heirloom - 測試遺物圖鑑\n" +
              "• /debug status - 測試靈魂狀態\n" +
              "• /debug help - 測試遊戲說明\n" +
              "• /debug restore - 測試回程票\n" +
              "• /debug phase - 顯示當前階段\n" +
              "• /debug setphase [day] [phase] - 設定階段"
      });
      return;
    }
    
    // /debug bio - 強制顯示人物紀傳（忽略攔截）
    if (userText === "/debug bio") {
      if (!state) {
        replyMessage(event.replyToken, {type: "text", text: "請先開始遊戲"});
        return;
      }
      replyMessage(event.replyToken, handleBiographyRequestWithReturn(state));
      return;
    }
    
    // /debug heirloom - 強制顯示遺物圖鑑（忽略攔截）
    if (userText === "/debug heirloom") {
      if (!state) {
        replyMessage(event.replyToken, {type: "text", text: "請先開始遊戲"});
        return;
      }
      replyMessage(event.replyToken, handleHeirloomRequestWithReturn(state));
      return;
    }
    
    // /debug status - 顯示靈魂狀態
    if (userText === "/debug status") {
      if (!state) {
        replyMessage(event.replyToken, {type: "text", text: "請先開始遊戲"});
        return;
      }
      replyMessage(event.replyToken, getStatusFlexMessage(state));
      return;
    }
    
    // /debug help - 顯示遊戲說明
    if (userText === "/debug help") {
      replyMessage(event.replyToken, getHelpMessageWithReturn());
      return;
    }
    
    // /debug restore - 測試回程票
    if (userText === "/debug restore") {
      restoreGameScreen(event.replyToken, userId);
      return;
    }
    
    // /debug phase - 顯示當前階段詳情
    if (userText === "/debug phase") {
      if (!state) {
        replyMessage(event.replyToken, {type: "text", text: "請先開始遊戲"});
        return;
      }
      const phaseInfo = `🔧 階段詳情\n\n` +
        `📅 Day: ${state.currentDay}\n` +
        `⏰ Phase: ${state.phase}\n` +
        `📝 記憶數: ${state.collectedMemories.length}\n` +
        `✅ 話題數: ${state.topicsDone.length}\n` +
        `🍳 料理數: ${(state.dishesCooked || []).length}\n\n` +
        `黑貓攔截狀態: ${(state.phase === PHASE.DAY || state.phase === PHASE.COOKING) ? "🔴 啟用" : "🟢 關閉"}`;
      replyMessage(event.replyToken, {type: "text", text: phaseInfo});
      return;
    }
    
    // /debug setphase [day] [phase] - 設定階段（用於測試不同場景）
    if (userText.startsWith("/debug setphase ")) {
      const parts = userText.split(" ");
      if (parts.length >= 4) {
        const newDay = parseInt(parts[2]);
        const newPhase = parts[3];
        
        if ([1, 2, 3].includes(newDay) && [PHASE.NIGHT, PHASE.DAY, PHASE.COOKING, PHASE.AFTER].includes(newPhase)) {
          const currentState = state || { userId: userId };
          updateUserState(userId, {
            ...currentState,
            currentDay: newDay,
            phase: newPhase
          });
          replyMessage(event.replyToken, {
            type: "text",
            text: `✅ 已設定階段\n\n📅 Day: ${newDay}\n⏰ Phase: ${newPhase}`
          });
        } else {
          replyMessage(event.replyToken, {
            type: "text",
            text: "❌ 無效參數\n\n用法: /debug setphase [1-3] [night|day|cooking|after]"
          });
        }
        return;
      }
    }
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
  
  // ============================================================
  // Rich Menu 處理（分級管制 + 回程票系統）
  // ============================================================
  
  // 📖 人物紀傳（沉浸破壞型：遊戲中攔截）
  if (data === "OPEN_BIO") {
    handleOpenBio(event, userId, state);
    return;
  }
  
  // 🎁 遺物圖鑑（沉浸破壞型：遊戲中攔截）
  if (data === "OPEN_HEIRLOOM") {
    handleOpenHeirloom(event, userId, state);
    return;
  }
  
  // 📊 靈魂狀態（工具輔助型：隨時可開）
  if (data === "OPEN_STATUS") {
    handleOpenStatus(event, userId, state);
    return;
  }
  
  // ❓ 遊戲說明（工具輔助型：隨時可開）
  if (data === "OPEN_HELP") {
    handleOpenHelp(event, userId, state);
    return;
  }
  
  // 🔙 回程票（回到遊戲畫面）
  if (data === "RESUME_GAME") {
    restoreGameScreen(event.replyToken, userId);
    return;
  }
  
  // 舊版 Rich Menu 相容（action=xxx 格式）
  if (data === "action=heirloom") {
    handleOpenHeirloom(event, userId, state);
    return;
  }
  if (data === "action=biography") {
    handleOpenBio(event, userId, state);
    return;
  }
  if (data === "action=help") {
    handleOpenHelp(event, userId, state);
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
    
    // 預設的 lifetimeHeirlooms 結構
    const defaultHeirlooms = {
      "BITTER": { obtained: false, name: "???", desc: "", date: "" },
      "SWEET": { obtained: false, name: "???", desc: "", date: "" },
      "BALANCED": { obtained: false, name: "???", desc: "", date: "" }
    };
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        // 解析 lifetimeHeirlooms，如果沒有則使用預設值
        let heirlooms = defaultHeirlooms;
        try {
          if (data[i][7] && data[i][7] !== "") {
            heirlooms = JSON.parse(data[i][7]);
          }
        } catch (e) {
          Logger.log("解析 lifetimeHeirlooms 錯誤: " + e);
        }
        
        return {
          userId: data[i][0],
          currentDay: data[i][1] || 1,
          phase: data[i][2] || PHASE.NIGHT,
          collectedMemories: JSON.parse(data[i][3] || "[]"),
          topicsDone: JSON.parse(data[i][4] || "[]"),
          lastActive: data[i][5] || "",
          dishesCooked: JSON.parse(data[i][6] || "[]"),
          lifetimeHeirlooms: heirlooms
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
    
    // 預設的 lifetimeHeirlooms 結構
    const defaultHeirlooms = {
      "BITTER": { obtained: false, name: "???", desc: "", date: "" },
      "SWEET": { obtained: false, name: "???", desc: "", date: "" },
      "BALANCED": { obtained: false, name: "???", desc: "", date: "" }
    };
    
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        if (updates.currentDay !== undefined) sheet.getRange(i + 1, 2).setValue(updates.currentDay);
        if (updates.phase !== undefined) sheet.getRange(i + 1, 3).setValue(updates.phase);
        if (updates.collectedMemories !== undefined) sheet.getRange(i + 1, 4).setValue(JSON.stringify(updates.collectedMemories));
        if (updates.topicsDone !== undefined) sheet.getRange(i + 1, 5).setValue(JSON.stringify(updates.topicsDone));
        if (updates.lastActive !== undefined) sheet.getRange(i + 1, 6).setValue(updates.lastActive);
        if (updates.dishesCooked !== undefined) sheet.getRange(i + 1, 7).setValue(JSON.stringify(updates.dishesCooked));
        if (updates.lifetimeHeirlooms !== undefined) sheet.getRange(i + 1, 8).setValue(JSON.stringify(updates.lifetimeHeirlooms));
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
        updates.lastActive || new Date().toISOString(),
        JSON.stringify(updates.dishesCooked || []),
        JSON.stringify(updates.lifetimeHeirlooms || defaultHeirlooms)
      ]);
    }
  } catch (error) {
    Logger.log("updateUserState 錯誤: " + error);
  }
}

function initializeUser(userId) {
  // 預設的 lifetimeHeirlooms 結構（新用戶使用）
  const defaultHeirlooms = {
    "BITTER": { obtained: false, name: "???", desc: "", date: "" },
    "SWEET": { obtained: false, name: "???", desc: "", date: "" },
    "BALANCED": { obtained: false, name: "???", desc: "", date: "" }
  };
  
  updateUserState(userId, {
    currentDay: 1,
    phase: PHASE.NIGHT,
    collectedMemories: [],
    topicsDone: [],
    lastActive: new Date().toISOString(),
    dishesCooked: [],
    lifetimeHeirlooms: defaultHeirlooms
  });
}

/**
 * 重置用戶狀態（保留 lifetimeHeirlooms）
 * 用於「重新開始」按鈕，讓玩家可以重玩但保留圖鑑進度
 */
function resetUser(userId) {
  // 先取得現有的 lifetimeHeirlooms（如果有的話）
  const existingState = getUserState(userId);
  const existingHeirlooms = existingState ? existingState.lifetimeHeirlooms : null;
  
  // 預設的 lifetimeHeirlooms 結構
  const defaultHeirlooms = {
    "BITTER": { obtained: false, name: "???", desc: "", date: "" },
    "SWEET": { obtained: false, name: "???", desc: "", date: "" },
    "BALANCED": { obtained: false, name: "???", desc: "", date: "" }
  };
  
  updateUserState(userId, {
    currentDay: 1,
    phase: PHASE.NIGHT,
    collectedMemories: [],
    topicsDone: [],
    lastActive: new Date().toISOString(),
    dishesCooked: [],
    // 保留已獲得的遺物（跨輪次保留）
    lifetimeHeirlooms: existingHeirlooms || defaultHeirlooms
  });
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

/** 記錄本輪做過的料理（Day 1-2）。用於 Day 3 結局額外台詞和五味計算。 */
function addDishCooked(userId, state, dish) {
  const list = state.dishesCooked || [];
  if (!list.includes(dish)) {
    list.push(dish);
    updateUserState(userId, { dishesCooked: list });
  }
}

/**
 * 儲存遺物到 lifetimeHeirlooms（策略A：覆蓋制）
 * 每次達成結局時，更新對應遺物的資訊為最新變體描述
 * @param {string} userId - 用戶 ID
 * @param {object} state - 用戶狀態
 * @param {string} endingType - 結局類型 (ENDING_BITTER / ENDING_SWEET / ENDING_BALANCED)
 * @param {string} heirloomName - 遺物名稱
 * @param {string} heirloomDesc - 遺物描述（當次的變體描述）
 */
function saveHeirloomToLifetime(userId, state, endingType, heirloomName, heirloomDesc) {
  try {
    // 取得現有的 lifetimeHeirlooms
    const currentState = getUserState(userId);
    if (!currentState) {
      Logger.log("saveHeirloomToLifetime: 找不到用戶狀態");
      return;
    }
    
    // 預設結構
    const defaultHeirlooms = {
      "BITTER": { obtained: false, name: "???", desc: "", date: "" },
      "SWEET": { obtained: false, name: "???", desc: "", date: "" },
      "BALANCED": { obtained: false, name: "???", desc: "", date: "" }
    };
    
    const heirlooms = currentState.lifetimeHeirlooms || defaultHeirlooms;
    
    // 根據結局類型決定要更新哪個遺物
    let heirloomKey = "BALANCED";
    if (endingType === "ENDING_BITTER") {
      heirloomKey = "BITTER";
    } else if (endingType === "ENDING_SWEET") {
      heirloomKey = "SWEET";
    }
    
    // 更新對應遺物（策略A：覆蓋制 - 每次更新為最新變體描述）
    heirlooms[heirloomKey] = {
      obtained: true,
      name: heirloomName,
      desc: heirloomDesc,
      date: new Date().toISOString().split('T')[0] // 只取日期部分
    };
    
    // 儲存更新後的 lifetimeHeirlooms
    updateUserState(userId, { lifetimeHeirlooms: heirlooms });
    
    Logger.log("遺物已儲存: " + heirloomKey + " = " + heirloomName);
  } catch (error) {
    Logger.log("saveHeirloomToLifetime 錯誤: " + error);
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
    // ⚠️ 注意：這裡有 3 條文字 + 1 個 flex = 4 條，符合限制
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
/** LINE 單次 reply/push 最多 5 則訊息 */
const LINE_MESSAGE_LIMIT = 5;

function replyMessage(replyToken, message) {
  const url = "https://api.line.me/v2/bot/message/reply";
  const arr = Array.isArray(message) ? message : [message];
  const messages = arr.slice(0, LINE_MESSAGE_LIMIT);
  if (arr.length > LINE_MESSAGE_LIMIT && CONFIG.DEBUG_MODE) {
    Logger.log("replyMessage 超過 " + LINE_MESSAGE_LIMIT + " 條，已截斷。原數量: " + arr.length);
  }
  const payload = {
    replyToken: replyToken,
    messages: messages
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
  const arr = Array.isArray(messages) ? messages : [messages];
  const capped = arr.slice(0, LINE_MESSAGE_LIMIT);
  if (arr.length > LINE_MESSAGE_LIMIT && CONFIG.DEBUG_MODE) {
    Logger.log("pushMessages 超過 " + LINE_MESSAGE_LIMIT + " 條，已截斷。原數量: " + arr.length);
  }
  const payload = {
    to: userId,
    messages: capped
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
              type: "image",
              url: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/opening_black_cat_hero.png?v=2",
              size: "full",
              aspectRatio: "3:2",
              aspectMode: "cover"
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
              type: "image",
              url: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/day1_night_old_man_enters.png?v=2",
              size: "full",
              aspectRatio: "3:2",
              aspectMode: "cover"
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
        label: "🗨️ 你的手",
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
  
  // Day 1 延伸：你的手 → 最驕傲的事（縱向深挖）
  if (topicsDone.includes("hands_part2") && !topicsDone.includes("hands_pride")) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "✨ 那…最驕傲的事？",
        text: "那…這雙手做過最驕傲的事是什麼？"
      },
      style: "secondary",
      color: "#9C27B0"
    });
  }
  
  // V4.5 新增：Day 1 延伸 → 空蕩的店（職人黃昏）
  if (topicsDone.includes("hands_part2") && !topicsDone.includes("twilight_artisan")) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "📉 後來呢？",
        text: "既然你是裁縫，店裡生意應該很好吧？"
      },
      style: "secondary",
      color: "#607D8B"
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
  
  // 玩家選擇「你的手」話題（放寬匹配：按鈕 exact / 含關鍵字皆可）
  const isHandsTopic = (userText === "你的手...是做什麼工作的？") ||
    (userText.includes("你的手") && userText.includes("做什麼工作"));
  
  if (isHandsTopic && !topicsDone.includes("hands_part1")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "hands_part1");
    replyMessage(event.replyToken, getDay1TopicHandsMessages_Part1());
    return;
  }
  
  // 處理「繼續」→ 發送 Part 2，然後回到話題選擇畫面
  if (userText === "【繼續】" && topicsDone.includes("hands_part1") && !topicsDone.includes("hands_part2")) {
    showLoadingAnimation(userId, 5);
    addMemory(userId, state, "針");
    addMemory(userId, state, "縫線");
    addMemory(userId, state, "寒冷");
    addMemory(userId, state, "裁縫手藝");
    addTopic(userId, state, "hands_part2");
    const updatedState = getUserState(userId);  // 重新獲取更新後的狀態
    // Part 2 內容 + 回到話題選擇畫面（顯示延伸話題按鈕）
    var part2Messages = getDay1TopicHandsMessages_Part2_NoQuickReply();
    part2Messages.push(getDay1DayShift(updatedState));
    replyMessage(event.replyToken, part2Messages);
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
  
  // Day 1 延伸：你的手 → 最驕傲的事（縱向深挖，玩家不知背景僅追問）
  const isHandsPride = (userText === "那…這雙手做過最驕傲的事是什麼？") ||
    (userText.includes("最驕傲") && userText.includes("手"));
  if (isHandsPride && topicsDone.includes("hands_part2") && !topicsDone.includes("hands_pride")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "hands_pride");
    addMemory(userId, state, "銀座的驕傲");
    const updatedState = getUserState(userId);
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "【老人看著自己的手，沉默了很久】"
      },
      {
        type: "text",
        text: "「銀座……有一間店。」\n「父親傳給我的。那時候，很多人穿我做的西裝。」\n「有一個明星……穿過我做的。」"
      },
      {
        type: "text",
        text: "【他眼神有一瞬間亮了起來】\n「……那大概，是最驕傲的吧。」"
      },
      {
        type: "text",
        text: "✨ 獲得記憶食材：銀座的驕傲"
      },
      getDay1DayShift(updatedState)
    ]);
    return;
  }
  
  // V4.5 新增：Day 1 延伸 → 空蕩的店（職人黃昏）
  const isTwilightArtisan = (userText === "既然你是裁縫，店裡生意應該很好吧？") ||
    (userText.includes("生意") && userText.includes("好"));
  if (isTwilightArtisan && topicsDone.includes("hands_part2") && !topicsDone.includes("twilight_artisan")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "twilight_artisan");
    addMemory(userId, state, "空蕩的店");
    const updatedState = getUserState(userId);
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "【老人苦笑了一聲】\n\n「那是...很久以前的事了。」"
      },
      {
        type: "text",
        text: "「後來，大家都去買成衣了。」\n「便宜，快速，穿壞了就丟。」\n\n「我的店...越來越安靜。」\n「以前從早到晚都是剪刀的聲音，後來...只剩下時鐘的聲音。」"
      },
      {
        type: "text",
        text: "【他看著自己充滿針孔的手】\n\n「這雙手以前被很多人需要。」\n「但現在...連穿針都會抖，也沒人願意等了。」"
      },
      {
        type: "text",
        text: "✨ 獲得記憶食材：📉 空蕩的店"
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
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "hands_part1");
    replyMessage(event.replyToken, getDay1TopicHandsMessages_Part1());
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

// Part 2：記憶閃現（不帶 quickReply，會接話題選擇畫面）
function getDay1TopicHandsMessages_Part2_NoQuickReply() {
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
      text: "「對！我是裁縫！」\n\n✨ 獲得記憶食材：🪡 針、🧵 縫線、💧 寒冷、✂️ 裁縫手藝"
    }
  ];
}

// Part 2：記憶閃現（舊版，帶 quickReply，保留向後兼容）
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
      text: "✨ 獲得記憶食材：🪡 針、🧵 縫線、💧 寒冷、✂️ 裁縫手藝",
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
      hero: {
        type: "image",
        url: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/day1_memory_hands_needle.png?v=2",
        size: "full",
        aspectRatio: "3:2",
        aspectMode: "cover"
      },
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
    "【靜靜陪伴】",
    "那…這雙手做過最驕傲的事是什麼？"
  ];
  if (topicInputs.includes(userText) || (userText.includes("最驕傲") && userText.includes("手"))) {
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
    if (shouldUseLiffCooking()) {
      showLoadingAnimation(userId, 5);
      replyMessage(event.replyToken, [
        { type: "text", text: "請點擊上方「開始料理」按鈕開啟料理。" },
        getDay1CookingScene(state)
      ]);
      return;
    }
    const memories = state.collectedMemories || [];
    if (!getDay1AvailableRecipes(memories).includes("熱茶")) {
      showLoadingAnimation(userId, 5);
      replyMessage(event.replyToken, [
        { type: "text", text: "【黑貓】\n「還缺熱茶配方喔。選『你的手』或『沉默陪伴』聊聊吧。」" },
        getDay1CookingScene(state)
      ]);
      return;
    }
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "cooking_tea_part1");
    replyMessage(event.replyToken, getDay1CookingTea_Part1(state));  // V4.10: 傳入 state
    return;
  }
  // 處理【繼續】→ Part 2
  else if (userText === "【繼續】" && topicsDone.includes("cooking_tea_part1") && !topicsDone.includes("cooking_tea_part2")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "cooking_tea_part2");
    replyMessage(event.replyToken, getDay1CookingTea_Part2());
    return;
  }
  // 處理【繼續】→ Part 3
  else if (userText === "【繼續】" && topicsDone.includes("cooking_tea_part2") && !topicsDone.includes("cooking_tea_part3")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "cooking_tea_part3");
    addDishCooked(userId, state, "熱茶");
    updateUserState(userId, {
      phase: PHASE.AFTER,
      lastActive: new Date().toISOString()
    });
    replyMessage(event.replyToken, getDay1CookingTea_Part3());
    return;
  }
  else if (userText === "做熱湯" || userText === "【做熱湯】" || userText.includes("熱湯")) {
    if (shouldUseLiffCooking()) {
      showLoadingAnimation(userId, 5);
      replyMessage(event.replyToken, [
        { type: "text", text: "請點擊上方「開始料理」按鈕開啟料理。" },
        getDay1CookingScene(state)
      ]);
      return;
    }
    const memories = state.collectedMemories || [];
    if (!getDay1AvailableRecipes(memories).includes("熱湯")) {
      showLoadingAnimation(userId, 5);
      replyMessage(event.replyToken, [
        { type: "text", text: "【黑貓】\n「還缺雨聲、失憶或迷茫喔。再去聊聊他吧。」" },
        getDay1CookingScene(state)
      ]);
      return;
    }
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "cooking_soup_part1");
    addDishCooked(userId, state, "熱湯");
    replyMessage(event.replyToken, getDay1CookingSoup_Part1(state));  // V4.10: 傳入 state
    return;
  }
  // 處理【繼續】→ Part 2（記憶劇場）
  else if (userText === "【繼續】" && topicsDone.includes("cooking_soup_part1") && !topicsDone.includes("cooking_soup_part2")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "cooking_soup_part2");
    updateUserState(userId, {
      phase: PHASE.AFTER,
      lastActive: new Date().toISOString()
    });
    replyMessage(event.replyToken, getDay1CookingSoup_Part2());
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

/** Day 1 依食材判斷可做料理。 */
function getDay1AvailableRecipes(memories) {
  const m = (x) => (memories || []).includes(x);
  const out = [];
  if (m("寒冷") || m("針") || m("縫線") || (m("寧靜") && m("陪伴"))) out.push("熱茶");
  if (m("雨聲") || m("失憶") || m("迷茫")) out.push("熱湯");
  return out;
}

function getDay1CookingScene(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  const recipes = getDay1AvailableRecipes(memories);
  
  // 構建記憶食材列表
  let memoryText = "";
  if (memories.length > 0) {
    memoryText = memories.map(m => `• ${m}`).join("\n");
  } else {
    memoryText = "（尚未收集）";
  }
  
  const footerContents = [];
  if (shouldUseLiffCooking() && recipes.length > 0) {
    const btn = getLiffCookingButton("🍳 開始料理");
    if (btn) footerContents.push(btn);
  } else {
    if (recipes.includes("熱茶")) {
      footerContents.push({
        type: "button",
        action: { type: "message", label: "☕ 做熱茶", text: "【做熱茶】" },
        style: "primary",
        color: "#FF6B6B"
      });
    }
    if (recipes.includes("熱湯")) {
      footerContents.push({
        type: "button",
        action: { type: "message", label: "🍜 做熱湯", text: "【做熱湯】" },
        style: "primary",
        color: "#4ECDC4"
      });
    }
  }
  if (footerContents.length === 0) {
    footerContents.push({
      type: "text",
      text: "還缺食材...再多跟他聊聊吧。",
      size: "sm",
      color: "#999999",
      align: "center",
      wrap: true
    });
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
                text: recipes.length > 0 ? "「怎麼樣？聊出什麼了？」" : "「...還不夠。再聊聊。」",
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
        contents: footerContents
      }
    }
  };
}

// ============================================================
// Day 1 After Hours - 記憶劇場
// ============================================================
function handleDay1After(event, userId, state, userText) {
  const topicsDone = state ? (state.topicsDone || []) : [];
  
  // LIFF 料理完成後 phase 已為 AFTER，【繼續】須在此處理（與 handleDay1Cooking 邏輯對齊）
  if (userText === "【繼續】" && topicsDone.includes("cooking_tea_part1") && !topicsDone.includes("cooking_tea_part2")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "cooking_tea_part2");
    replyMessage(event.replyToken, getDay1CookingTea_Part2());
    return;
  }
  if (userText === "【繼續】" && topicsDone.includes("cooking_tea_part2") && !topicsDone.includes("cooking_tea_part3")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "cooking_tea_part3");
    addDishCooked(userId, state, "熱茶");
    updateUserState(userId, { phase: PHASE.AFTER, lastActive: new Date().toISOString() });
    replyMessage(event.replyToken, getDay1CookingTea_Part3());
    return;
  }
  if (userText === "【繼續】" && topicsDone.includes("cooking_soup_part1") && !topicsDone.includes("cooking_soup_part2")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "cooking_soup_part2");
    updateUserState(userId, { phase: PHASE.AFTER, lastActive: new Date().toISOString() });
    replyMessage(event.replyToken, getDay1CookingSoup_Part2());
    return;
  }
  
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
// V4.10 更新：動態顯示玩家實際收集的記憶（有啥食材顯示啥）
function getDay1CookingTea_Part1(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  
  // 篩選與熱茶相關的記憶
  const teaMemories = ["針", "縫線", "寒冷", "寧靜", "陪伴"];
  const collected = memories.filter(m => teaMemories.includes(m));
  
  // 根據收集的記憶決定顯示內容
  let memoryName = "";
  let memoryVisual = "";
  let teaColor = "";
  
  if (collected.includes("寒冷")) {
    memoryName = "寒冷的記憶";
    memoryVisual = "那團發光的藍色霧氣";
    teaColor = "從透明，變成淡淡的藍。\n\n像冬日的天空。";
  } else if (collected.includes("針")) {
    memoryName = "針的記憶";
    memoryVisual = "那根閃爍的銀色光芒";
    teaColor = "從透明，變成淡淡的銀。\n\n像月光下的針尖。";
  } else if (collected.includes("縫線")) {
    memoryName = "縫線的記憶";
    memoryVisual = "那縷纏繞的金色絲線";
    teaColor = "從透明，變成淡淡的金。\n\n像記憶中的絲線。";
  } else if (collected.includes("寧靜") || collected.includes("陪伴")) {
    memoryName = "寧靜的記憶";
    memoryVisual = "那團柔和的暖光";
    teaColor = "從透明，變成淡淡的暖黃。\n\n像午後的陽光。";
  } else {
    // 預設（理論上不應該到這裡，因為解鎖條件會檢查）
    memoryName = "記憶";
    memoryVisual = "那團發光的霧氣";
    teaColor = "從透明，變成了別的顏色。";
  }
  
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
      text: `你：「${memoryName}...？」\n\n【你小心地將${memoryVisual}放入茶壺】`
    },
    {
      type: "text",
      text: "茶水開始變色。"
    },
    {
      type: "text",
      text: teaColor,
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

// Day 1 Cooking Tea - Part 3（記憶劇場卡片 + 結束）- 合併訊息確保 ≤5 條
function getDay1CookingTea_Part3() {
  return [
    {
      type: "text",
      text: "【老人接過茶杯，慢慢喝了一口】\n\n【他的表情變了】\n\n「這個味道...」\n「是溫暖的。」"
    },
    {
      type: "text",
      text: "【記憶在茶水中浮現...】"
    },
    getDay1CookingMemoryCard(),
    {
      type: "text",
      text: "【老人睜開眼，眼中有淚光】\n\n「有個人...曾經給我泡過茶。」\n「很小的手...捧著茶杯的小手...」",
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
      hero: {
        type: "image",
        url: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/day1_memory_attic_tea.png",
        size: "full",
        aspectRatio: "3:2",
        aspectMode: "cover"
      },
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

// Day 1 Cooking Soup - Part 1（烹飪過程）- 最多 5 條消息
// V4.10 更新：動態顯示玩家實際收集的記憶（有啥食材顯示啥）
function getDay1CookingSoup_Part1(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  
  // 篩選與熱湯相關的記憶
  const soupMemories = ["雨聲", "失憶", "迷茫"];
  const collected = memories.filter(m => soupMemories.includes(m));
  
  // 動態生成記憶食材列表
  let memoryList = "";
  if (collected.length > 0) {
    memoryList = collected.map(m => `「${m}」`).join("、");
  } else {
    memoryList = "「記憶」";
  }
  
  return [
    {
      type: "text",
      text: `【烹飪演出】\n\n你將蔬菜、鹽與記憶食材放入鍋中...\n\n${memoryList}——\n在熱氣裡翻滾，又苦又冷。`
    },
    {
      type: "text",
      text: "【黑貓跳上灶台旁邊，聞了聞】\n\n「嗯。這個味道...很清醒。」\n\n你：「清醒？」\n\n【黑貓】\n「對啊。苦的東西會讓人清醒。\n就像...承認現實一樣。」"
    },
    {
      type: "text",
      text: "[料理完成]\n\n清澈的熱湯。"
    },
    {
      type: "text",
      text: "你將湯遞給老人。"
    },
    {
      type: "text",
      text: "【老人接過湯碗】",
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "繼續", text: "【繼續】" }
        }]
      }
    }
  ];
}

// Day 1 Cooking Soup - Part 2（記憶劇場）- ≤5 條
function getDay1CookingSoup_Part2() {
  return [
    {
      type: "text",
      text: "【他舀起一口，放進嘴裡】\n\n【老人的表情變了】\n\n「這個味道...」\n「是苦的。但...很清醒。」"
    },
    {
      type: "text",
      text: "沉默。\n\n【老人的眼神變得恍惚】"
    },
    getDay1SoupMemoryCard(),
    {
      type: "text",
      text: "【老人回過神，眼神變得清晰】\n\n「我...想起來了。」\n\n「我在店裡...迷路了。」",
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "明天繼續", text: "【明天繼續】" }
        }]
      }
    }
  ];
}

// Day 1 熱湯記憶劇場卡片
function getDay1SoupMemoryCard() {
  return {
    type: "flex",
    altText: "記憶劇場",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/day1_memory_empty_workshop.png",
        size: "full",
        aspectRatio: "3:2",
        aspectMode: "cover"
      },
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
            text: "【空蕩的工房】",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: "他站在布料堆裡，\n像一個迷失的孩子。",
            wrap: true,
            margin: "xs",
            size: "sm"
          },
          {
            type: "text",
            text: "「⋯⋯門在哪裡？」",
            wrap: true,
            margin: "md",
            size: "sm"
          },
          {
            type: "text",
            text: "明明是他待了四十年的地方，\n他卻找不到門在哪裡。",
            wrap: true,
            margin: "xs",
            size: "xs",
            color: "#AAAAAA"
          },
          {
            type: "text",
            text: "「我⋯⋯為什麼在這裡？」",
            wrap: true,
            margin: "md",
            size: "sm"
          },
          {
            type: "text",
            text: "【旁白】",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: "醫生說，是阿茲海默症。",
            wrap: true,
            margin: "xs",
            size: "xs",
            color: "#AAAAAA"
          },
          {
            type: "text",
            text: "「田中先生，您需要有人照顧。」",
            wrap: true,
            margin: "xs",
            size: "xs",
            color: "#AAAAAA"
          },
          {
            type: "text",
            text: "他拒絕了。",
            wrap: true,
            margin: "xs",
            size: "xs",
            color: "#AAAAAA"
          },
          {
            type: "text",
            text: "「我還有事情沒做完。」",
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
        label: "💭 那個夢",
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
  
  // Day 2 延伸：那個夢 → 關於美雪小時候（玩家依夢境追問，無上帝視角）
  if (topicsDone.includes("dream_part3") && !topicsDone.includes("miyuki_childhood")) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "✨ 夢裡那個小女孩…",
        text: "夢裡那個小女孩…她小時候是什麼樣子？"
      },
      style: "secondary",
      color: "#E91E63"
    });
  }
  
  // V4.5 新增：Day 2 延伸 → 缺席的典禮（裂痕事件）
  if (topicsDone.includes("dream_part3") && !topicsDone.includes("ceremony_rift")) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "💔 為什麼她會哭？",
        text: "你說她常哭...是因為你做了什麼嗎？"
      },
      style: "secondary",
      color: "#D32F2F"
    });
  }
  
  // Day 2 延伸：你怎麼來的 → 雪中那時（玩家依「雪、迷路」追問）
  if (topicsDone.includes("death") && !topicsDone.includes("snow_then")) {
    buttons.push({
      type: "button",
      action: {
        type: "message",
        label: "✨ 雪中那時…",
        text: "你說有很多雪…那時候你原本在做什麼？"
      },
      style: "secondary",
      color: "#546E7A"
    });
  }
  
  // 計算 Day 2 完成的話題數量
  const day2Topics = ["dream_part3", "search", "death", "miyuki_childhood", "snow_then"];
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
    addTopic(userId, state, "dream_part1");
    addMemory(userId, state, "蜜糖笑容");
    replyMessage(event.replyToken, getDay2TopicDreamMessages_Part1());
    return;
  }
  
  // 玩家點擊「繼續」- 發送第 2 波（記憶閃現）
  if (userText === "【繼續】" && topicsDone.includes("dream_part1") && !topicsDone.includes("dream_part2")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "dream_part2");
    addMemory(userId, state, "女兒-美雪");
    addMemory(userId, state, "婚紗");
    replyMessage(event.replyToken, getDay2TopicDreamMessages_Part2());
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
  
  // === Day 2 延伸：那個夢 → 關於美雪小時候（玩家依夢境追問）===
  const isMiyukiChildhood = (userText === "夢裡那個小女孩…她小時候是什麼樣子？") ||
    (userText.includes("夢裡") && userText.includes("小女孩") && userText.includes("小時候"));
  if (isMiyukiChildhood && topicsDone.includes("dream_part3") && !topicsDone.includes("miyuki_childhood")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "miyuki_childhood");
    addMemory(userId, state, "美雪的笑容");
    addMemory(userId, state, "第一次叫爸爸");
    const updatedState = getUserState(userId);
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "【老人沉默了一會】\n\n「她…小時候，很愛笑。」"
      },
      {
        type: "text",
        text: "「拿一張畫跑進來說『爸爸你看』…」\n「便當做太甜，我還說少放點糖。」\n「第一次叫爸爸的時候…」\n【他沒說下去】"
      },
      {
        type: "text",
        text: "✨ 獲得記憶食材：🍯 美雪的笑容、👶 第一次叫爸爸"
      },
      getDay2DayShift(updatedState)
    ]);
    return;
  }
  
  // === Day 2 延伸：你怎麼來的 → 雪中那時（玩家依雪、迷路追問）===
  const isSnowThen = (userText === "你說有很多雪…那時候你原本在做什麼？") ||
    (userText.includes("雪") && userText.includes("那時候") && userText.includes("做什麼"));
  if (isSnowThen && topicsDone.includes("death") && !topicsDone.includes("snow_then")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "snow_then");
    addMemory(userId, state, "最後一針");
    addMemory(userId, state, "閣樓");
    addMemory(userId, state, "執念");  // 補充：最後一針的執念，解鎖苦辛醒神湯
    const updatedState = getUserState(userId);
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "【他閉上眼】\n\n「閣樓…在做一件衣服。」"
      },
      {
        type: "text",
        text: "「最後一針…穿過去…然後……」\n「我忘了門在哪。下了樓，外面都是雪。」\n「就一直走…」"
      },
      {
        type: "text",
        text: "✨ 獲得記憶食材：🪡 最後一針、🏚️ 閣樓、🎯 執念"
      },
      getDay2DayShift(updatedState)
    ]);
    return;
  }
  
  // === V4.5 新增：Day 2 延伸 → 缺席的典禮（裂痕事件）===
  const isCeremonyRift = (userText === "你說她常哭...是因為你做了什麼嗎？") ||
    (userText.includes("哭") && userText.includes("做了什麼"));
  if (isCeremonyRift && topicsDone.includes("dream_part3") && !topicsDone.includes("ceremony_rift")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "ceremony_rift");
    addMemory(userId, state, "缺席的典禮");
    const updatedState = getUserState(userId);
    replyMessage(event.replyToken, [
      {
        type: "text",
        text: "【老人的身體僵硬了一下】\n\n「那天...是她的高中入學典禮。」\n「我答應過會去的。真的。」"
      },
      {
        type: "text",
        text: "「但是，首相的西裝必須在明天交貨。」\n「那是國家的委託...是榮耀...」"
      },
      {
        type: "text",
        text: "【記憶閃回】\n\n美雪站在門口，胸口沒有別胸花。\n\n「那件西裝很重要嗎？...比我重要嗎？」\n\n田中手裡的針沒有停。\n他想說「對不起」，但他說不出口。\n美雪轉身跑了出去。"
      },
      {
        type: "text",
        text: "【老人痛苦地抓著頭髮】\n\n「那件西裝很完美。但我永遠失去了我最重要的觀眾。」"
      },
      {
        type: "text",
        text: "✨ 獲得記憶食材：👔 缺席的典禮",
        quickReply: {
          items: [{ type: "action", action: { type: "message", label: "進入廚房", text: "【進入廚房】" } }]
        }
      }
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
      hero: {
        type: "image",
        url: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/day2_memory_drawing.png",
        size: "full",
        aspectRatio: "3:2",
        aspectMode: "cover"
      },
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
      hero: {
        type: "image",
        url: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/day2_memory_wedding_news.png",
        size: "full",
        aspectRatio: "3:2",
        aspectMode: "cover"
      },
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
      hero: {
        type: "image",
        url: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/day2_memory_promise.png?v=2",
        size: "full",
        aspectRatio: "3:2",
        aspectMode: "cover"
      },
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
    "你是怎麼來到這裡的？",
    "夢裡那個小女孩…她小時候是什麼樣子？",
    "你說有很多雪…那時候你原本在做什麼？"
  ];
  const isDay2Ext = (userText.includes("夢裡") && userText.includes("小女孩") && userText.includes("小時候")) ||
    (userText.includes("雪") && userText.includes("那時候") && userText.includes("做什麼"));
  if (day2TopicInputs.includes(userText) || isDay2Ext) {
    updateUserState(userId, { phase: PHASE.DAY });
    state.phase = PHASE.DAY;
    handleDay2Day(event, userId, state, userText);
    return;
  }
  
  if (userText === "廚房" || userText === "【進入廚房】" || userText === "【廚房】" || userText.includes("料理")) {
    showLoadingAnimation(userId, 5);
    replyMessage(event.replyToken, getDay2CookingScene(state));
    return;
  } else if (userText.includes("蜜汁") || userText.includes("燉菜") || userText === "【做蜜汁燉菜】") {
    if (shouldUseLiffCooking()) {
      showLoadingAnimation(userId, 5);
      replyMessage(event.replyToken, [
        { type: "text", text: "請點擊上方「開始料理」按鈕開啟料理。" },
        getDay2CookingScene(state)
      ]);
      return;
    }
    const memories = state.collectedMemories || [];
    if (!getDay2AvailableRecipes(memories).includes("蜜汁燉菜")) {
      showLoadingAnimation(userId, 5);
      replyMessage(event.replyToken, [
        { type: "text", text: "【黑貓】\n「還缺蜜糖笑容跟眼淚喔。再去聊聊他吧。」" },
        getDay2CookingScene(state)
      ]);
      return;
    }
    showLoadingAnimation(userId, 5);
    addDishCooked(userId, state, "蜜汁燉菜");
    updateUserState(userId, { phase: PHASE.AFTER, lastActive: new Date().toISOString() });
    replyMessage(event.replyToken, getDay2CookingResult(state));  // V4.10: 傳入 state
    return;
  } else if (userText.includes("苦辛") || userText.includes("醒神") || userText === "【做苦辛醒神湯】") {
    if (shouldUseLiffCooking()) {
      showLoadingAnimation(userId, 5);
      replyMessage(event.replyToken, [
        { type: "text", text: "請點擊上方「開始料理」按鈕開啟料理。" },
        getDay2CookingScene(state)
      ]);
      return;
    }
    const memories = state.collectedMemories || [];
    if (!getDay2AvailableRecipes(memories).includes("苦辛醒神湯")) {
      showLoadingAnimation(userId, 5);
      replyMessage(event.replyToken, [
        { type: "text", text: "【黑貓】\n「還缺執念跟雪或死亡喔。再多聊聊。」" },
        getDay2CookingScene(state)
      ]);
      return;
    }
    showLoadingAnimation(userId, 5);
    addDishCooked(userId, state, "苦辛醒神湯");
    updateUserState(userId, { phase: PHASE.AFTER, lastActive: new Date().toISOString() });
    replyMessage(event.replyToken, getDay2CookingResult_苦辛(state));  // V4.10: 傳入 state
    return;
  } else if (userText.includes("撫慰") || userText.includes("鹹粥") || userText === "【做撫慰鹹粥】") {
    if (shouldUseLiffCooking()) {
      showLoadingAnimation(userId, 5);
      replyMessage(event.replyToken, [
        { type: "text", text: "請點擊上方「開始料理」按鈕開啟料理。" },
        getDay2CookingScene(state)
      ]);
      return;
    }
    const memories = state.collectedMemories || [];
    if (!getDay2AvailableRecipes(memories).includes("撫慰鹹粥")) {
      showLoadingAnimation(userId, 5);
      replyMessage(event.replyToken, [
        { type: "text", text: "【黑貓】\n「還缺寧靜跟陪伴。 Day 1 選過沉默陪伴才有喔。」" },
        getDay2CookingScene(state)
      ]);
      return;
    }
    showLoadingAnimation(userId, 5);
    addDishCooked(userId, state, "撫慰鹹粥");
    addMemory(userId, state, "失語");  // V4.5 新增：翻譯者概念
    updateUserState(userId, { phase: PHASE.AFTER, lastActive: new Date().toISOString() });
    replyMessage(event.replyToken, getDay2CookingResult_撫慰());
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

/** 依收集的記憶判斷可做料理。回傳 ["蜜汁燉菜"] | ["苦辛醒神湯"] | ["撫慰鹹粥"] 等。 */
function getDay2AvailableRecipes(memories) {
  const m = (x) => (memories || []).includes(x);
  const out = [];
  if (m("蜜糖笑容") && m("眼淚")) out.push("蜜汁燉菜");
  if (m("執念") && (m("雪") || m("死亡"))) out.push("苦辛醒神湯");
  if (m("寧靜") && m("陪伴")) out.push("撫慰鹹粥");
  return out;
}

function getDay2CookingScene(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  const recipes = getDay2AvailableRecipes(memories);
  
  // 構建記憶食材列表
  let memoryText = "";
  if (memories.length > 0) {
    memoryText = memories.map(m => `• ${m}`).join("\n");
  } else {
    memoryText = "（尚未收集）";
  }
  
  const footerContents = [];
  if (shouldUseLiffCooking() && recipes.length > 0) {
    const btn = getLiffCookingButton("🍳 開始料理");
    if (btn) footerContents.push(btn);
  } else if (recipes.length > 0) {
    if (recipes.includes("蜜汁燉菜")) {
      footerContents.push({
        type: "button",
        action: { type: "message", label: "🍜 蜜汁燉菜（蜜糖+眼淚）", text: "【做蜜汁燉菜】" },
        style: "primary",
        color: "#E91E63"
      });
    }
    if (recipes.includes("苦辛醒神湯")) {
      footerContents.push({
        type: "button",
        action: { type: "message", label: "🥣 苦辛醒神湯（執念+雪）", text: "【做苦辛醒神湯】" },
        style: "primary",
        color: "#5C6BC0"
      });
    }
    if (recipes.includes("撫慰鹹粥")) {
      footerContents.push({
        type: "button",
        action: { type: "message", label: "🍲 撫慰鹹粥（寧靜+陪伴）", text: "【做撫慰鹹粥】" },
        style: "primary",
        color: "#43A047"
      });
    }
  } else {
    footerContents.push({
      type: "text",
      text: "還缺食材...再多跟他聊聊吧。",
      size: "sm",
      color: "#999999",
      align: "center",
      wrap: true
    });
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
                text: recipes.length > 0 ? "「哦？食材變多了啊。」" : "「...還不夠。再聊聊。」",
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
        contents: footerContents
      }
    }
  };
}

// V4.10 更新：動態顯示玩家實際收集的記憶（有啥食材顯示啥）
function getDay2CookingResult(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  
  // 篩選與蜜汁燉菜相關的記憶（移除寒冷 - 不是必要食材）
  const honeyMemories = ["蜜糖笑容", "眼淚"];
  const collected = memories.filter(m => honeyMemories.includes(m));
  
  // 動態生成記憶食材列表
  let memoryLines = "";
  if (collected.includes("蜜糖笑容")) {
    memoryLines += "金色的「蜜糖笑容」\n";
  }
  if (collected.includes("眼淚")) {
    memoryLines += "透明的「眼淚」\n";
  }
  if (memoryLines === "") {
    memoryLines = "「記憶」\n";
  }
  
  return [
    {
      type: "text",
      text: `【烹飪演出】\n\n你將記憶食材一個個放入鍋中...\n\n${memoryLines}\n它們在鍋中交融。`
    },
    {
      type: "text",
      text: "【黑貓跳上灶台旁邊，聞了聞】\n\n「嗯。不錯。」\n\n你：「...聞起來又甜又鹹。」\n\n【黑貓】\n「對啊。愛這種東西，本來就這樣。」\n「矛盾，複雜。但也最真。」"
    },
    {
      type: "text",
      text: "[料理完成]\n\n琥珀色的燉菜。\n\n【你將燉菜端給老人】\n\n【他舀起一口，放進嘴裡】\n\n【老人的表情變了】\n\n「這個味道...」\n「是甜的。又甜又鹹...」\n「像眼淚一樣...」"
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

/** Day 2 料理結果：苦辛醒神湯。最後一針 + 雪中。≤5 則一次 reply。 */
// V4.10 更新：動態顯示玩家實際收集的記憶 + 記憶劇場改為 Flex Card
function getDay2CookingResult_苦辛(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  
  // 篩選與苦辛醒神湯相關的記憶
  const bitterMemories = ["執念", "雪", "死亡"];
  const collected = memories.filter(m => bitterMemories.includes(m));
  
  // 動態生成記憶食材列表
  let memoryList = "";
  if (collected.length > 0) {
    memoryList = collected.map(m => `「${m}」`).join("、");
  } else {
    memoryList = "「記憶」";
  }
  
  return [
    {
      type: "text",
      text: `【烹飪演出】\n\n你將薑、鹹魚與記憶食材放入鍋中...\n\n${memoryList}——\n在熱氣裡翻滾，又苦又冷。`
    },
    {
      type: "text",
      text: "[料理完成]\n\n深色的湯，冒著熱氣。\n\n【你將湯端給老人】\n\n【他舀起一口，放進嘴裡】\n\n【老人的表情變了】\n\n「這個味道...」\n「是苦的。又苦又冷...」\n「像雪一樣...」"
    },
    // V4.10：記憶劇場改為 Flex Card
    {
      type: "flex",
      altText: "記憶劇場 - 閣樓",
      contents: {
        type: "bubble",
        hero: {
          type: "image",
          url: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/day2_memory_last_stitch.png",
          size: "full",
          aspectRatio: "3:2",
          aspectMode: "cover"
        },
        styles: {
          body: { backgroundColor: "#1A237E" }
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "💭 記憶劇場",
              weight: "bold",
              color: "#FFD700",
              size: "sm"
            },
            {
              type: "separator",
              margin: "md",
              color: "#3949AB"
            },
            {
              type: "text",
              text: "【閣樓，聖誕夜，大雪】",
              size: "xs",
              color: "#7986CB",
              margin: "md"
            },
            {
              type: "text",
              text: "他坐在婚紗前，手抖得厲害。",
              wrap: true,
              color: "#E8EAF6",
              margin: "md",
              size: "sm"
            },
            {
              type: "text",
              text: "「最後⋯⋯一針⋯⋯」",
              wrap: true,
              color: "#FFFFFF",
              margin: "sm"
            },
            {
              type: "text",
              text: "穿針，引線，刺入。",
              wrap: true,
              color: "#E8EAF6",
              margin: "sm",
              size: "sm"
            },
            {
              type: "text",
              text: "完成了。",
              wrap: true,
              color: "#FFD700",
              margin: "md",
              weight: "bold"
            },
            {
              type: "text",
              text: "「雪子⋯⋯我做好了⋯⋯」",
              wrap: true,
              color: "#FFFFFF",
              margin: "sm"
            },
            {
              type: "text",
              text: "他把婚紗疊好，放進衣櫃。\n「等美雪⋯⋯來找⋯⋯」",
              wrap: true,
              color: "#B0BEC5",
              margin: "md",
              size: "sm"
            }
          ]
        }
      }
    },
    // 第二段記憶劇場 Flex Card
    {
      type: "flex",
      altText: "記憶劇場 - 雪中",
      contents: {
        type: "bubble",
        hero: {
          type: "image",
          url: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/day2_memory_snow.png",
          size: "full",
          aspectRatio: "3:2",
          aspectMode: "cover"
        },
        styles: {
          body: { backgroundColor: "#263238" }
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "💭 記憶劇場",
              weight: "bold",
              color: "#81D4FA",
              size: "sm"
            },
            {
              type: "separator",
              margin: "md",
              color: "#37474F"
            },
            {
              type: "text",
              text: "【雪中，他走了一夜】",
              size: "xs",
              color: "#78909C",
              margin: "md"
            },
            {
              type: "text",
              text: "「好冷⋯⋯」「美雪⋯⋯」",
              wrap: true,
              color: "#ECEFF1",
              margin: "md"
            },
            {
              type: "text",
              text: "他想起舉著畫跑進工房的小女孩、\n做了太甜便當的女兒。",
              wrap: true,
              color: "#B0BEC5",
              margin: "sm",
              size: "sm"
            },
            {
              type: "text",
              text: "「爸爸要工作了⋯⋯你自己玩⋯⋯」",
              wrap: true,
              color: "#90A4AE",
              margin: "md",
              size: "sm"
            },
            {
              type: "text",
              text: "眼淚結成冰。",
              wrap: true,
              color: "#81D4FA",
              margin: "md"
            },
            {
              type: "text",
              text: "「對不起⋯⋯」\n「我做好了⋯⋯婚紗在櫃子裡⋯⋯」",
              wrap: true,
              color: "#FFFFFF",
              margin: "sm"
            },
            {
              type: "text",
              text: "雪覆蓋住他。很冷。\n但心裡，有一點點溫暖。",
              wrap: true,
              color: "#FFD54F",
              margin: "md",
              size: "sm"
            }
          ]
        }
      }
    },
    getDay2AfterFlex("又苦又冷", "「這味道……好冷。雪一直下。」", "「我……做好了……」")
  ];
}

/** Day 2 料理結果：撫慰鹹粥。V4.5 增強：翻譯者概念。≤5 則一次 reply。 */
function getDay2CookingResult_撫慰() {
  return [
    {
      type: "text",
      text: "【烹飪演出】\n\n你將鹹魚、薑與「寧靜」、「陪伴」放入粥裡。\n\n熱氣中，浮現出一個女人的身影。"
    },
    {
      type: "text",
      text: "【老人吃了一口，手停在半空中】\n\n「...雪子？」"
    },
    {
      type: "flex",
      altText: "記憶劇場 - 翻譯者",
      contents: {
        type: "bubble",
        hero: {
          type: "image",
          url: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/day2_memory_translator.png",
          size: "full",
          aspectRatio: "3:2",
          aspectMode: "cover"
        },
        styles: {
          body: { backgroundColor: "#FFF9E6" }
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: "💭 記憶劇場", weight: "bold", color: "#FFD700", size: "sm" },
            { type: "separator", margin: "md", color: "#FFD700" },
            { type: "text", text: "年輕的田中（笨拙地）：", size: "xs", color: "#999999", margin: "md" },
            { type: "text", text: "「我...這件衣服...」", wrap: true, margin: "xs" },
            { type: "text", text: "雪子（笑著接話）：", size: "xs", color: "#999999", margin: "md" },
            { type: "text", text: "「你是想說，這件衣服領口改低了，是因為擔心她脖子不舒服，對吧？」", wrap: true, margin: "xs", size: "sm" },
            { type: "text", text: "田中：「...嗯。」", wrap: true, margin: "md", color: "#AAAAAA" },
            { type: "text", text: "雪子：", size: "xs", color: "#999999", margin: "md" },
            { type: "text", text: "「別擔心，我會幫你翻譯的。\n你的針線話，我都聽得懂。」", wrap: true, margin: "xs", weight: "bold" }
          ]
        }
      }
    },
    {
      type: "text",
      text: "【畫面變暗】\n\n然而，翻譯的人走了。\n剩下一個啞巴父親，和一個聽不懂針線話的女兒。\n\n✨ 獲得記憶食材：🗣️ 失語"
    },
    getDay2AfterFlex("有人翻譯", "「她懂我……但她走了……」", "「從那之後，我的愛就變成了啞巴。」")
  ];
}

/** Day 2 料理後共用 flex：標題 + 端給老人 + 自訂句 + 記憶開啟 + 最後一天按鈕。 */
function getDay2AfterFlex(themeLabel, customLine, memoryLine) {
  return {
    type: "flex",
    altText: "Day 2 After Hours",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "🌃 After Hours", weight: "bold", color: "#546E7A" },
          { type: "separator", margin: "md" },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "md",
            contents: [
              { type: "text", text: "你將料理端給老人。", wrap: true },
              { type: "text", text: "【他吃了一口】", size: "sm", color: "#999999", wrap: true, margin: "md" },
              { type: "text", text: customLine, wrap: true, margin: "md" },
              { type: "separator", margin: "lg" },
              { type: "text", text: "【記憶劇場】", size: "sm", color: "#FFD700", wrap: true, weight: "bold" },
              { type: "text", text: memoryLine, wrap: true, margin: "md" }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "💭 Day 2 結束", size: "sm", color: "#999999", align: "center" },
          { type: "separator", margin: "md" },
          {
            type: "button",
            action: { type: "postback", label: "最後一天", data: "next_phase:2:after" },
            style: "primary",
            margin: "md"
          }
        ]
      }
    }
  };
}

/** 計算五味平衡（累加所有記憶標籤的五味數值） */
function calculateFlavorBalance(memories) {
  const flavors = { sweet: 0, sour: 0, bitter: 0, spicy: 0, salty: 0 };
  
  if (!memories || !Array.isArray(memories)) {
    return flavors;
  }
  
  memories.forEach(memory => {
    if (MEMORY_FLAVOR_MAP[memory]) {
      const map = MEMORY_FLAVOR_MAP[memory];
      flavors.sweet += map.sweet || 0;
      flavors.sour += map.sour || 0;
      flavors.bitter += map.bitter || 0;
      flavors.spicy += map.spicy || 0;
      flavors.salty += map.salty || 0;
    }
  });
  
  return flavors;
}

/** 判定結局類型（依據五味比例） */
function determineEnding(flavors) {
  const { sweet, sour, bitter, spicy, salty } = flavors;
  const others = sour + bitter + spicy + salty;
  
  // 情境 C：甜味過重（沉浸美好）- 優先判定
  // 甜味 > 其他四味總和
  if (sweet > others) {
    return "ENDING_SWEET";
  }
  
  // 情境 A：苦味過重（帶遺憾）
  // 苦味 > (甜味 + 鹹味)
  if (bitter > (sweet + salty)) {
    return "ENDING_BITTER";
  }
  
  // 情境 B：回甘平衡（釋懷）
  // (甜味 + 鹹味) >= (苦味 + 酸味)
  if ((sweet + salty) >= (bitter + sour)) {
    return "ENDING_BALANCED";
  }
  
  // 預設：普通結局（苦味過重）
  return "ENDING_BITTER";
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
// V4.9 更新：動態料理名稱、描述、按鈕（根據五味傾向）
// ============================================================
function getDay3CookingStart(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  
  // 1. 計算五味傾向與結局類型
  const flavors = calculateFlavorBalance(memories);
  const endingType = determineEnding(flavors);
  
  // 2. 根據結局類型決定料理名稱、描述、顏色
  let dishName = "";
  let dishDesc = "";
  let dishColor = "";
  let dishEmoji = "";
  let catComment = "";
  
  if (endingType === "ENDING_SWEET") {
    // 🍬 甜味過重：糖霜幻景拼盤
    dishEmoji = "🍬";
    dishName = "糖霜幻景拼盤";
    dishDesc = "被厚重糖粉覆蓋的雜亂拼盤。像雪一樣白，像夢一樣甜。";
    dishColor = "#E91E63"; // 粉紅
    catComment = "「把所有甜的都拼在一起...再撒上糖粉...這是要騙誰呢？」";
  } else if (endingType === "ENDING_BITTER") {
    // 🦴 苦味過重：千針冷骨湯
    dishEmoji = "🦴";
    dishName = "千針冷骨湯";
    dishDesc = "像針一樣銳利的魚骨，泡在冰冷的黑湯裡。每一口都是痛。";
    dishColor = "#455A64"; // 深灰藍
    catComment = "「只剩骨頭了...肉都沒了。這就是現實的滋味嗎？」";
  } else {
    // 🐟 平衡：百味蜜汁炙燒魚
    dishEmoji = "🐟";
    dishName = "百味蜜汁炙燒魚";
    dishDesc = "甜鹹交織，佐以人生百味。雖然有刺，但肉質鮮美。";
    dishColor = "#F57C00"; // 溫暖橘
    catComment = "「甜的、鹹的、苦的、酸的...全都有。這才像個人生嘛。」";
  }
  
  // 3. 構建記憶食材列表（只顯示玩家實際收集的）
  let memoryText = "";
  if (memories.length > 0) {
    memoryText = memories.map(m => `• ${m}`).join("\n");
  } else {
    memoryText = "（空無一物...你確定有好好聊天嗎？）";
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
                text: catComment,
                wrap: true,
                size: "sm"
              },
              {
                type: "text",
                text: `[投入食材] - ${memories.length} 個`,
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
                text: `[目標料理：${dishEmoji} ${dishName}]`,
                weight: "bold",
                size: "sm",
                margin: "md",
                color: dishColor
              },
              {
                type: "text",
                text: dishDesc,
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
        contents: (function() {
          const liffBtn = getLiffCookingButton("🍳 開始料理");
          if (shouldUseLiffCooking() && liffBtn) return [liffBtn];
          return [{
            type: "button",
            action: { type: "message", label: `${dishEmoji} 製作${dishName}`, text: "【製作最終料理】" },
            style: "primary",
            color: dishColor
          }];
        })()
      }
    }
  };
}

// V4.9 更新：傳遞 state 給動態化函數
function handleDay3Cooking(event, userId, state, userText) {
  const topicsDone = state.topicsDone || [];
  
  // 支援新舊料理名稱觸發（向下相容）
  if (userText.includes("最終料理") || userText.includes("製作") || userText === "【製作最終料理】" ||
      userText.includes("糖霜幻景拼盤") || userText.includes("千針冷骨湯") || userText.includes("百味蜜汁炙燒魚")) {
    if (shouldUseLiffCooking()) {
      showLoadingAnimation(userId, 5);
      replyMessage(event.replyToken, [
        { type: "text", text: "請點擊上方「開始料理」按鈕開啟料理。" },
        getDay3CookingStart(state)
      ]);
      return;
    }
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "cooking_final_part1");
    replyMessage(event.replyToken, getDay3CookingProcess_Part1(state)); // V4.9: 傳遞 state
    return;
  } 
  // 處理【繼續】→ Part 2（記憶融合卡片 + 完成）
  else if (userText === "【繼續】" && topicsDone.includes("cooking_final_part1") && !topicsDone.includes("cooking_final_part2")) {
    showLoadingAnimation(userId, 5);
    addTopic(userId, state, "cooking_final_part2");
    replyMessage(event.replyToken, getDay3CookingProcess_Part2(state)); // V4.9: 傳遞 state
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
    const updatedState = getUserState(userId);
    replyMessage(event.replyToken, getDay3Ending(updatedState));
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

// Day 3 Cooking - Part 1（烹飪過程）- V4.9 動態化
function getDay3CookingProcess_Part1(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  const flavors = calculateFlavorBalance(memories);
  const endingType = determineEnding(flavors);
  
  // 根據結局類型決定料理演出
  let cookingText1 = "";
  let cookingText2 = "";
  let cookingText3 = "";
  let cookingText4 = "";
  
  if (endingType === "ENDING_SWEET") {
    // 🍬 糖霜幻景拼盤的做法
    cookingText1 = "【烹飪演出】\n\n你開始把食材一個個\n擺在盤子上...";
    cookingText2 = "然後，小心地將那些發光的記憶\n撒在盤子中央。";
    cookingText3 = "金色的笑容、\n粉紅的童年、\n溫暖的擁抱...";
    cookingText4 = "最後，你撒上厚厚一層糖粉。\n\n像雪一樣白，把一切都蓋住了。";
  } else if (endingType === "ENDING_BITTER") {
    // 🦴 千針冷骨湯的做法
    cookingText1 = "【烹飪演出】\n\n你將魚骨放入冰冷的黑湯中...\n\n沒有滋滋聲，只有沉默。";
    cookingText2 = "然後，小心地將那些尖銳的記憶\n一根根放入湯裡。";
    cookingText3 = "藍色的針、\n灰色的遺忘、\n刺骨的寒冷...";
    cookingText4 = "它們在冷湯中沉澱，\n像針一樣刺著碗底。";
  } else {
    // 🐟 百味蜜汁炙燒魚的做法（平衡）
    cookingText1 = "【烹飪演出】\n\n你將鹹魚放入熱油...\n\n滋滋作響。";
    cookingText2 = "然後，小心地將那些發光的記憶\n一個個放入鍋中。";
    cookingText3 = "藍色的針、\n金色的笑容、\n透明的眼淚、\n白色的婚紗...";
    cookingText4 = "它們在高溫下融化，\n裹住每一吋魚肉。";
  }
  
  return [
    { type: "text", text: cookingText1 },
    { type: "text", text: cookingText2 },
    { type: "text", text: cookingText3 },
    {
      type: "text",
      text: cookingText4,
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "繼續", text: "【繼續】" }
        }]
      }
    }
  ];
}

// Day 3 Cooking - Part 2（記憶融合卡片 + 完成）- V4.9 動態化
function getDay3CookingProcess_Part2(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  const flavors = calculateFlavorBalance(memories);
  const endingType = determineEnding(flavors);
  
  // 根據結局類型決定料理完成文案
  let completeText = "";
  let serveText = "";
  let tasteText = "";
  
  if (endingType === "ENDING_SWEET") {
    // 🍬 糖霜幻景拼盤
    completeText = "[料理完成]\n\n雪白的糖粉覆蓋一切。\n\n這是田中太郎的記憶。\n甜得不真實。";
    serveText = "【你將拼盤端給老人】\n\n【他接過盤子，看著這道甜膩的料理】";
    tasteText = "【他舀起一口，放進嘴裡】\n\n【老人的表情變了】\n\n「這個味道...」\n「好甜...像夢一樣甜...」\n「這是...真的嗎？」";
  } else if (endingType === "ENDING_BITTER") {
    // 🦴 千針冷骨湯
    completeText = "[料理完成]\n\n冰冷的黑湯，浮著銳利的魚骨。\n\n這是田中太郎的記憶。\n赤裸的。";
    serveText = "【你將湯碗端給老人】\n\n【他接過碗，看著這道刺骨的料理】";
    tasteText = "【他喝了一口湯】\n\n【老人的表情變了】\n\n「這個味道...」\n「好冷...像針一樣刺...」\n「這就是...真相嗎？」";
  } else {
    // 🐟 百味蜜汁炙燒魚（平衡）
    completeText = "[料理完成]\n\n琥珀色的魚肉閃著光。\n\n這是田中太郎的記憶。\n完整的。";
    serveText = "【你將料理端給老人】\n\n【他接過盤子，看著這道菜】";
    tasteText = "【他夾起一塊，放進嘴裡】\n\n【老人的表情變了】\n\n「這個味道...」\n「是完整的。甜的、鹹的、苦的、酸的...」\n「全部都在這裡了。」";
  }
  
  return [
    getDay3CookingMemoryCard(state),
    { type: "text", text: completeText },
    { type: "text", text: serveText },
    {
      type: "text",
      text: tasteText,
      quickReply: {
        items: [{
          type: "action",
          action: { type: "message", label: "繼續", text: "【端出料理】" }
        }]
      }
    }
  ];
}

// Day 3 記憶融合卡片 - V4.9 動態化
function getDay3CookingMemoryCard(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  const flavors = calculateFlavorBalance(memories);
  const endingType = determineEnding(flavors);
  
  // 根據結局類型決定黑貓評論和卡片顏色
  let catLine1 = "";
  let catLine2 = "";
  let catLine3 = "";
  let catLine4 = "";
  let cardColor = "#FFD700";
  let bgColor = "#FFF9E6";
  
  if (endingType === "ENDING_SWEET") {
    // 🍬 糖霜幻景拼盤
    cardColor = "#E91E63";
    bgColor = "#FFF0F5";
    catLine1 = "「嗯...」";
    catLine2 = "「把所有甜的都拼在一起...」";
    catLine3 = "「再撒上這麼多糖粉...」";
    catLine4 = "「你是想騙過他的舌頭，還是騙過他的心？」";
  } else if (endingType === "ENDING_BITTER") {
    // 🦴 千針冷骨湯
    cardColor = "#455A64";
    bgColor = "#ECEFF1";
    catLine1 = "「...」";
    catLine2 = "「肉都沒了，只剩下骨頭和刺。」";
    catLine3 = "「喝下去就像吞針一樣...」";
    catLine4 = "「這就是現實的味道嗎？」";
  } else {
    // 🐟 百味蜜汁炙燒魚（平衡）
    cardColor = "#FFD700";
    bgColor = "#FFF9E6";
    catLine1 = "「嗯。」";
    catLine2 = "「甜的、鹹的、酸的、苦的...」";
    catLine3 = "「這條魚裡什麼都有。」";
    catLine4 = "「這就是人生吧？趁熱吃。」";
  }
  
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
            color: cardColor,
            weight: "bold"
          },
          {
            type: "separator",
            margin: "md",
            color: cardColor
          },
          {
            type: "text",
            text: "【黑貓看著料理】",
            size: "xs",
            color: "#999999",
            margin: "md"
          },
          {
            type: "text",
            text: catLine1,
            wrap: true,
            margin: "xs"
          },
          {
            type: "text",
            text: catLine2,
            wrap: true,
            margin: "md",
            size: "sm"
          },
          {
            type: "text",
            text: catLine3,
            wrap: true,
            size: "sm"
          },
          {
            type: "text",
            text: catLine4,
            wrap: true,
            size: "sm",
            weight: "bold",
            margin: "md"
          }
        ]
      },
      styles: {
        body: {
          backgroundColor: bgColor
        }
      }
    }
  };
}

function getDay3Ending(state) {
  const dishes = (state && state.dishesCooked) ? state.dishesCooked : [];
  const extraLines = [];
  if (dishes.includes("苦辛醒神湯")) {
    extraLines.push({ type: "text", text: "【老人】\n「雪中的事……我想起來了。」" });
  }
  if (dishes.includes("撫慰鹹粥")) {
    extraLines.push({ type: "text", text: "【老人】\n「謝謝你……陪著我。」" });
  }
  const first = {
    type: "text",
    text: "━━━━━━━━━━━━━━━\n\n你端著料理走出廚房。\n\n老人坐在窗邊。\n\n窗外的雨...停了。\n\n━━━━━━━━━━━━━━━"
  };
  return [first, ...extraLines, getDay3EndingFlexCard(state)];
}

/**
 * 真相揭露獨白 - 根據結局類型回傳不同的「記憶恢復反應」
 * 解決甜味結局「大徹大悟後又裝睡」的敘事割裂問題
 * @param {string} endingType - ENDING_BITTER / ENDING_SWEET / ENDING_BALANCED
 * @returns {object} 包含對話內容和最終記憶的物件
 */
function getTruthMonologue(endingType) {
  // ============================================================
  // 🍬 甜味結局：認知改寫 - 痛苦太大，大腦強制切換成美好幻象
  // ============================================================
  if (endingType === "ENDING_SWEET") {
    return {
      dialogue: [
        { text: "「主廚。我...想起來了...」", color: null },
        { text: "你：「想起什麼？」", color: "#4A90E2" },
        { text: "「那天是...聖誕夜...外面下著大雪...」", color: null },
        { text: "【老人突然抱住頭，表情痛苦】", color: "#999999", size: "sm" },
        { text: "「好冷...不對...不對！」", color: null },
        { text: "「沒有雪...那天沒有雪！」", color: null, weight: "bold" },
        { text: "「那天陽光很好...美雪穿著制服...」", color: null },
        { text: "【他的眼神變得空洞而幸福】", color: "#999999", size: "sm" }
      ],
      finalMemory: [
        { text: "「對...我們在參加入學典禮...」", color: "#999999", size: "sm" },
        { text: "「我沒有遲到...」", color: "#999999", size: "sm" },
        { text: "【場景：學校門口，陽光普照】", color: "#999999", size: "sm" },
        { text: "「美雪穿著新制服，站在校門口等我。」", color: "#999999", size: "sm" },
        { text: "「我們一起拍了照...」", color: "#999999", size: "sm" },
        { text: "「她笑得好開心...」", color: "#999999", size: "sm" }
      ],
      afterMemory: [
        { text: "【老人睜開眼】", color: "#999999", size: "sm" },
        { text: "他的嘴角掛著微笑，卻有淚滑落。", color: null },
        { text: "「我沒有遲到...」", color: null, weight: "bold" },
        { text: "「這一次...爸爸沒有遲到...」", color: null, weight: "bold" },
        { text: "「美雪...」", color: null },
        { text: "「你看起來真漂亮...」", color: null }
      ]
    };
  }

  // ============================================================
  // ☕ 苦味結局：職人的徒勞 - 做到了，卻沒有意義
  // V4.9 修正：不是「做不到」，而是「做到了，卻沒有意義」
  // ============================================================
  if (endingType === "ENDING_BITTER") {
    return {
      dialogue: [
        { text: "「主廚。我...全都想起來了。」", color: null },
        { text: "你：「想起什麼？」", color: "#4A90E2" },
        { text: "「那天是聖誕夜。我在閣樓縫完了最後一針。」", color: null },
        { text: "「那件婚紗...真的很美。」", color: null },
        { text: "「是我這輩子最好的作品。」", color: null, weight: "bold" },
        { text: "【老人看著自己的手，露出淒涼的苦笑】", color: "#999999", size: "sm" }
      ],
      finalMemory: [
        { text: "「但是...那又怎樣呢？」", color: null, weight: "bold" },
        { text: "【場景：雪夜，閣樓外】", color: "#999999", size: "sm" },
        { text: "「它現在躺在漆黑的櫃子裡。」", color: "#999999", size: "sm" },
        { text: "「而我...倒在雪地裡。」", color: "#999999", size: "sm" },
        { text: "「沒人知道我做好了。」", color: "#999999", size: "sm" },
        { text: "「也沒人會來穿它了。」", color: "#999999", size: "sm" }
      ],
      afterMemory: [
        { text: "【老人睜開眼】", color: "#999999", size: "sm" },
        { text: "眼神清醒，淚流滿面。", color: null },
        { text: "「我做到了...」", color: null },
        { text: "「但沒有意義...」", color: null, weight: "bold" },
        { text: "「美雪...」", color: null },
        { text: "「爸爸做好了...但妳永遠不會知道了...」", color: null }
      ]
    };
  }

  // ============================================================
  // 🍵 平衡結局：接受並釋懷（預設）- 承認死亡但完成了婚紗
  // ============================================================
  return {
    dialogue: [
      { text: "「主廚。我...全都想起來了。」", color: null },
      { text: "你：「想起什麼？」", color: "#4A90E2" },
      { text: "「那天是聖誕夜。」", color: null },
      { text: "「我在閣樓縫最後一針。」", color: null },
      { text: "「當針穿過布料的瞬間...」", color: null }
    ],
    finalMemory: [
      { text: "「...好了。」", color: "#999999", size: "sm" },
      { text: "【他把婚紗疊好】", color: "#999999", size: "sm" },
      { text: "「美雪...爸爸做好了。」", color: "#999999", size: "sm" },
      { text: "【他將婚紗放入衣櫃深處】", color: "#999999", size: "sm" },
      { text: "「等你回家...就會看到了...」", color: "#999999", size: "sm" }
    ],
    afterMemory: [
      { text: "【老人睜開眼】", color: "#999999", size: "sm" },
      { text: "淚如雨下。", color: null },
      { text: "「我縫好了...」", color: null, weight: "bold" },
      { text: "「最後一針...我縫好了！」", color: null, weight: "bold" },
      { text: "「美雪...」", color: null },
      { text: "「婚紗在老家閣樓的衣櫃裡。」", color: null },
      { text: "「白色的，純白的婚紗。」", color: null },
      { text: "「爸爸用最好的絲綢，和媽媽留下的蕾絲...」", color: null }
    ]
  };
}

/** Day 3 最終章 flex 卡片（真相揭露）。支援動態引言與動態真相獨白。 */
function getDay3EndingFlexCard(state) {
  const memories = state ? (state.collectedMemories || []) : [];
  
  // 計算結局類型（需要先計算五味平衡）
  const flavors = calculateFlavorBalance(memories);
  const endingType = determineEnding(flavors);
  
  // 動態引言（根據變體記憶）
  let quote = "「美雪...爸爸做好了。」";
  if (memories.includes("銀座的驕傲")) {
    quote = "「這是我這輩子，最完美的作品。」";
  } else if (memories.includes("缺席的典禮")) {
    quote = "「這一次，爸爸沒有遲到。」";
  } else if (memories.includes("失語")) {
    quote = "「不用翻譯了。這就是我想說的話。」";
  } else if (memories.includes("空蕩的店")) {
    quote = "「這間店最後的作品，獻給最重要的人。」";
  }

  // 取得動態真相獨白
  const monologue = getTruthMonologue(endingType);
  
  // 建構對話內容
  const dialogueContents = [];
  
  // 加入【老人】標籤
  dialogueContents.push({
    type: "text",
    text: "【老人】",
    size: "sm",
    color: "#999999",
    wrap: true
  });
  
  // 加入對話內容
  monologue.dialogue.forEach((line, index) => {
    const textObj = {
      type: "text",
      text: line.text,
      wrap: true
    };
    if (line.color) textObj.color = line.color;
    if (line.size) textObj.size = line.size;
    if (line.weight) textObj.weight = line.weight;
    if (index > 0) textObj.margin = "md";
    dialogueContents.push(textObj);
  });
  
  // 加入分隔線
  dialogueContents.push({ type: "separator", margin: "lg" });
  
  // 加入【最終記憶】標籤
  dialogueContents.push({
    type: "text",
    text: "【最終記憶】",
    size: "sm",
    color: "#FFD700",
    wrap: true,
    margin: "lg",
    weight: "bold"
  });
  
  // 加入最終記憶內容
  monologue.finalMemory.forEach(line => {
    const textObj = {
      type: "text",
      text: line.text,
      wrap: true
    };
    if (line.color) textObj.color = line.color;
    if (line.size) textObj.size = line.size;
    if (line.weight) textObj.weight = line.weight;
    dialogueContents.push(textObj);
  });
  
  // 加入分隔線
  dialogueContents.push({ type: "separator", margin: "lg" });
  
  // 加入恢復後的反應
  monologue.afterMemory.forEach((line, index) => {
    const textObj = {
      type: "text",
      text: line.text,
      wrap: true
    };
    if (line.color) textObj.color = line.color;
    if (line.size) textObj.size = line.size;
    if (line.weight) textObj.weight = line.weight;
    if (index > 0 && line.weight === "bold") textObj.margin = "md";
    if (index === 0) textObj.margin = "lg";
    dialogueContents.push(textObj);
  });

  return {
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
            type: "text",
            text: quote,
            size: "sm",
            color: "#546E7A",
            align: "center",
            wrap: true,
            margin: "md",
            style: "italic"
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
            contents: dialogueContents
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
  };
}

function handleDay3Ending(event, userId, state, userText) {
  if (userText.includes("告別") || userText.includes("再見") || userText === "【告別】") {
    showLoadingAnimation(userId, 5);
    const s = getUserState(userId) || state;
    replyMessage(event.replyToken, getDay3Farewell(s, userId));
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

/**
 * Day 3 告別場景 - 生成結局畫面並儲存遺物到圖鑑
 * @param {object} state - 用戶狀態
 * @param {string} userId - 用戶 ID（可選，有傳入時會儲存遺物到 lifetimeHeirlooms）
 */
function getDay3Farewell(state, userId) {
  const memories = (state && state.collectedMemories) ? state.collectedMemories : [];
  const flavors = calculateFlavorBalance(memories);
  const endingType = determineEnding(flavors);

  // 計算變體記憶數量（用於判斷全收集）
  const variantMemories = ["銀座的驕傲", "缺席的典禮", "失語", "空蕩的店"];
  const variantCount = variantMemories.filter(v => memories.includes(v)).length;
  const isFullCollection = variantCount >= 3;

  // ============================================================
  // 1. 結局名稱動態化（18 種）
  // ============================================================
  let endingName = getEndingName(endingType, memories, isFullCollection);

  // ============================================================
  // 2. 遺物設定（基底）
  // ============================================================
  let heirloomEmoji = "🪡";
  let heirloomName = "銀頂針";
  if (endingType === "ENDING_BITTER") {
    heirloomEmoji = "🪡";
    heirloomName = "彎曲的縫紉針";
  } else if (endingType === "ENDING_SWEET") {
    heirloomEmoji = "📷";
    heirloomName = "泛黃的照片";
  }

  // ============================================================
  // 3. 遺物描述動態化（18 種）
  // ============================================================
  let heirloomDesc = getHeirloomDesc(endingType, memories, isFullCollection);

  // ============================================================
  // 3.5 儲存遺物到 lifetimeHeirlooms（策略A：覆蓋制）
  // ============================================================
  if (userId) {
    saveHeirloomToLifetime(userId, state, endingType, heirloomName, heirloomDesc);
  }

  // ============================================================
  // 4. 黑貓評論動態化（18 種）
  // ============================================================
  let catLine = getCatComment(endingType, memories, isFullCollection);

  // ============================================================
  // 5. 告別對話 - 模組化堆疊結構
  // ============================================================
  let farewellBody = buildFarewellBody(endingType, memories, isFullCollection);

  // ============================================================
  // 6. 告別 Hero 圖（根據結局類型）
  // ============================================================
  let farewellHeroUrl = "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/day3_farewell_balanced.png";
  if (endingType === "ENDING_BITTER") {
    farewellHeroUrl = "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/day3_farewell_bitter.png";
  } else if (endingType === "ENDING_SWEET") {
    farewellHeroUrl = "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/day3_farewell_sweet.png";
  }

  return [
    {
      type: "flex",
      altText: "告別",
      contents: {
        type: "bubble",
        hero: {
          type: "image",
          url: farewellHeroUrl,
          size: "full",
          aspectRatio: "3:2",
          aspectMode: "cover"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "⭐ " + endingName,
              weight: "bold",
              size: "xl",
              color: "#FFD700",
              align: "center"
            },
            {
              type: "separator",
              margin: "md"
            },
            ...farewellBody
          ]
        }
      }
    },
    (function() {
      // 遺物圖片 URL（與 handleHeirloomRequest 一致，V4.13）
      var HEIRLOOM_IMAGE_URLS = {
        ENDING_BITTER: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/heirloom_bitter_bent_needle.png",
        ENDING_SWEET: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/heirloom_sweet_photo.png",
        ENDING_BALANCED: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/heirloom_balanced_thimble.png"
      };
      var heirloomImageUrl = HEIRLOOM_IMAGE_URLS[endingType] || HEIRLOOM_IMAGE_URLS.ENDING_BALANCED;
      return {
        type: "flex",
        altText: "遺物",
        contents: {
          type: "bubble",
          hero: {
            type: "image",
            url: heirloomImageUrl,
            size: "full",
            aspectRatio: "3:2",
            aspectMode: "cover"
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "text", text: "🎁 遺物", weight: "bold", size: "xl", color: "#FFD700", align: "center" },
              { type: "separator", margin: "md" },
              { type: "text", text: heirloomName, align: "center", weight: "bold", margin: "md" },
              { type: "text", text: heirloomDesc, align: "center", size: "xs", color: "#999999", wrap: true, margin: "md" }
            ]
          }
        }
      };
    })(),
    {
      type: "text",
      text: "━━━━━━━━━━━━━━━\n\n" + catLine + "\n\n━━━━━━━━━━━━━━━\n\n⭐ Guest 1 完結\n\n感謝遊玩！",
      quickReply: {
        items: [{ type: "action", action: { type: "message", label: "重新開始", text: "重新開始" } }]
      }
    }
  ];
}

// ============================================================
// 結局名稱動態化（18 種）
// ============================================================
function getEndingName(endingType, memories, isFullCollection) {
  // 全收集專屬名稱
  if (isFullCollection) {
    if (endingType === "ENDING_BITTER") return "職人的一生";
    if (endingType === "ENDING_SWEET") return "永遠的閣樓";
    return "完整的告別";
  }

  // 變體名稱（優先級：缺席 > 失語 > 銀座 > 空蕩）
  if (memories.includes("缺席的典禮")) {
    if (endingType === "ENDING_BITTER") return "缺席的代價";
    if (endingType === "ENDING_SWEET") return "扭曲的記憶";
    return "遲來的出席";
  }
  if (memories.includes("失語")) {
    if (endingType === "ENDING_BITTER") return "無聲的懺悔";
    if (endingType === "ENDING_SWEET") return "翻譯者的幻影";
    return "針線的語言";
  }
  if (memories.includes("銀座的驕傲")) {
    if (endingType === "ENDING_BITTER") return "職人的輓歌";
    if (endingType === "ENDING_SWEET") return "銀座的殘夢";
    return "傳承的針線";
  }
  if (memories.includes("空蕩的店")) {
    if (endingType === "ENDING_BITTER") return "時代的棄子";
    if (endingType === "ENDING_SWEET") return "凝固的時光";
    return "最後的訂單";
  }

  // 預設名稱
  if (endingType === "ENDING_BITTER") return "帶遺憾離去";
  if (endingType === "ENDING_SWEET") return "溫柔的夢境";
  return "釋懷的旅程";
}

// ============================================================
// 遺物描述動態化（18 種）
// ============================================================
function getHeirloomDesc(endingType, memories, isFullCollection) {
  // 全收集專屬描述
  if (isFullCollection) {
    if (endingType === "ENDING_BITTER") return "一生的重量，都在這根針上。\n它撐不住了。";
    if (endingType === "ENDING_SWEET") return "他帶走了所有美好的記憶。\n剩下的，就留在這裡吧。";
    return "職人、父親、丈夫。\n這根針，縫起了他的一生。";
  }

  // 變體描述（優先級：缺席 > 失語 > 銀座 > 空蕩）
  if (memories.includes("缺席的典禮")) {
    if (endingType === "ENDING_BITTER") return "那一年的缺席，\n成了永遠無法縫合的傷口。";
    if (endingType === "ENDING_SWEET") return "入學典禮的合照。\n那天陽光很好，我們都很開心。";
    return "遲到了十五年的出席。\n這一次，爸爸沒有缺席。";
  }
  if (memories.includes("失語")) {
    if (endingType === "ENDING_BITTER") return "說不出口的對不起，\n和這根針一起生鏽了。";
    if (endingType === "ENDING_SWEET") return "雪子還在旁邊笑著。\n我們一家人，一直都有話聊。";
    return "不需要翻譯了。\n千言萬語，都縫進了這一針。";
  }
  if (memories.includes("銀座的驕傲")) {
    if (endingType === "ENDING_BITTER") return "縫過首相西裝的針。\n最後孤獨地斷在了雪地裡。";
    if (endingType === "ENDING_SWEET") return "銀座最好的裁縫師。\n笑容和手藝，停在輝煌那刻。";
    return "曾經為了銀座而縫，\n現在只為了一個人的笑容。";
  }
  if (memories.includes("空蕩的店")) {
    if (endingType === "ENDING_BITTER") return "成衣時代的棄物。\n和這間店一樣，早已被遺忘。";
    if (endingType === "ENDING_SWEET") return "店裡總是客滿。\n只要不醒來，時代就不會結束。";
    return "店雖然空了，\n但這根針直到最後都沒停下。";
  }

  // 預設描述
  if (endingType === "ENDING_BITTER") return "針尖已經彎了，他用了很久。\n像是一聲嘆息。";
  if (endingType === "ENDING_SWEET") return "父女的合照。\n照片裡的小女孩，笑得很甜。";
  return "背面刻著：\n*For my dearest Miyuki*";
}

// ============================================================
// 黑貓評論動態化（18 種）
// ============================================================
function getCatComment(endingType, memories, isFullCollection) {
  // 全收集專屬評論
  if (isFullCollection) {
    if (endingType === "ENDING_BITTER") {
      return "【黑貓跳上吧台】\n\n「...這老頭。」\n\n「職人、父親、丈夫、時代的棄子。每一個身份都有遺憾。」\n\n「但他都記起來了。這樣...也算完整吧。」";
    }
    if (endingType === "ENDING_SWEET") {
      return "【黑貓跳上吧台】\n\n「...」\n\n「他把所有美好的都留下了。痛苦的？大概都忘了。」\n\n「這是逃避，還是慈悲？我不知道。」";
    }
    return "【黑貓跳上吧台】\n\n「...」\n\n「第一個客人。」\n\n「他把一生都攤開了。銀座、典禮、雪子、那間店...全都記起來了。」\n\n「能這樣離開，是福氣。」";
  }

  // 變體評論（優先級：缺席 > 失語 > 銀座 > 空蕩）
  if (memories.includes("缺席的典禮")) {
    if (endingType === "ENDING_BITTER") {
      return "【黑貓跳上吧台】\n\n「...」\n\n「缺席了一次，就缺席了一輩子。有些錯，沒有重來的機會。」";
    }
    if (endingType === "ENDING_SWEET") {
      return "【黑貓跳上吧台】\n\n「...」\n\n「他把那天改寫了。」\n\n「也許是自我欺騙，也許是自我救贖。誰知道呢。」";
    }
    return "【黑貓跳上吧台】\n\n「...」\n\n「他終於到場了。遲到十五年，但到了。」\n\n「有些補償，晚一點也是補償。」";
  }
  if (memories.includes("失語")) {
    if (endingType === "ENDING_BITTER") {
      return "【黑貓跳上吧台】\n\n「...啞巴。」\n\n「他不是不會說話，是不敢說。」\n\n「怕說錯，所以乾脆不說。最後連對不起都來不及。」";
    }
    if (endingType === "ENDING_SWEET") {
      return "【黑貓跳上吧台】\n\n「...」\n\n「他還在等翻譯。」\n\n「有些人走了，但在他心裡還活著。這是幸福還是悲哀？」";
    }
    return "【黑貓跳上吧台】\n\n「...」\n\n「不需要翻譯了。」\n\n「針線就是他的語言。這件婚紗，美雪會讀懂的。」";
  }
  if (memories.includes("銀座的驕傲")) {
    if (endingType === "ENDING_BITTER") {
      return "【黑貓跳上吧台】\n\n「...職人啊。」\n\n「把一輩子縫進了針線裡，卻縫不住自己的家。」";
    }
    if (endingType === "ENDING_SWEET") {
      return "【黑貓跳上吧台】\n\n「...銀座最好的裁縫師。」\n\n「他選擇留在最好的時代。也許這對他來說，是最溫柔的結局。」";
    }
    return "【黑貓跳上吧台】\n\n「...不錯。」\n\n「銀座的驕傲，最後成了女兒的嫁衣。這叫傳承吧。」";
  }
  if (memories.includes("空蕩的店")) {
    if (endingType === "ENDING_BITTER") {
      return "【黑貓跳上吧台】\n\n「...時代變了。」\n\n「成衣廠贏了，手工輸了。他不是第一個，也不是最後一個。」";
    }
    if (endingType === "ENDING_SWEET") {
      return "【黑貓跳上吧台】\n\n「...」\n\n「在他的夢裡，店永遠不會空。」\n\n「也許這是對職人最大的仁慈。」";
    }
    return "【黑貓跳上吧台】\n\n「...」\n\n「店空了，但這件婚紗不空。」\n\n「時代會淘汰很多東西，但愛不會。」";
  }

  // 預設評論
  if (endingType === "ENDING_BITTER") {
    return "【黑貓跳上吧台】\n\n「...第一個客人。就這樣了。」\n\n「有些結走不開。」";
  }
  if (endingType === "ENDING_SWEET") {
    return "【黑貓跳上吧台】\n\n「...第一個客人。」\n\n「他走的時候，是笑著的。這樣也好吧。」";
  }
  return "【黑貓跳上吧台】\n\n「...第一個客人，處理得還行。」\n\n「至少他記起了該記的。」";
}

// ============================================================
// 告別對話 - 模組化堆疊結構
// ============================================================
function buildFarewellBody(endingType, memories, isFullCollection) {
  let body = [];

  // ===== 1. 開頭骨架 =====
  body.push({ type: "text", text: "【他站起身】", size: "sm", color: "#999999", wrap: true });

  if (endingType === "ENDING_BITTER") {
    body.push({ type: "text", text: "【老人低下頭】", size: "sm", color: "#999999", wrap: true, margin: "md" });
    body.push({ type: "text", text: "「謝謝你，主廚。」", wrap: true, margin: "md" });
    body.push({ type: "text", text: "「我...終究是個失敗的父親吧。」", wrap: true });
  } else if (endingType === "ENDING_SWEET") {
    body.push({ type: "text", text: "【老人的眼神變得柔和】", size: "sm", color: "#999999", wrap: true, margin: "md" });
    body.push({ type: "text", text: "「謝謝你，主廚。」", wrap: true, margin: "md" });
  } else {
    body.push({ type: "text", text: "【他的身影開始發光】", size: "sm", color: "#999999", wrap: true, margin: "md" });
    body.push({ type: "text", text: "「謝謝你，主廚。」", wrap: true, margin: "md" });
    body.push({ type: "text", text: "「謝謝你讓我記起來。」", wrap: true });
  }

  // ===== 2. 變體層 / 全收集專屬 =====
  if (isFullCollection) {
    // 全收集專屬對話（取代所有變體對話）
    body.push({ type: "separator", margin: "md" });
    if (endingType === "ENDING_BITTER") {
      body.push({ type: "text", text: "「我全都記起來了。銀座的店、美雪的典禮、雪子的聲音...」", wrap: true, margin: "md" });
      body.push({ type: "text", text: "「每一件事，都做錯了。」", wrap: true });
      body.push({ type: "text", text: "「這一生...全是遺憾。但至少，這件婚紗是完整的。」", wrap: true, margin: "md" });
      body.push({ type: "text", text: "「讓它代替我，去見美雪最後一面吧。」", wrap: true });
    } else if (endingType === "ENDING_SWEET") {
      body.push({ type: "text", text: "「我記得...銀座好熱鬧...美雪好可愛...雪子在笑...」", wrap: true, margin: "md" });
      body.push({ type: "text", text: "「店裡總是很忙，但我們很開心...」", wrap: true });
      body.push({ type: "text", text: "「對吧？我們一直都很開心的...」", wrap: true, margin: "md" });
      body.push({ type: "text", text: "「...對吧？」", wrap: true, weight: "bold" });
    } else {
      body.push({ type: "text", text: "「我全都記起來了。」", wrap: true, margin: "md" });
      body.push({ type: "text", text: "「銀座的驕傲、缺席的典禮、說不出口的話、空蕩的店...」", wrap: true });
      body.push({ type: "text", text: "「每一件事，都是我人生的一部分。」", wrap: true, margin: "md" });
      body.push({ type: "text", text: "「痛苦的、美好的，都是我的。」", wrap: true });
      body.push({ type: "text", text: "「謝謝你讓我記起來。這樣...我可以完整地離開了。」", wrap: true, margin: "md" });
    }
  } else {
    // 變體堆疊（使用獨立 if，可多重觸發）
    
    // 變體 A：銀座的驕傲
    if (memories.includes("銀座的驕傲")) {
      body.push({ type: "separator", margin: "md" });
      if (endingType === "ENDING_BITTER") {
        body.push({ type: "text", text: "「不過...至少那件西裝是完美的。」", wrap: true, margin: "md" });
        body.push({ type: "text", text: "「我這一生，把靈魂都給了針線...雖然失去了家，但我不後悔那天在銀座的堅持。」", wrap: true });
      } else if (endingType === "ENDING_SWEET") {
        body.push({ type: "text", text: "「銀座的日子真好...每天都有好多訂單...」", wrap: true, margin: "md" });
        body.push({ type: "text", text: "「那間店永遠不會冷清的。」", wrap: true });
      } else {
        body.push({ type: "text", text: "「這雙手曾經讓銀座驚艷，現在...只想為她縫這一件。」", wrap: true, margin: "md" });
      }
    }

    // 變體 B：缺席的典禮
    if (memories.includes("缺席的典禮")) {
      body.push({ type: "separator", margin: "md" });
      if (endingType === "ENDING_BITTER") {
        body.push({ type: "text", text: "「入學典禮那天我沒去...現在連婚禮也去不了了。」", wrap: true, margin: "md" });
        body.push({ type: "text", text: "「我徹頭徹尾是個失格的父親。」", wrap: true });
      } else if (endingType === "ENDING_SWEET") {
        body.push({ type: "text", text: "「入學典禮...？啊，對了，那天她穿著制服，笑得好開心...」", wrap: true, margin: "md" });
        body.push({ type: "text", text: "「我們還一起拍了照...對吧？她沒有哭...她一定沒有哭...」", wrap: true });
      } else {
        body.push({ type: "text", text: "「我不去入學典禮是錯的。但這件婚紗，是我遲來的道歉。」", wrap: true, margin: "md" });
        body.push({ type: "text", text: "「這一次，爸爸沒有缺席。」", wrap: true });
      }
    }

    // 變體 C：失語
    if (memories.includes("失語")) {
      body.push({ type: "separator", margin: "md" });
      if (endingType === "ENDING_BITTER") {
        body.push({ type: "text", text: "「雪子走後，我就真的變成啞巴了。」", wrap: true, margin: "md" });
        body.push({ type: "text", text: "「我想說對不起，但嘴巴張不開。現在想說，也沒人聽了。」", wrap: true });
      } else if (endingType === "ENDING_SWEET") {
        body.push({ type: "text", text: "「雪子還在啊。她一直都在幫我翻譯。」", wrap: true, margin: "md" });
        body.push({ type: "text", text: "「她說美雪很愛我，我也很愛美雪...我們一家人一直都很好的。」", wrap: true });
      } else {
        body.push({ type: "text", text: "「雪子...我終於懂妳的意思了。」", wrap: true, margin: "md" });
        body.push({ type: "text", text: "「不需要翻譯了。這一次，我把話都縫進衣服裡了。」", wrap: true });
      }
    }

    // 變體 D：空蕩的店
    if (memories.includes("空蕩的店")) {
      body.push({ type: "separator", margin: "md" });
      if (endingType === "ENDING_BITTER") {
        body.push({ type: "text", text: "「反正那間店也沒人去了...成衣工廠贏了。」", wrap: true, margin: "md" });
        body.push({ type: "text", text: "「就讓它跟著這個時代一起結束吧。我也累了。」", wrap: true });
      } else if (endingType === "ENDING_SWEET") {
        body.push({ type: "text", text: "「店裡還是很熱鬧的。每天都有好多訂單...」", wrap: true, margin: "md" });
        body.push({ type: "text", text: "「只要我不關門，那個時代就不會結束。」", wrap: true });
      } else {
        body.push({ type: "text", text: "「店空了沒關係。時代本來就會變。」", wrap: true, margin: "md" });
        body.push({ type: "text", text: "「至少在最後一刻，這間店完成了它最重要的任務——這件婚紗。」", wrap: true });
      }
    }

    // 無變體時的預設對話
    const hasVariant = memories.includes("銀座的驕傲") || memories.includes("缺席的典禮") || 
                       memories.includes("失語") || memories.includes("空蕩的店");
    if (!hasVariant) {
      if (endingType === "ENDING_BITTER") {
        body.push({ type: "text", text: "「那件婚紗...她大概永遠也找不到了...」", wrap: true, margin: "md" });
      } else if (endingType === "ENDING_SWEET") {
        body.push({ type: "text", text: "「美雪小時候笑起來好可愛...」", wrap: true, margin: "md" });
        body.push({ type: "text", text: "「她喜歡穿我做的洋裝，在院子裡轉圈圈...」", wrap: true });
        body.push({ type: "text", text: "【他閉上眼睛，嘴角上揚】", size: "sm", color: "#999999", wrap: true, margin: "lg" });
        body.push({ type: "text", text: "「...等等，我好像忘了什麼...」", wrap: true });
        body.push({ type: "text", text: "「算了...現在這樣就很好...」", wrap: true, margin: "md" });
      } else {
        body.push({ type: "text", text: "「我以為...我一事無成就死了。」", wrap: true, margin: "md" });
        body.push({ type: "text", text: "「但原來...」", wrap: true });
        body.push({ type: "text", text: "「我完成了。」", wrap: true, weight: "bold" });
      }
    }
  }

  // ===== 3. 結尾骨架 =====
  body.push({ type: "separator", margin: "lg" });

  if (endingType === "ENDING_BITTER") {
    body.push({ type: "text", text: "【他的身影開始變得透明】", size: "sm", color: "#999999", wrap: true, margin: "lg" });
    body.push({ type: "text", text: "「...美雪，對不起。」", wrap: true, weight: "bold" });
  } else if (endingType === "ENDING_SWEET") {
    // 甜味結局不需要額外結尾
  } else {
    // 平衡結局也不需要額外結尾，上面已經有「我完成了」
  }

  // 共通結尾：化作光點
  body.push({ type: "text", text: "【他化作光點】", size: "sm", color: "#999999", wrap: true, margin: "lg" });
  body.push({ type: "text", text: "【飄向窗外】", size: "sm", color: "#999999", wrap: true });
  body.push({ type: "text", text: "【雨停了】", size: "sm", color: "#999999", wrap: true });
  body.push({ type: "text", text: "【第一次，窗外出現了光】", size: "sm", color: "#FFD700", wrap: true, weight: "bold" });

  return body;
}

// ============================================================
// Rich Menu 圖鑑系統（V4.7 新增）
// ============================================================

/**
 * 遺物圖鑑 - 回傳 Flex Carousel 顯示玩家已收集的遺物
 * 根據 lifetimeHeirlooms 動態顯示解鎖狀態與描述
 * @param {object} userState - 用戶狀態
 * @returns {object} Flex Message Carousel
 */
function handleHeirloomRequest(userState) {
  const heirlooms = userState.lifetimeHeirlooms || {
    "BITTER": { obtained: false, name: "???", desc: "", date: "" },
    "SWEET": { obtained: false, name: "???", desc: "", date: "" },
    "BALANCED": { obtained: false, name: "???", desc: "", date: "" }
  };

  // 遺物圖片 URL（V4.13 新增）
  const HEIRLOOM_IMAGES = {
    BITTER: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/heirloom_bitter_bent_needle.png",
    SWEET: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/heirloom_sweet_photo.png",
    BALANCED: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/heirloom_balanced_thimble.png"
  };

  // 建立三張卡片
  const bubbles = [];

  // ===== 卡片 1：苦味遺物 =====
  bubbles.push(createHeirloomCard({
    type: "BITTER",
    emoji: "🪡",
    imageUrl: HEIRLOOM_IMAGES.BITTER,
    defaultName: "彎曲的縫紉針",
    heirloom: heirlooms["BITTER"],
    lockedHint: "達成【帶遺憾離去】結局解鎖",
    bgColor: "#2D3436"
  }));

  // ===== 卡片 2：甜味遺物 =====
  bubbles.push(createHeirloomCard({
    type: "SWEET",
    emoji: "📷",
    imageUrl: HEIRLOOM_IMAGES.SWEET,
    defaultName: "泛黃的照片",
    heirloom: heirlooms["SWEET"],
    lockedHint: "達成【沉浸美好】結局解鎖",
    bgColor: "#6C5CE7"
  }));

  // ===== 卡片 3：平衡遺物 =====
  bubbles.push(createHeirloomCard({
    type: "BALANCED",
    emoji: "🧵",
    imageUrl: HEIRLOOM_IMAGES.BALANCED,
    defaultName: "銀頂針",
    heirloom: heirlooms["BALANCED"],
    lockedHint: "達成【釋懷的旅程】結局解鎖",
    bgColor: "#00B894"
  }));

  return {
    type: "flex",
    altText: "遺物圖鑑",
    contents: {
      type: "carousel",
      contents: bubbles
    }
  };
}

/**
 * 建立單張遺物卡片（V4.13 更新：支援圖片）
 * @param {object} config - 卡片配置
 * @returns {object} Flex Bubble
 */
function createHeirloomCard(config) {
  const { type, emoji, imageUrl, defaultName, heirloom, lockedHint, bgColor } = config;
  const isUnlocked = heirloom && heirloom.obtained;

  if (isUnlocked) {
    // 已解鎖版本 - 顯示遺物圖片
    return {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "⭐ 已收藏", size: "xs", color: "#FFFFFF", align: "center" }
        ],
        backgroundColor: bgColor,
        paddingAll: "sm"
      },
      hero: {
        type: "image",
        url: imageUrl,
        size: "full",
        aspectRatio: "3:2",
        aspectMode: "cover"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: heirloom.name || defaultName, weight: "bold", align: "center", wrap: true },
          { type: "separator", margin: "md" },
          { type: "text", text: heirloom.desc || "無描述", size: "xs", color: "#666666", align: "center", wrap: true, margin: "md" },
          { type: "text", text: "獲得日期：" + (heirloom.date || "未知"), size: "xxs", color: "#999999", align: "center", margin: "md" }
        ],
        paddingAll: "md"
      }
    };
  } else {
    // 未解鎖版本 - 顯示問號
    return {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "🔒 未解鎖", size: "xs", color: "#FFFFFF", align: "center" }
        ],
        backgroundColor: "#636E72",
        paddingAll: "sm"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "❓", size: "4xl", align: "center", color: "#CCCCCC" },
          { type: "text", text: "???", weight: "bold", align: "center", margin: "md", color: "#999999" },
          { type: "separator", margin: "md" },
          { type: "text", text: lockedHint, size: "xs", color: "#999999", align: "center", wrap: true, margin: "md" }
        ],
        paddingAll: "lg"
      }
    };
  }
}

/**
 * 人物紀傳 - 回傳 Flex Carousel 顯示紀實章節解鎖狀態
 * 根據 lifetimeHeirlooms 動態顯示解鎖狀態
 * @param {object} userState - 用戶狀態
 * @returns {object} Flex Message Carousel
 */
function handleBiographyRequest(userState) {
  const heirlooms = userState.lifetimeHeirlooms || {
    "BITTER": { obtained: false },
    "SWEET": { obtained: false },
    "BALANCED": { obtained: false }
  };

  // 檢查解鎖狀態
  const hasBitter = heirlooms["BITTER"] && heirlooms["BITTER"].obtained;
  const hasSweet = heirlooms["SWEET"] && heirlooms["SWEET"].obtained;
  const hasBalanced = heirlooms["BALANCED"] && heirlooms["BALANCED"].obtained;

  // 建立三張卡片
  const bubbles = [];

  // ===== 卡片 1：前篇（甜味結局解鎖）=====
  bubbles.push(createBiographyCard({
    title: "前篇：針尖工房",
    subtitle: "第 1-5 章",
    desc: "關於那雙手最靈巧的時光，以及銀座最美的相遇。",
    lockedDesc: "達成【沉浸美好】結局解鎖\n(試著讓他只想起快樂的事...)",
    isUnlocked: hasSweet,
    bgColor: "#6C5CE7",
    // 外部連結（需要用戶自行設定）
    url: "https://www.notion.so/_-_-2f6d3b4f9e7080928334f33a445485eb?source=copy_link"
  }));

  // ===== 卡片 2：中篇（苦味結局解鎖）=====
  bubbles.push(createBiographyCard({
    title: "中篇：裂痕",
    subtitle: "第 6-9 章",
    desc: "關於那場缺席的典禮，與被時代遺忘的聲音。",
    lockedDesc: "達成【帶遺憾離去】結局解鎖\n(試著讓他面對最深的痛苦...)",
    isUnlocked: hasBitter,
    bgColor: "#2D3436",
    url: "https://www.notion.so/_-_-2f6d3b4f9e7080a193c5ce1dced5e5fb?source=copy_link"
  }));

  // ===== 卡片 3：後篇（平衡結局解鎖）=====
  bubbles.push(createBiographyCard({
    title: "後篇：最後一針",
    subtitle: "第 10 章 - 尾聲",
    desc: "關於雪夜裡的執念，以及一件遲到的婚紗。",
    lockedDesc: "達成【釋懷的旅程】結局解鎖\n(試著讓他想起一切...)",
    isUnlocked: hasBalanced,
    bgColor: "#00B894",
    url: "https://www.notion.so/_-_-2f6d3b4f9e7080678edae876cdc1ca99?source=copy_link"
  }));

  return {
    type: "flex",
    altText: "人物紀傳 - 田中太郎",
    contents: {
      type: "carousel",
      contents: bubbles
    }
  };
}

/**
 * 建立單張紀傳卡片
 * @param {object} config - 卡片配置
 * @returns {object} Flex Bubble
 */
function createBiographyCard(config) {
  const { title, subtitle, desc, lockedDesc, isUnlocked, bgColor, url } = config;

  if (isUnlocked) {
    // 已解鎖版本
    return {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "📖 已解鎖", size: "xs", color: "#FFFFFF", align: "center" }
        ],
        backgroundColor: bgColor,
        paddingAll: "sm"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: title, weight: "bold", size: "md", wrap: true },
          { type: "text", text: subtitle, size: "xs", color: "#999999", margin: "sm" },
          { type: "separator", margin: "md" },
          { type: "text", text: desc, size: "sm", color: "#666666", wrap: true, margin: "md" }
        ],
        paddingAll: "lg"
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "📄 閱讀完整紀實",
              uri: url
            },
            style: "primary",
            color: bgColor,
            height: "sm"
          }
        ],
        paddingAll: "md"
      }
    };
  } else {
    // 未解鎖版本
    return {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "🔒 未解鎖", size: "xs", color: "#FFFFFF", align: "center" }
        ],
        backgroundColor: "#636E72",
        paddingAll: "sm"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: title, weight: "bold", size: "md", color: "#999999", wrap: true },
          { type: "text", text: subtitle, size: "xs", color: "#AAAAAA", margin: "sm" },
          { type: "separator", margin: "md" },
          { type: "text", text: lockedDesc, size: "sm", color: "#999999", wrap: true, margin: "md" }
        ],
        paddingAll: "lg"
      }
    };
  }
}

// ============================================================
// Rich Menu 處理函數（V4.7 新增）
// 分級管制 + 回程票系統
// ============================================================

/**
 * 🔙 回程票核心函數：根據用戶當前狀態重印遊戲畫面
 * 解決「洗版後找不到選項」的 UX 問題
 * @param {string} replyToken - LINE reply token
 * @param {string} userId - 用戶 ID
 */
function restoreGameScreen(replyToken, userId) {
  const state = getUserState(userId);
  
  if (!state) {
    replyMessage(replyToken, {
      type: "text",
      text: "【系統】\n無法讀取進度，請輸入「重新開始」開始遊戲。"
    });
    return;
  }
  
  let message = null;
  
  // 根據當前 Phase 決定重印什麼畫面
  switch (state.phase) {
    case PHASE.DAY:
      if (state.currentDay === 1) {
        message = getDay1DayShift(state);
      } else if (state.currentDay === 2) {
        message = getDay2DayShift(state);
      }
      break;
      
    case PHASE.COOKING:
      if (state.currentDay === 1) {
        message = getDay1CookingScene(state);
      } else if (state.currentDay === 2) {
        message = getDay2CookingScene(state);
      } else if (state.currentDay === 3) {
        message = getDay3CookingStart(state);
      }
      break;
      
    case PHASE.NIGHT:
      // 夜晚通常是過場，給個簡單提示
      message = {
        type: "text",
        text: "【黑貓】\n「客人在等著呢。準備好了就去招待吧。」",
        quickReply: {
          items: [{
            type: "action",
            action: { type: "postback", label: "👁️ 觀察他", data: "next_phase:1:night" }
          }]
        }
      };
      break;
      
    case PHASE.AFTER:
      // 結束階段，提示休息或繼續
      if (state.currentDay < 3) {
        message = {
          type: "text",
          text: "【黑貓】\n「今天就到這裡吧。明天見。」",
          quickReply: {
            items: [{
              type: "action",
              action: { type: "message", label: "明天繼續", text: "【明天繼續】" }
            }]
          }
        };
      } else {
        message = {
          type: "text",
          text: "【系統】\n您可以查看圖鑑，或輸入「重新開始」開始新一輪遊戲。"
        };
      }
      break;
  }
  
  // 如果找不到狀態（異常），回傳預設選單
  if (!message) {
    message = {
      type: "text",
      text: "【系統】\n無法確定當前進度。\n\n輸入「狀態」查看進度，或「重新開始」重置遊戲。"
    };
  }
  
  replyMessage(replyToken, message);
}

/**
 * 📖 處理人物紀傳按鈕
 * 沉浸破壞型：遊戲進行中（Day/Cooking）黑貓攔截
 * @param {object} event - LINE event
 * @param {string} userId - 用戶 ID
 * @param {object} state - 用戶狀態
 */
function handleOpenBio(event, userId, state) {
  if (!state) {
    replyMessage(event.replyToken, { type: "text", text: "請先開始遊戲！輸入「重新開始」" });
    return;
  }
  
  // 黑貓攔截：遊戲進行中禁止查看
  if (state.phase === PHASE.DAY || state.phase === PHASE.COOKING) {
    replyMessage(event.replyToken, {
      type: "text",
      text: "【黑貓】\n「現在不是看書的時候。」\n「專心應付客人。」"
    });
    return;
  }
  
  // 允許查看：用 push 發送（Loading 動畫後 reply token 可能失效，改用 push 確保有回應）
  pushMessages(userId, handleBiographyRequestWithReturn(state));
}

/**
 * 🎁 處理遺物圖鑑按鈕
 * 沉浸破壞型：遊戲進行中（Day/Cooking）黑貓攔截
 * @param {object} event - LINE event
 * @param {string} userId - 用戶 ID
 * @param {object} state - 用戶狀態
 */
function handleOpenHeirloom(event, userId, state) {
  if (!state) {
    replyMessage(event.replyToken, { type: "text", text: "請先開始遊戲！輸入「重新開始」" });
    return;
  }
  
  // 黑貓攔截：遊戲進行中禁止查看
  if (state.phase === PHASE.DAY || state.phase === PHASE.COOKING) {
    replyMessage(event.replyToken, {
      type: "text",
      text: "【黑貓】\n「手裡拿著鍋鏟還想翻箱倒櫃？」\n「專心做事。」"
    });
    return;
  }
  
  // 允許查看：用 push 發送（Loading 動畫後 reply token 可能失效，改用 push 確保有回應）
  pushMessages(userId, handleHeirloomRequestWithReturn(state));
}

/**
 * 📊 處理靈魂狀態按鈕
 * 工具輔助型：隨時可開
 * @param {object} event - LINE event
 * @param {string} userId - 用戶 ID
 * @param {object} state - 用戶狀態
 */
function handleOpenStatus(event, userId, state) {
  if (!state) {
    replyMessage(event.replyToken, { type: "text", text: "請先開始遊戲！輸入「重新開始」" });
    return;
  }
  
  const statusFlex = getStatusFlexMessage(state);
  replyMessage(event.replyToken, statusFlex);
}

/**
 * ❓ 處理遊戲說明按鈕
 * 工具輔助型：隨時可開
 * @param {object} event - LINE event
 * @param {string} userId - 用戶 ID
 * @param {object} state - 用戶狀態
 */
function handleOpenHelp(event, userId, state) {
  replyMessage(event.replyToken, getHelpMessageWithReturn());
}

/**
 * 📊 生成靈魂狀態 Flex Message
 * 顯示五味傾向 + 已收集記憶 + 當前進度
 * @param {object} state - 用戶狀態
 * @returns {object} Flex Message
 */
function getStatusFlexMessage(state) {
  const memories = state.collectedMemories || [];
  const flavors = calculateFlavorBalance(memories);
  
  // 計算五味進度條
  const maxFlavor = 15; // 最大值用於計算進度條
  const sweetBar = getFlavorBar(flavors.sweet, maxFlavor);
  const bitterBar = getFlavorBar(flavors.bitter, maxFlavor);
  const spicyBar = getFlavorBar(flavors.spicy, maxFlavor);
  const sourBar = getFlavorBar(flavors.sour, maxFlavor);
  const saltyBar = getFlavorBar(flavors.salty, maxFlavor);
  
  // 轉換 phase 為中文顯示
  const phaseDisplay = {
    [PHASE.NIGHT]: "夜晚・觀察",
    [PHASE.DAY]: "白天・對話",
    [PHASE.COOKING]: "傍晚・料理",
    [PHASE.AFTER]: "深夜・休息"
  };
  
  // 建立記憶列表文字
  let memoryText = "";
  if (memories.length > 0) {
    memoryText = memories.map(m => `• ${m}`).join("\n");
  } else {
    memoryText = "（尚未收集任何記憶）";
  }
  
  // 黑貓評論（根據五味傾向）
  let catComment = "「這傢伙的心思還看不太清楚...」";
  if (flavors.bitter > flavors.sweet + 5) {
    catComment = "「心裡苦得很。再這樣下去會壞掉的。」";
  } else if (flavors.sweet > flavors.bitter + 5) {
    catComment = "「笑得挺開心的。但真的沒問題嗎？」";
  } else if (memories.length >= 10) {
    catComment = "「收集得不少嘛。應該能做點什麼了。」";
  }
  
  return {
    type: "flex",
    altText: "靈魂狀態",
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "📊 靈魂觀測記錄", weight: "bold", size: "lg", color: "#FFFFFF" }
        ],
        backgroundColor: "#2D3436",
        paddingAll: "lg"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          // 當前進度
          { type: "text", text: "【當前進度】", weight: "bold", size: "sm", color: "#333333" },
          { type: "text", text: `📅 Day ${state.currentDay} - ${phaseDisplay[state.phase] || "未知"}`, size: "sm", color: "#666666", margin: "sm" },
          { type: "separator", margin: "lg" },
          
          // 五味傾向
          { type: "text", text: "【五味傾向】", weight: "bold", size: "sm", color: "#333333", margin: "lg" },
          { type: "text", text: `🍬 甜（撫慰）：${sweetBar}`, size: "xs", color: "#666666", margin: "sm" },
          { type: "text", text: `☕ 苦（清醒）：${bitterBar}`, size: "xs", color: "#666666", margin: "sm" },
          { type: "text", text: `🌶️ 辛（覺悟）：${spicyBar}`, size: "xs", color: "#666666", margin: "sm" },
          { type: "text", text: `🍋 酸（追憶）：${sourBar}`, size: "xs", color: "#666666", margin: "sm" },
          { type: "text", text: `🧂 鹹（根源）：${saltyBar}`, size: "xs", color: "#666666", margin: "sm" },
          { type: "separator", margin: "lg" },
          
          // 已收集記憶
          { type: "text", text: `【已捕捉的記憶】(${memories.length}個)`, weight: "bold", size: "sm", color: "#333333", margin: "lg" },
          { type: "text", text: memoryText, size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "separator", margin: "lg" },
          
          // 黑貓評論
          { type: "text", text: "【黑貓筆記】", weight: "bold", size: "sm", color: "#333333", margin: "lg" },
          { type: "text", text: catComment, size: "xs", color: "#999999", wrap: true, margin: "sm", style: "italic" }
        ],
        paddingAll: "lg"
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: { type: "postback", label: "🔙 關閉面板", data: "RESUME_GAME" },
            style: "secondary",
            height: "sm"
          }
        ],
        paddingAll: "md"
      }
    }
  };
}

/**
 * 輔助函數：生成五味進度條
 * @param {number} value - 當前值
 * @param {number} max - 最大值
 * @returns {string} 進度條字串
 */
function getFlavorBar(value, max) {
  const filled = Math.min(Math.floor(value / max * 5), 5);
  return "⬛".repeat(filled) + "⬜".repeat(5 - filled) + ` (${value})`;
}

/**
 * 帶回程票的遺物圖鑑
 * @param {object} userState - 用戶狀態
 * @returns {object} Flex Message
 */
function handleHeirloomRequestWithReturn(userState) {
  const original = handleHeirloomRequest(userState);
  // 在 carousel 最後添加一張「返回」卡片（LINE 規定輪播內所有 bubble 必須同尺寸，故用 kilo 與前三張一致）
  if (original.contents && original.contents.type === "carousel") {
    original.contents.contents.push({
      type: "bubble",
      size: "kilo",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "🔙", size: "4xl", align: "center" },
          { type: "text", text: "返回遊戲", weight: "bold", align: "center", margin: "md" }
        ],
        paddingAll: "lg",
        justifyContent: "center"
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: { type: "postback", label: "關閉圖鑑", data: "RESUME_GAME" },
            style: "secondary",
            height: "sm"
          }
        ],
        paddingAll: "sm"
      }
    });
  }
  
  return original;
}

/**
 * 帶回程票的人物紀傳
 * @param {object} userState - 用戶狀態
 * @returns {object} Flex Message
 */
function handleBiographyRequestWithReturn(userState) {
  const original = handleBiographyRequest(userState);
  
  // 在 carousel 最後添加一張「返回」卡片
  if (original.contents && original.contents.type === "carousel") {
    original.contents.contents.push({
      type: "bubble",
      size: "kilo",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "🔙", size: "4xl", align: "center" },
          { type: "text", text: "返回遊戲", weight: "bold", align: "center", margin: "md" },
          { type: "text", text: "看完紀傳了嗎？\n繼續你的旅程吧。", size: "xs", color: "#666666", align: "center", wrap: true, margin: "md" }
        ],
        paddingAll: "lg",
        justifyContent: "center"
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: { type: "postback", label: "關閉紀傳", data: "RESUME_GAME" },
            style: "secondary",
            height: "sm"
          }
        ],
        paddingAll: "sm"
      }
    });
  }
  
  return original;
}

/**
 * 帶回程票的遊戲說明
 * @returns {object} Flex Message
 */
function getHelpMessageWithReturn() {
  return {
    type: "flex",
    altText: "遊戲說明",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "🍳 靈魂食堂", weight: "bold", size: "xl", align: "center" },
          { type: "text", text: "遊戲說明", size: "sm", color: "#999999", align: "center", margin: "sm" },
          { type: "separator", margin: "md" },
          { type: "text", text: "【遊戲流程】", weight: "bold", size: "sm", margin: "lg" },
          { type: "text", text: "1. 夜晚：觀察客人，了解他的故事", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "text", text: "2. 白天：與客人對話，收集記憶碎片", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "text", text: "3. 傍晚：料理階段，用食物喚醒記憶", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "text", text: "4. 三天後：送走客人，獲得遺物", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "separator", margin: "lg" },
          { type: "text", text: "【結局系統】", weight: "bold", size: "sm", margin: "lg" },
          { type: "text", text: "• 你的選擇會影響結局走向", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "text", text: "• 共有 18 種結局變體", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "text", text: "• 收集不同遺物可解鎖人物紀傳", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "separator", margin: "lg" },
          { type: "text", text: "【圖鑑功能】", weight: "bold", size: "sm", margin: "lg" },
          { type: "text", text: "• 遺物圖鑑：查看已收集的遺物", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "text", text: "• 人物紀傳：閱讀客人的完整故事", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "text", text: "• 靈魂狀態：查看五味傾向與記憶", size: "xs", color: "#666666", wrap: true, margin: "sm" }
        ],
        paddingAll: "lg"
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: { type: "postback", label: "🔙 我懂了，繼續遊戲", data: "RESUME_GAME" },
            style: "secondary",
            height: "sm"
          }
        ],
        paddingAll: "md"
      }
    }
  };
}

// ============================================================
// 舊版 Rich Menu 處理（保留相容性）
// ============================================================

/**
 * 處理 Rich Menu Postback（舊版，保留相容性）
 * @deprecated 請使用 handlePostback 中的新路由邏輯
 */
function handleRichMenuPostback(event, userId) {
  const data = event.postback.data;
  const state = getUserState(userId);

  if (!state) {
    replyMessage(event.replyToken, { type: "text", text: "請先開始遊戲！" });
    return;
  }

  if (data === "action=heirloom") {
    handleOpenHeirloom(event, userId, state);
  } else if (data === "action=biography") {
    handleOpenBio(event, userId, state);
  } else if (data === "action=help") {
    handleOpenHelp(event, userId, state);
  }
}

/**
 * 說明訊息
 * @returns {object} Flex Message
 */
function getHelpMessage() {
  return {
    type: "flex",
    altText: "遊戲說明",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "🍳 靈魂食堂", weight: "bold", size: "xl", align: "center" },
          { type: "text", text: "遊戲說明", size: "sm", color: "#999999", align: "center", margin: "sm" },
          { type: "separator", margin: "md" },
          { type: "text", text: "【遊戲流程】", weight: "bold", size: "sm", margin: "lg" },
          { type: "text", text: "1. 夜晚：觀察客人，了解他的故事", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "text", text: "2. 白天：與客人對話，收集記憶碎片", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "text", text: "3. 傍晚：料理階段，用食物喚醒記憶", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "text", text: "4. 三天後：送走客人，獲得遺物", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "separator", margin: "lg" },
          { type: "text", text: "【結局系統】", weight: "bold", size: "sm", margin: "lg" },
          { type: "text", text: "• 你的選擇會影響結局走向", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "text", text: "• 共有 18 種結局變體", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "text", text: "• 收集不同遺物可解鎖人物紀傳", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "separator", margin: "lg" },
          { type: "text", text: "【圖鑑功能】", weight: "bold", size: "sm", margin: "lg" },
          { type: "text", text: "• 遺物圖鑑：查看已收集的遺物", size: "xs", color: "#666666", wrap: true, margin: "sm" },
          { type: "text", text: "• 人物紀傳：閱讀客人的完整故事", size: "xs", color: "#666666", wrap: true, margin: "sm" }
        ],
        paddingAll: "lg"
      }
    }
  };
}
