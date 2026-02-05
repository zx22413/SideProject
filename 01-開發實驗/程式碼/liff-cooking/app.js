/**
 * 靈魂食堂 - LIFF 料理小遊戲
 * 版本：MVP 1.0
 */

// ============================================
// 配置
// ============================================
const CONFIG = {
  // TODO: 替換為實際的 LIFF ID
  LIFF_ID: '2009042883-1e0HSFLa',
  // TODO: 替換為實際的 GAS Web App URL
  GAS_API_URL: 'https://script.google.com/macros/s/AKfycbzO5iC6ezFNxtqN3JiMmBYk9_R8exUP_ZTPth6O9NHzd__3G678oz3rruxpsdYMood5og/exec',
  // 最少需要選擇的記憶數量
  MIN_MEMORIES: 1,
  // 最多可選擇的記憶數量
  MAX_MEMORIES: 5
};

// ============================================
// 五味對應的記憶標籤
// ============================================
const MEMORY_FLAVOR_MAP = {
  // Day 1 記憶
  "裁縫手藝": { flavor: "sweet", icon: "🧵" },
  "失去的名字": { flavor: "salty", icon: "❓" },
  "空蕩的店": { flavor: "bitter", icon: "🏚️" },
  "銀座的驕傲": { flavor: "sweet", icon: "👔" },
  
  // Day 2 記憶
  "小女孩畫作": { flavor: "sweet", icon: "🎨" },
  "結婚消息": { flavor: "sour", icon: "💒" },
  "深夜呢喃": { flavor: "bitter", icon: "🌙" },
  "缺席的典禮": { flavor: "sour", icon: "🎓" },
  "失語": { flavor: "spicy", icon: "🤐" },
  
  // 料理解鎖記憶
  "童年的茶": { flavor: "sweet", icon: "🍵" },
  "送茶的小手": { flavor: "sweet", icon: "👧" },
  "空蕩工房": { flavor: "bitter", icon: "🔧" },
  "最後一針": { flavor: "bitter", icon: "🪡" },
  "雪中行走": { flavor: "spicy", icon: "❄️" },
  "翻譯者": { flavor: "salty", icon: "💑" }
};

// ============================================
// 黑貓反應台詞
// ============================================
const CAT_DIALOGUES = {
  start: "「嗯...開始吧。」",
  first: "「嗯...開始了。」",
  sweet: [
    "「甜甜的...是好的回憶嗎？」",
    "「這份甜蜜...他還記得。」"
  ],
  sour: [
    "「酸澀啊...有些悔恨吧。」",
    "「這是後悔的味道。」"
  ],
  bitter: [
    "「苦澀啊...有些事不能忘。」",
    "「苦...但必須面對。」"
  ],
  spicy: [
    "「嗆...這是眼淚的味道。」",
    "「辛辣...是宣洩吧。」"
  ],
  salty: [
    "「鹹的...是記憶的重量。」",
    "「這份鹹味，來自過去。」"
  ],
  tooMuch: "「太多了...會失衡的。」",
  balanced: "「差不多了...再想想。」",
  ready: "「可以了...完成它吧。」",
  empty: "「還沒放任何東西呢。」"
};

// ============================================
// 全局狀態
// ============================================
let state = {
  userId: null,
  currentDay: 1,
  availableMemories: [],
  availableRecipes: [],
  recipeRequirements: {},
  selectedMemories: [],
  isInitialized: false
};

// ============================================
// DOM 元素
// ============================================
const elements = {
  loading: null,
  cooking: null,
  complete: null,
  catBubble: null,
  catText: null,
  recipePanel: null,
  pot: null,
  potContents: null,
  potHint: null,
  selectedMemories: null,
  memoryList: null,
  btnReset: null,
  btnCook: null,
  resultDish: null
};

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  // 取得 DOM 元素
  initElements();
  
  try {
    // 初始化 LIFF
    await initLiff();
    
    // 取得料理狀態
    await fetchCookingState();
    
    // 渲染記憶托盤與可做料理區塊
    renderMemoryTray();
    renderRecipePanel();
    
    // 設定事件監聽
    setupEventListeners();
    
    // 切換到料理畫面
    showScreen('cooking');
    
    // 顯示開場對話
    showCatDialogue(CAT_DIALOGUES.start);
    
    state.isInitialized = true;
    
  } catch (error) {
    console.error('初始化失敗:', error);
    showCatDialogue('「出了點問題...」');
  }
});

function initElements() {
  elements.loading = document.getElementById('loading');
  elements.cooking = document.getElementById('cooking');
  elements.complete = document.getElementById('complete');
  elements.catBubble = document.getElementById('cat-bubble');
  elements.catText = document.getElementById('cat-text');
  elements.recipePanel = document.getElementById('recipe-panel');
  elements.pot = document.getElementById('pot');
  elements.potContents = document.getElementById('pot-contents');
  elements.potHint = document.getElementById('pot-hint');
  elements.selectedMemories = document.getElementById('selected-memories');
  elements.memoryList = document.getElementById('memory-list');
  elements.btnReset = document.getElementById('btn-reset');
  elements.btnCook = document.getElementById('btn-cook');
  elements.resultDish = document.getElementById('result-dish');
}

// ============================================
// LIFF 相關
// ============================================
async function initLiff() {
  // 開發模式：跳過 LIFF 初始化
  if (CONFIG.LIFF_ID === 'YOUR_LIFF_ID_HERE') {
    console.log('開發模式：使用測試數據');
    state.userId = 'test_user_123';
    return;
  }
  
  await liff.init({ liffId: CONFIG.LIFF_ID });
  
  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }
  
  const profile = await liff.getProfile();
  state.userId = profile.userId;
}

// ============================================
// API 呼叫
// ============================================
// 與 GAS getDay1/2AvailableRecipes 一致的靜態對照表（開發模式與 fallback 用）
const RECIPE_REQUIREMENTS_FALLBACK = {
  "熱茶": "寒冷、針、縫線 或 寧靜＋陪伴",
  "熱湯": "雨聲、失憶 或 迷茫",
  "蜜汁燉菜": "蜜糖笑容 ＋ 眼淚",
  "苦辛醒神湯": "執念 ＋ （雪 或 死亡）",
  "撫慰鹹粥": "寧靜 ＋ 陪伴",
  "糖霜幻景拼盤": "依五味結算（甜味偏多）",
  "千針冷骨湯": "依五味結算（苦辣偏多）",
  "百味蜜汁炙燒魚": "依五味結算（平衡）"
};

function getAvailableRecipesForDay(day, memories) {
  const m = (x) => (memories || []).includes(x);
  if (day === 1) {
    const out = [];
    if (m("寒冷") || m("針") || m("縫線") || (m("寧靜") && m("陪伴"))) out.push("熱茶");
    if (m("雨聲") || m("失憶") || m("迷茫")) out.push("熱湯");
    return out;
  }
  if (day === 2) {
    const out = [];
    if (m("蜜糖笑容") && m("眼淚")) out.push("蜜汁燉菜");
    if (m("執念") && (m("雪") || m("死亡"))) out.push("苦辛醒神湯");
    if (m("寧靜") && m("陪伴")) out.push("撫慰鹹粥");
    return out;
  }
  if (day === 3) return ["糖霜幻景拼盤", "千針冷骨湯", "百味蜜汁炙燒魚"];
  return [];
}

async function fetchCookingState() {
  // 開發模式：使用測試數據
  if (CONFIG.GAS_API_URL === 'YOUR_GAS_WEB_APP_URL_HERE') {
    console.log('開發模式：使用測試記憶數據');
    state.currentDay = 2;
    state.availableMemories = [
      "裁縫手藝", "失去的名字", "空蕩的店",
      "小女孩畫作", "結婚消息", "深夜呢喃",
      "童年的茶", "送茶的小手"
    ];
    state.availableRecipes = getAvailableRecipesForDay(state.currentDay, state.availableMemories);
    state.recipeRequirements = RECIPE_REQUIREMENTS_FALLBACK;
    return;
  }
  
  const response = await fetch(`${CONFIG.GAS_API_URL}?action=getCookingState&userId=${state.userId}`);
  const data = await response.json();
  
  state.currentDay = data.currentDay || 1;
  state.availableMemories = data.collectedMemories || [];
  state.availableRecipes = data.availableRecipes || getAvailableRecipesForDay(state.currentDay, state.availableMemories);
  state.recipeRequirements = data.recipeRequirements || RECIPE_REQUIREMENTS_FALLBACK;
}

async function submitCooking() {
  // 開發模式：模擬回傳
  if (CONFIG.GAS_API_URL === 'YOUR_GAS_WEB_APP_URL_HERE') {
    console.log('開發模式：模擬料理完成', state.selectedMemories);
    showScreen('complete');
    elements.resultDish.textContent = `使用了 ${state.selectedMemories.length} 個記憶`;
    
    setTimeout(() => {
      alert('開發模式完成！實際會回傳到 LINE 聊天室');
    }, 1000);
    return;
  }
  
  const response = await fetch(`${CONFIG.GAS_API_URL}?action=submitCooking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: state.userId,
      selectedMemories: state.selectedMemories
    })
  });
  
  const result = await response.json();
  
  // API 錯誤時不送【料理完成】完成料理，改顯示錯誤並留在料理畫面
  if (result.error) {
    console.warn('submitCooking 後端錯誤:', result);
    showCatDialogue('「出了點問題…無法完成料理，請再試一次。」');
    elements.btnCook.disabled = false;
    elements.btnCook.textContent = '完成料理';
    return;
  }
  
  // 顯示完成畫面
  showScreen('complete');
  elements.resultDish.textContent = result.dishName || '料理完成';
  
  // 僅在成功且取得有效 dishName 時才發送回 LINE
  if (liff.isInClient() && result.dishName) {
    await liff.sendMessages([{
      type: 'text',
      text: `【料理完成】${result.dishName}`
    }]);
  } else if (liff.isInClient() && !result.dishName) {
    console.warn('submitCooking 未回傳 dishName:', result);
    showScreen('cooking');
    showCatDialogue('「料理結果無法辨識…請再選一次食材。」');
    elements.btnCook.disabled = false;
    elements.btnCook.textContent = '完成料理';
    return;
  }
  
  // 關閉 LIFF
  setTimeout(() => {
    if (liff.isInClient()) {
      liff.closeWindow();
    }
  }, 2000);
}

// ============================================
// 渲染
// ============================================
function renderRecipePanel() {
  if (!elements.recipePanel) return;
  const recipes = state.availableRecipes || [];
  const reqMap = state.recipeRequirements || RECIPE_REQUIREMENTS_FALLBACK;
  if (recipes.length === 0) {
    elements.recipePanel.innerHTML = '<p class="recipe-panel-empty">還缺食材…再多跟他聊聊吧。</p>';
    elements.recipePanel.classList.add('empty');
    return;
  }
  elements.recipePanel.classList.remove('empty');
  let html = '<p class="recipe-panel-title">本日可做料理</p><ul class="recipe-list">';
  recipes.forEach(dishName => {
    const req = reqMap[dishName] || '';
    html += `<li class="recipe-item"><span class="recipe-dish">${dishName}</span><span class="recipe-req">所需：${req}</span></li>`;
  });
  html += '</ul>';
  elements.recipePanel.innerHTML = html;
}

function renderMemoryTray() {
  elements.memoryList.innerHTML = '';
  
  state.availableMemories.forEach(memory => {
    const tag = createMemoryTag(memory);
    elements.memoryList.appendChild(tag);
  });
}

function createMemoryTag(memoryName) {
  const info = MEMORY_FLAVOR_MAP[memoryName] || { flavor: 'bitter', icon: '💭' };
  
  const tag = document.createElement('div');
  tag.className = 'memory-tag';
  tag.dataset.memory = memoryName;
  tag.dataset.flavor = info.flavor;
  tag.draggable = true;
  tag.innerHTML = `<span class="icon">${info.icon}</span><span>${memoryName}</span>`;
  
  // 拖曳事件
  tag.addEventListener('dragstart', handleDragStart);
  tag.addEventListener('dragend', handleDragEnd);
  
  // 觸控支援
  tag.addEventListener('touchstart', handleTouchStart, { passive: false });
  tag.addEventListener('touchmove', handleTouchMove, { passive: false });
  tag.addEventListener('touchend', handleTouchEnd);
  
  // 點擊選擇（備用方案）
  tag.addEventListener('click', () => toggleMemorySelection(memoryName));
  
  return tag;
}

function renderSelectedMemories() {
  elements.selectedMemories.innerHTML = '';
  elements.potContents.innerHTML = '';
  
  state.selectedMemories.forEach(memory => {
    const info = MEMORY_FLAVOR_MAP[memory] || { flavor: 'bitter', icon: '💭' };
    
    // 已選區域
    const tag = document.createElement('div');
    tag.className = 'memory-tag selected';
    tag.dataset.memory = memory;
    tag.innerHTML = `<span class="icon">${info.icon}</span><span>${memory}</span>`;
    tag.addEventListener('click', () => toggleMemorySelection(memory));
    elements.selectedMemories.appendChild(tag);
    
    // 鍋子內
    const potIcon = document.createElement('span');
    potIcon.textContent = info.icon;
    potIcon.style.fontSize = '1.5rem';
    elements.potContents.appendChild(potIcon);
  });
  
  // 更新提示
  elements.potHint.style.display = state.selectedMemories.length > 0 ? 'none' : 'block';
  
  // 更新托盤中的選中狀態
  document.querySelectorAll('#memory-list .memory-tag').forEach(tag => {
    const memory = tag.dataset.memory;
    tag.classList.toggle('selected', state.selectedMemories.includes(memory));
  });
  
  // 更新按鈕狀態
  elements.btnCook.disabled = state.selectedMemories.length < CONFIG.MIN_MEMORIES;
}

// ============================================
// 事件處理
// ============================================
function setupEventListeners() {
  // 鍋子拖放
  elements.pot.addEventListener('dragover', handleDragOver);
  elements.pot.addEventListener('dragleave', handleDragLeave);
  elements.pot.addEventListener('drop', handleDrop);
  
  // 按鈕
  elements.btnReset.addEventListener('click', handleReset);
  elements.btnCook.addEventListener('click', handleCook);
}

// 拖曳處理
let draggedMemory = null;

function handleDragStart(e) {
  draggedMemory = e.target.dataset.memory;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  draggedMemory = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  elements.pot.classList.add('drag-over');
}

function handleDragLeave(e) {
  elements.pot.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  elements.pot.classList.remove('drag-over');
  
  if (draggedMemory && !state.selectedMemories.includes(draggedMemory)) {
    addMemory(draggedMemory);
  }
}

// 觸控處理
let touchStartY = 0;
let touchedElement = null;

function handleTouchStart(e) {
  touchedElement = e.target.closest('.memory-tag');
  if (touchedElement) {
    touchStartY = e.touches[0].clientY;
    touchedElement.classList.add('dragging');
  }
}

function handleTouchMove(e) {
  if (!touchedElement) return;
  e.preventDefault();
  
  const touch = e.touches[0];
  const potRect = elements.pot.getBoundingClientRect();
  
  // 檢查是否在鍋子上方
  if (touch.clientX >= potRect.left && touch.clientX <= potRect.right &&
      touch.clientY >= potRect.top && touch.clientY <= potRect.bottom) {
    elements.pot.classList.add('drag-over');
  } else {
    elements.pot.classList.remove('drag-over');
  }
}

function handleTouchEnd(e) {
  if (!touchedElement) return;
  
  const memory = touchedElement.dataset.memory;
  touchedElement.classList.remove('dragging');
  
  // 檢查是否放在鍋子上
  if (elements.pot.classList.contains('drag-over')) {
    elements.pot.classList.remove('drag-over');
    if (!state.selectedMemories.includes(memory)) {
      addMemory(memory);
    }
  }
  
  touchedElement = null;
}

// 記憶選擇
function toggleMemorySelection(memory) {
  if (state.selectedMemories.includes(memory)) {
    removeMemory(memory);
  } else {
    addMemory(memory);
  }
}

function addMemory(memory) {
  if (state.selectedMemories.length >= CONFIG.MAX_MEMORIES) {
    showCatDialogue(CAT_DIALOGUES.tooMuch);
    return;
  }
  
  state.selectedMemories.push(memory);
  renderSelectedMemories();
  
  // 黑貓反應
  const info = MEMORY_FLAVOR_MAP[memory] || { flavor: 'bitter' };
  const dialogues = CAT_DIALOGUES[info.flavor];
  if (state.selectedMemories.length === 1) {
    showCatDialogue(CAT_DIALOGUES.first);
  } else if (dialogues) {
    const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    showCatDialogue(randomDialogue);
  }
  
  // 檢查是否足夠
  if (state.selectedMemories.length >= CONFIG.MIN_MEMORIES) {
    setTimeout(() => showCatDialogue(CAT_DIALOGUES.ready), 1500);
  }
}

function removeMemory(memory) {
  state.selectedMemories = state.selectedMemories.filter(m => m !== memory);
  renderSelectedMemories();
  
  if (state.selectedMemories.length === 0) {
    showCatDialogue(CAT_DIALOGUES.empty);
  }
}

// 按鈕處理
function handleReset() {
  state.selectedMemories = [];
  renderSelectedMemories();
  showCatDialogue(CAT_DIALOGUES.start);
}

async function handleCook() {
  if (state.selectedMemories.length < CONFIG.MIN_MEMORIES) return;
  
  elements.btnCook.disabled = true;
  elements.btnCook.textContent = '料理中...';
  
  try {
    await submitCooking();
  } catch (error) {
    console.error('料理失敗:', error);
    showCatDialogue('「出了點問題...再試一次？」');
    elements.btnCook.disabled = false;
    elements.btnCook.textContent = '完成料理';
  }
}

// ============================================
// 工具函數
// ============================================
function showScreen(screenId) {
  elements.loading.classList.add('hidden');
  elements.cooking.classList.add('hidden');
  elements.complete.classList.add('hidden');
  
  document.getElementById(screenId).classList.remove('hidden');
}

function showCatDialogue(text) {
  elements.catText.textContent = text;
  elements.catBubble.classList.remove('hidden');
  
  // 3 秒後隱藏
  clearTimeout(showCatDialogue.timeout);
  showCatDialogue.timeout = setTimeout(() => {
    elements.catBubble.classList.add('hidden');
  }, 3000);
}
