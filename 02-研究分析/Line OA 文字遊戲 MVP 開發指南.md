# **後 *Bird Alone* 時代的對話式敘事遊戲：類型探索與 Line OA MVP 開發測試機制深度分析報告**

## **1\. 緒論：對話式介面的敘事復興與情感連結機制**

在當代數位娛樂的版圖中，高畫質、強聲光效果的 AAA 級大作固然佔據主流視聽，但一股返璞歸真的「文字互動」與「對話式敘事」（Conversational Narrative）浪潮正悄然興起。這股浪潮並非單純懷舊早期的 MUD（多使用者迷宮）或文字冒險遊戲，而是結合了現代通訊軟體（Messaging Apps）的普及性、碎片化使用習慣以及高度私密感，創造出的全新遊戲體驗。本報告旨在深入探討在《Bird Alone》（孤獨鳥）這款現象級作品之後，還有哪些適合在對話式介面（Conversational User Interface, CUI）上發展的遊戲類型，並針對台灣市場滲透率最高的通訊平台——Line Official Account (OA)，提供一套從最小可行性產品（MVP）開發、架構設計到測試驗證的完整方法論。

### **1.1 《Bird Alone》現象解構：孤獨經濟與情感設計的極致**

要探索未來的類型，首先必須解構《Bird Alone》為何能引發如此巨大的情感共鳴。這款由 George Batchelor 開發的遊戲，表面上是虛擬寵物養成，實則是對「孤獨」、「連結」與「失去」的深度模擬 1。

#### **1.1.1 與現實同步的陪伴機制（Synchronized Companionship）**

《Bird Alone》最核心的機制在於打破了「遊戲時間」與「現實時間」的藩籬。傳統遊戲中，玩家可以透過「睡覺」或「快速旅行」來快轉時間，但在《Bird Alone》中，時間流動與現實世界完全一致。當玩家在現實中經歷早晨、午後與夜晚，遊戲中的鳥也經歷著同樣的晝夜更替。這種設計創造了一種強烈的「共在感」（Co-presence）。鳥會詢問玩家：「你今天過得如何？」或「你那邊天氣好嗎？」，這些對話發生在玩家真實的生活情境中，使得 NPC（非玩家角色）不再只是程式碼，而更像是一個活在手機另一端的實體 3。

#### **1.1.2 情感投入與共創（Emotional Investment & Co-creation）**

遊戲邀請玩家參與創作，例如畫畫或寫詩。這些創作並非為了評分或過關，而是為了「分享」。當鳥將玩家創作的詩句朗讀出來，或將玩家的畫作收藏在牠的畫廊中時，玩家投入的就不僅是操作時間，還有自我表達（Self-Expression）。這種共創過程建立了深度的情感羈絆，使得後續的「失去」變得更加令人心碎 1。

#### **1.1.3 悲劇的預演與無常體驗（Simulation of Impermanence）**

不同於傳統電子寵物（如 Tamagotchi）追求「不死」或「無限循環」，《Bird Alone》大膽地引入了不可逆的結局——死亡。遊戲在中後期會出現明顯的衰老徵兆，葉子變灰、鳥的對話變得沉重，最終鳥會離去，留下空蕩蕩的場景。這實際上是一個「悲傷處理模擬器」（Grief Processing Simulator），它強迫玩家面對數位伴侶的死亡，體驗從建立關係到面對喪失的完整情感弧線 2。這種「情感重擊」（Emotional Punch）證明了手機遊戲可以承載深刻的哲學命題，而不僅僅是殺時間的工具。

### **1.2 對話式遊戲的媒介特性分析**

Line OA 作為遊戲載體，具有獨特的媒介特性（Affordances），開發者必須順應這些特性進行設計：

1. **高頻低時長（High Frequency, Short Duration）：** 玩家習慣在等車、如廁或睡前查看 Line。遊戲設計必須支援「隨玩隨停」，單次互動時間應控制在 1-3 分鐘內 7。  
2. **私密性（Intimacy）：** Line 是與家人朋友聯繫的空間。遊戲 Bot 混入好友列表中，天然具備一種「私人朋友」的擬態。這適合發展一對一的親密敘事，而非宏大的史詩戰爭。  
3. **非同步性（Asynchronicity）：** 玩家不一定會秒回訊息。遊戲機制必須容忍延遲，甚至利用延遲來創造懸念（例如：NPC 說「我去探路」，3 小時後才回報結果） 8。

基於上述分析，我們認為單純複製《Bird Alone》的養成模式並非長久之計。為了在 Line OA 生態系中突圍，開發者應探索更具互動深度與機制創新的類型。以下章節將詳細分析四種高潛力類型：**記憶考古學**、**時間迴圈解謎**、**靈魂擺渡模擬**以及**非同步善意交換**。

## ---

**2\. 類型探索 I：記憶考古學（Memory Archaeology）與碎片化敘事**

「記憶考古學」類型受到《Her Story》、《Hypnospace Outlaw》及《Archaeology X》等遊戲的啟發 10，其核心樂趣在於「還原真相」。在 Line OA 的情境下，這通常表現為「撿到一支手機」或「駭入一個資料庫」。

### **2.1 核心機制：關鍵字驅動的挖掘（Keyword-Driven Excavation）**

在傳統圖形冒險遊戲中，玩家透過點擊場景尋找線索；而在 Line OA 文字遊戲中，「關鍵字」就是玩家的鏟子。

* **機制邏輯：** 玩家面對的是一個不知名的 Bot，它可能是一個損壞的 AI、一個舊時代的檔案庫，或是一個失蹤者的帳號。玩家輸入關鍵字（例如「密碼」、「約會」、「10月5日」），系統則檢索內部資料庫，回傳相關的訊息碎片（文字、語音、模糊照片或影片片段） 11。  
* **非線性敘事：** 故事不是按順序講述的。玩家可能先發現了結局的線索（如一張分手信的照片），才回頭挖掘開始的原因。玩家的大腦需要主動拼湊這些碎片，這種「腦內補完」的過程能產生極高的沉浸感（Immersion） 14。

### **2.2 Line OA 實作應用**

在 Line 平台上，可以利用以下功能強化體驗：

* **關鍵字自動回覆（Keyword Auto-Reply）：** 這是最基礎的實作方式。開發者在後端設定大量的關鍵字觸發規則。例如，輸入「警察」，Bot 回覆一段報案錄音；輸入「門鎖」，Bot 回傳一張鑰匙的照片。這種機制利用了 Line OA 原生的自動回應功能，成本極低 15。  
* **Rich Menu 作為工具箱：** 利用 Rich Menu 的切換功能（Switch Rich Menus），模擬手機的介面切換。  
  * **Tab A (對話模式)：** 用於輸入關鍵字查詢。  
  * **Tab B (檔案庫)：** 顯示已解鎖的關鍵線索清單（利用 Imagemap 或 Flex Message 實作）。  
  * **Tab C (系統設定)：** 模擬手機的設定頁面，增加擬真感 17。

### **2.3 案例構想：虛擬懸疑劇《Project: DEEP BLUE》**

設想一個 Line OA 遊戲，玩家加入後被告知連線到了一艘失聯深海潛艇的終端機。

* **開局：** 只有一個閃爍的游標，輸入 HELP 會顯示基礎指令。  
* **過程：** 玩家輸入 LOG 查看日誌，發現某日誌被加密。需輸入 PASSWORD，Bot 提示「提示是艦長女兒的生日」。玩家需從之前的雜談紀錄中搜尋「生日」或「女兒」，找到日期 0721，解鎖新劇情。  
* **優勢：** 這種設計完全符合 Line 的「對話」介面邏輯，且帶有強烈的窺視感（Voyeurism），極易引發玩家的好奇心 11。

## ---

**3\. 類型探索 II：對話式時間迴圈解謎（Chat-based Time Loop Mystery）**

時間迴圈（Time Loop）是近年來獨立遊戲界極受歡迎的題材，如《Twelve Minutes》、《Outer Wilds》與《Returnal》 20。在文字介面上，這種機制可以轉化為一種「對話試錯」的策略遊戲。

### **3.1 核心機制：知識即力量（Knowledge as Progression）**

與傳統 RPG 累積經驗值不同，時間迴圈遊戲的積累在於「玩家的知識」。

* **迴圈結構：** 玩家被困在一段重複的時間或對話中（例如：阻止一場即將發生的意外）。每次失敗（Bad End），時間重置，玩家回到對話起點。  
* **資訊解鎖（Information Gating）：** 在第一輪迴圈，玩家不知道兇手的名字，因此無法質問 NPC。在第三輪迴圈，玩家在別處得知了名字，回到起點時，直接輸入該名字，就會觸發全新的對話分支，打破原有的因果鏈 23。

### **3.2 狀態管理與 Line 互動設計**

在 Line OA 上實作時間迴圈，需要精細的後端狀態管理：

| 狀態變數 | 說明 | 範例 |
| :---- | :---- | :---- |
| **Local State (區域變數)** | 當前迴圈內的進度，重置時歸零。 | has\_key, door\_opened, talked\_to\_guard |
| **Global State (全域變數)** | 跨迴圈保留的關鍵知識。 | knows\_killer\_name, loop\_count, secret\_code\_unlocked |

* **重置的儀式感：** Line 的對話是線性的，無法像遊戲畫面那樣「黑屏重啟」。因此需要設計「文字儀式」。例如，每次重置時，Bot 會發送一張特定的「倒帶 GIF」或全黑圖片，然後發送與遊戲最開始完全相同的第一句話。  
* **後設敘事（Meta-Narrative）：** 隨著 loop\_count 增加，Bot 的第一句話可以發生微小變化。  
  * *Loop 1:* 「你好，請問這裡是哪裡？」  
  * Loop 10: 「又是你...我們是不是一直在重複？」  
    這種細節能讓玩家感覺到遊戲世界對「重複」是有感知的，增加驚悚感或神秘感 20。

### **3.3 結合時間機制的謎題設計**

Line 的 API 允許發送延遲訊息（需自行實作排程），這可以強化時間迴圈的緊迫感。

* **實時壓力：** Bot 說：「我去拆彈，給我 5 分鐘。」（此時系統計時）。5 分鐘後，若玩家未給出正確指令，Bot 傳來爆炸聲貼圖，隨後觸發重置。  
* **非同步解謎：** 玩家必須在 Bot 「死亡」前的這 5 分鐘內，利用關鍵字查詢功能（如前述記憶考古學機制）找到正確的拆彈密碼。

## ---

**4\. 類型探索 III：靈魂擺渡模擬（Soul Ferrying Simulation）**

受到《Spiritfarer》、《Cozy Grove》與《Animal Crossing》等「舒適遊戲」（Cozy Games）的啟發 25，此類型將重點放在情感陪伴、情緒管理與溫柔的告別。

### **4.1 核心機制：情緒勞動與儀式感（Emotional Labor & Rituals）**

這類遊戲不追求高強度的挑戰，而是提供一種「安全的心流體驗」（Flow）。

* **靈魂仲介設定：** 玩家扮演一個傾聽者或仲介者，Line 好友列表中的 Bot 都是迷失的靈魂或擁有未了心願的角色。  
* **情緒管理：** 透過對話選項（Flex Message 按鈕）安撫 NPC。選項不是「正確答案」，而是不同的情感回應（同理、鼓勵、沈默）。不同的回應會影響 NPC 的「平靜值」或「執念值」 28。  
* **告別儀式：** 遊戲的終極目標不是留住 NPC，而是讓他們「成佛」或「前往來世」。當好感度或平靜值滿時，會觸發告別劇情。這與《Bird Alone》的喪失感不同，這裡強調的是「圓滿」與「釋懷」 6。

### **4.2 Line OA 實作特色：Cozy UI 設計**

* **Flex Message 的視覺化：** 利用 Flex Message 製作精美的「靈魂狀態卡」。卡片上可以顯示 NPC 的心情圖示（如天氣符號）、好感度愛心，以及他們喜歡的物品（供品）。這種視覺回饋能降低純文字閱讀的疲勞 29。  
* **每日儀式（Daily Rituals）：** 設計輕度的每日任務。例如，每天晚上 10 點，玩家需要發送一個「晚安」貼圖給 NPC。這種規律性的互動能建立安全感與依戀感 31。

## ---

**5\. 類型探索 IV：非同步善意交換（Asynchronous Kindness Exchange）**

此類型受到《Kind Words》與《Sky: Children of the Light》的啟發 32，將 Line OA 轉化為一個匿名、正向的社交樞紐。

### **5.1 核心機制：匿名信件與善意循環**

這不是單人遊戲，而是基於群體的被動多人遊戲（Passive Multiplayer）。

* **信件請求（Request）：** 玩家向 Bot 發送：「我最近工作壓力很大，覺得很迷茫。」  
* **信件派送（Dispatch）：** Bot 將這則訊息匿名轉發給其他隨機的 3-5 位玩家。  
* **善意回覆（Reply）：** 收到訊息的玩家可以回覆鼓勵的話語。Bot 再將這些回覆轉寄給原發信者。  
* **貼紙獎勵（Stickers）：** 為了鼓勵回覆，玩家可以隨信附贈虛擬貼紙（由 Bot 生成的圖片）。收集貼紙成為了一種溫和的驅動力 34。

### **5.2 Line OA 的社群過濾與安全機制**

在 Line 這種私密平台上進行陌生人社交，安全性是首要考量。

* **AI 內容審查：** 必須接入 OpenAI API 或 Azure Content Safety API，對所有用戶輸入的內容進行即時審查，過濾掉霸凌、色情、暴力或個資內容。這是此類型 MVP 能否存活的關鍵 36。  
* **舉報機制：** 在每一則轉發的 Flex Message 下方，必須設置「檢舉」按鈕。一旦被檢舉，該內容立即從資料庫下架，並對發送者進行標記。

## ---

**6\. Line OA MVP 開發架構分析：技術、成本與限制**

在確立了遊戲類型後，如何以最低成本（Minimum Viable Product）驗證概念是關鍵。Line 的 Messaging API 計費模式（以推播訊息量計費）是最大門檻。本節將提出一套基於 Google Sheets \+ GAS 的無伺服器架構，旨在極大化利用免費額度。

### **6.1 Line Messaging API 成本結構與應對策略**

Line OA 的訊息類型主要分為三類，成本差異巨大 37：

| 訊息類型 | 觸發方式 | 費用 | MVP 策略 |
| :---- | :---- | :---- | :---- |
| **Push Message** | Bot 主動發送給用戶（一對一或群發）。 | **計費**（免費額度極少，如 500 則/月）。 | **極力避免**。僅用於緊急通知或長時間未登入召回。 |
| **Reply Message** | 用戶發送訊息後，Bot 使用 replyToken 回覆。 | **免費**。 | **核心機制**。遊戲必須設計成「用戶主動觸發」，Bot 被動回應。 |
| **Multicast** | 向特定 User ID 列表發送相同訊息。 | **計費**。 | 用於非同步社交類型的信件轉發，需謹慎計算成本。 |

#### **6.1.1 「拉取式」（Pull-based）互動設計**

為了節省成本，遊戲設計必須誘導用戶主動傳訊息：

* **錯誤設計：** Bot 每小時主動傳訊：「發生什麼事了？」 \-\> **成本高**。  
* **正確設計：** 遊戲利用 Rich Menu 顯示「查看狀況」按鈕。用戶點擊按鈕（發送 Postback event），Bot 回覆劇情。 \-\> **免費**。  
* **分段敘事技巧：** 如果一段劇情很長，不要用 Push API 連發 5 則。而是發送第 1 則，末尾附帶一個 Quick Reply 按鈕「繼續」。用戶點擊「繼續」，Bot 再發第 2 則。這樣全程使用免費的 Reply API，且讓用戶掌握閱讀節奏 40。

### **6.2 無伺服器後端架構：Google Sheets \+ GAS 實戰**

對於 MVP，建立傳統的 SQL 資料庫與 Node.js 伺服器維護成本過高。利用 Google Sheets 作為資料庫，Google Apps Script (GAS) 作為後端邏輯是最佳實踐 41。

#### **6.2.1 系統架構圖**

1. **前端 (Frontend):** Line App (使用者介面)。  
2. **介面層 (Gateway):** Line Platform (處理 Webhook)。  
3. **後端邏輯 (Backend Logic):** Google Apps Script (部署為 Web App，接收 doPost 請求)。  
4. **資料層 (Database):** Google Spreadsheet。

#### **6.2.2 資料庫設計 (Schema Design)**

建議在 Google Sheet 中建立以下分頁：

* **Users Sheet:** 儲存玩家狀態。  
  * Columns: user\_id, display\_name, current\_state (例如: 'CHAPTER\_1'), inventory (JSON string), last\_active\_time.  
* **Script Sheet:** 儲存劇本與回應規則。  
  * Columns: scene\_id, trigger\_keyword, reply\_type (text/flex), reply\_content, next\_state.  
* **Logs Sheet:** 記錄所有互動，用於數據分析。

#### **6.2.3 核心程式碼邏輯 (GAS Pseudo-code)**

JavaScript

function doPost(e) {  
  var json \= JSON.parse(e.postData.contents);  
  var replyToken \= json.events.replyToken;  
  var userId \= json.events.source.userId;  
  var userMessage \= json.events.message.text;

  // 1\. 讀取玩家狀態  
  var userState \= getUserStateFromSheet(userId);

  // 2\. 根據狀態與關鍵字匹配劇本  
  var response \= matchScript(userState, userMessage);

  // 3\. 執行狀態轉移 (State Transition)  
  if (response.nextState) {  
    updateUserStateInSheet(userId, response.nextState);  
  }

  // 4\. 回覆訊息 (調用 Line Reply API)  
  sendLineReply(replyToken, response.content);  
}

* **並發處理 (Concurrency) 注意事項：** Google Sheets 不擅長處理高併發寫入。在 GAS 中，應使用 LockService 來防止多個請求同時寫入同一行數據導致的衝突 44。

### **6.3 進階 UI 組件應用：Flex Message 與 Dynamic Rich Menu**

為了突破純文字的枯燥，必須善用 Line 的進階 UI。

#### **6.3.1 Flex Message：敘事的視覺化容器**

Flex Message 允許開發者使用 JSON 定義複雜的佈局（Layout）。

* **應用場景：**  
  * **物品卡片：** 顯示獲得道具的圖片、名稱與描述。  
  * **劇情信件：** 模擬手寫信紙的背景與字體。  
  * **狀態儀表板：** 顯示 HP、好感度進度條。  
* **優勢：** 相比直接傳送圖片，Flex Message 的載入速度更快，且文字部分可被搜尋與複製，更具互動性 29。

#### **6.3.2 Dynamic Rich Menu：模擬遊戲介面切換**

Line 允許透過 API 為特定使用者設定特定的 Rich Menu。

* **狀態機應用：**  
  * **狀態 A（探索中）：** Rich Menu 顯示「調查」、「移動」、「背包」。  
  * **狀態 B（對話中）：** 進入劇情對話後，Rich Menu 自動切換為「提問」、「出示證物」、「離開」。  
  * **狀態 C（解謎中）：** 顯示數字鍵盤或特殊符號輸入板。  
* **實作：** 使用 Messaging API 的 Link rich menu to user 端點。這能讓 Line 介面瞬間變成類似掌機的控制台，極大提升操作體驗 17。

## ---

**7\. MVP 測試機制與關鍵指標分析**

MVP 的目的不是完美，而是「驗證假設」。對於敘事遊戲，我們需要驗證的是：故事是否吸引人？機制是否易懂？玩家是否願意持續投入？

### **7.1 測試階段規劃**

#### **7.1.1 階段一：Wizard of Oz（綠野仙蹤法）測試**

在撰寫任何程式碼之前，可以先進行人工模擬測試。

* **方法：** 開發者使用 Line OA 的管理後台（Manager CMS）或 1對1 聊天功能，手動扮演 Bot 回覆測試者。  
* **目的：** 驗證劇本的流暢度。如果測試者在某段劇情卡住或感到無聊，開發者可以即時調整回應。這種「人肉 Bot」測試能以零成本發現 80% 的敘事邏輯漏洞 49。

#### **7.1.2 階段二：技術封測 (Alpha Test)**

利用 GAS 部署自動化 Bot，邀請約 50-100 位核心玩家（可從 Discord 或 PTT 招募）進行測試。重點檢查 LockService 是否能處理多人同時互動，以及 Rich Menu 切換是否流暢。

### **7.2 關鍵成效指標 (KPIs) 與數據埋點**

對於敘事型遊戲，傳統 APP 的指標（如下載量）意義不大。應關注以下特定指標 50：

| 指標構面 | 關鍵指標 (Key Metrics) | 定義與分析意義 |
| :---- | :---- | :---- |
| **參與度 (Engagement)** | **對話深度 (Session Depth)** | 單次 Session 中，玩家與 Bot 來回互動的次數。過低代表開頭無趣；過高且未推進劇情可能代表卡關。 |
|  | **主動觸發率 (Trigger Rate)** | 玩家主動點擊 Rich Menu 或輸入關鍵字的頻率。反映遊戲機制的引導是否成功。 |
| **留存與流失 (Retention)** | **劇情完成率 (Completion Rate)** | 玩家到達結局的比例。需分析流失點（Churn Point），例如由第 3 章到第 4 章流失了 50% 玩家，可能代表第 3 章謎題太難。 |
|  | **D1/D7 留存** | 文字遊戲生命週期短，重點看 D1（隔日留存）。若 D1 低於 20%，說明核心循環缺乏吸引力。 |
| **情感反饋 (Sentiment)** | **文字情緒分析** | 簡單分析玩家輸入的文字（如「哇！」、「好難」、「...」），判斷其情感正負向。 |

### **7.3 A/B Testing 實作範例**

在 Google Sheets 中，可以簡單地將 User ID 的最後一位數作為分組依據（奇數組/偶數組），進行 A/B 測試 53：

* **測試變數：** 開場白（Onboarding）的長度。  
  * **Group A:** 長篇敘事鋪陳背景。  
  * **Group B:** 直接進入互動選擇。  
* **驗證指標：** 觀察兩組在「前 5 分鐘流失率」上的差異，以此優化開場體驗。

## ---

**8\. 結論與未來展望**

綜上所述，Line OA 不僅僅是行銷或客服工具，它是一個尚未被充分挖掘的「對話式遊戲」藍海。透過「記憶考古」、「時間迴圈」、「靈魂擺渡」與「善意交換」等類型創新，開發者可以避開與《Bird Alone》的同質化競爭，創造出獨特的敘事體驗。

### **8.1 發展路徑建議**

1. **MVP 階段：** 嚴格遵守「Pull-based」原則，利用 Reply API 與 Google Sheets \+ GAS 架構，將成本降至接近零。專注於劇本打磨與互動節奏的調優。  
2. **驗證階段：** 透過小規模流量導入，關注「劇情完成率」與「對話深度」。若數據不佳，優先修改劇本與引導機制，而非增加功能。  
3. **擴展階段：** 當用戶量突破 Google Sheets 極限（約 1,000 DAU 或併發請求過高），再考慮遷移至 AWS Lambda \+ MySQL/DynamoDB 架構，並引入 OpenAI API 實現更動態的 NPC 對話 54。

對話式遊戲的核心在於「文字的想像力」與「等待的美學」。在資訊爆炸的時代，這種低頻、私密且充滿情感連結的遊戲形式，或許正是現代人內心最渴望的數位綠洲。

## ---

**9\. 附錄：Line OA 遊戲 MVP 功能規格建議書 (Technical Spec Draft)**

為了協助開發者快速落地，以下提供一份標準化的 MVP 規格建議。

### **A. 系統環境**

* **前端平台:** Line App (iOS/Android/Desktop)  
* **API 版本:** Line Messaging API v2  
* **後端環境:** Google Apps Script (V8 Runtime)  
* **資料庫:** Google Sheets

### **B. 資料表結構定義 (Schema)**

**1\. User\_Status (玩家狀態表)**

| Column | Type | Description |
| :---- | :---- | :---- |
| user\_id | String | Line User ID (Unique Key) |
| state\_id | String | 當前劇情節點 (如 S\_101) |
| inventory | JSON | 玩家持有物品 (如 \["key", "photo"\]) |
| flags | JSON | 劇情開關 (如 {"met\_alice": true}) |
| last\_seen | Date | 最後互動時間 |

**2\. Script\_Data (劇本資料表)**

| Column | Type | Description |
| :---- | :---- | :---- |
| scene\_id | String | 場景 ID |
| trigger\_type | Enum | keyword, postback, image |
| trigger\_content | String | 觸發關鍵字 (支援 Regex) |
| response\_type | Enum | text, flex, image, sticker |
| response\_payload | JSON/Text | 回覆內容或 Flex JSON |
| next\_state | String | 觸發後跳轉的新狀態 |
| update\_flag | JSON | 觸發後更新的 Flag |

### **C. 限制與風險管理**

* **API Rate Limit:** Line 每分鐘 API 呼叫限制。GAS 每使用者每日執行時間 90 分鐘。需在程式碼中加入 Utilities.sleep() 避免短時間爆量，或設計佇列機制。  
* **Google Sheets 讀寫效能:** 當資料超過 5,000 列時讀寫變慢。建議 MVP 階段僅保留活躍用戶資料，定期封存舊資料 (Archiving)。  
* **隱私合規:** 避免在 Sheet 中儲存用戶真實姓名或照片，僅儲存 User ID 與遊戲內數據。

*(報告結束)*

#### **引用的著作**

1. Bird Alone: An Interview with Developer George Batchelor \- KeenGamer, 檢索日期：1月 14, 2026， [https://www.keengamer.com/articles/features/interviews/bird-alone-an-interview-with-developer-george-batchelor/](https://www.keengamer.com/articles/features/interviews/bird-alone-an-interview-with-developer-george-batchelor/)  
2. Bird Alone \- a video game with a bitter end \- and perhaps that's a good thing\!, 檢索日期：1月 14, 2026， [https://www.premierdigital.info/post/bird-alone-a-video-game-with-a-bitter-end-and-perhaps-that-s-a-good-thing](https://www.premierdigital.info/post/bird-alone-a-video-game-with-a-bitter-end-and-perhaps-that-s-a-good-thing)  
3. Bird Alone review \- "Life, death and the memories in between" | Articles | Pocket Gamer, 檢索日期：1月 14, 2026， [https://ee.pocketgamer.com/articles/084145/bird-alone-review-life-death-and-the-memories-in-between/](https://ee.pocketgamer.com/articles/084145/bird-alone-review-life-death-and-the-memories-in-between/)  
4. Bird is the loneliest number — Bird Alone Review \- GamingTrend, 檢索日期：1月 14, 2026， [https://gamingtrend.com/reviews/bird-is-the-loneliest-number-bird-alone-review/](https://gamingtrend.com/reviews/bird-is-the-loneliest-number-bird-alone-review/)  
5. (Spoilers) I just found out the ending and I'm so glad I stopped playing accidentally. : r/BirdAlone \- Reddit, 檢索日期：1月 14, 2026， [https://www.reddit.com/r/BirdAlone/comments/1ano766/spoilers\_i\_just\_found\_out\_the\_ending\_and\_im\_so/](https://www.reddit.com/r/BirdAlone/comments/1ano766/spoilers_i_just_found_out_the_ending_and_im_so/)  
6. Bird Alone Review: A Virtual Pet with a Painful Lesson \- Tricycle, 檢索日期：1月 14, 2026， [https://tricycle.org/magazine/bird-alone-review/](https://tricycle.org/magazine/bird-alone-review/)  
7. I Think We're Moving a Little Too Fast, Bird Alone, 檢索日期：1月 14, 2026， [https://www.avclub.com/i-think-were-moving-a-little-too-fast-bird-alone](https://www.avclub.com/i-think-were-moving-a-little-too-fast-bird-alone)  
8. Bird Alone — Time Mechanics Question : r/BirdAlone \- Reddit, 檢索日期：1月 14, 2026， [https://www.reddit.com/r/BirdAlone/comments/12h4iid/bird\_alone\_time\_mechanics\_question/](https://www.reddit.com/r/BirdAlone/comments/12h4iid/bird_alone_time_mechanics_question/)  
9. Text-Based Game Design (Principles, Examples, Mechanics), 檢索日期：1月 14, 2026， [https://gamedesignskills.com/game-design/text-based/](https://gamedesignskills.com/game-design/text-based/)  
10. ArchaeologyX on Steam, 檢索日期：1月 14, 2026， [https://store.steampowered.com/app/724630/ArchaeologyX/](https://store.steampowered.com/app/724630/ArchaeologyX/)  
11. 11 Best Detective Games in 2025: Leave No Stone Unturned \- Eneba, 檢索日期：1月 14, 2026， [https://www.eneba.com/hub/games/best-detective-games/](https://www.eneba.com/hub/games/best-detective-games/)  
12. Top 10 Mystery Indie Games \- YouTube, 檢索日期：1月 14, 2026， [https://www.youtube.com/watch?v=fZdi2YbLRko](https://www.youtube.com/watch?v=fZdi2YbLRko)  
13. Detective games using keywords : r/gamingsuggestions \- Reddit, 檢索日期：1月 14, 2026， [https://www.reddit.com/r/gamingsuggestions/comments/11luncj/detective\_games\_using\_keywords/](https://www.reddit.com/r/gamingsuggestions/comments/11luncj/detective_games_using_keywords/)  
14. What Lasts of Us: implicit archaeology through environmental storytelling, 檢索日期：1月 14, 2026， [https://jgeekstudies.org/2023/10/07/what-lasts-of-us-implicit-archaeology-through-environmental-storytelling/](https://jgeekstudies.org/2023/10/07/what-lasts-of-us-implicit-archaeology-through-environmental-storytelling/)  
15. How to Set Up LINE Chat Auto Reply \- Respond.io, 檢索日期：1月 14, 2026， [https://respond.io/blog/line-auto-reply](https://respond.io/blog/line-auto-reply)  
16. Three ways to easily set up LINE automatic replies \- SaleSmartly, 檢索日期：1月 14, 2026， [https://www.salesmartly.com/en/blog/docs/three-ways-set-up-line-automatic-replies](https://www.salesmartly.com/en/blog/docs/three-ways-set-up-line-automatic-replies)  
17. Use rich menus \- Messaging API \- LINE Developers, 檢索日期：1月 14, 2026， [https://developers.line.biz/en/docs/messaging-api/using-rich-menus/](https://developers.line.biz/en/docs/messaging-api/using-rich-menus/)  
18. Switch between tabs on rich menus \- LINE Developers, 檢索日期：1月 14, 2026， [https://developers.line.biz/en/docs/messaging-api/switch-rich-menus/](https://developers.line.biz/en/docs/messaging-api/switch-rich-menus/)  
19. What Makes a Good Detective Game? | Game Maker's Toolkit : r/Games \- Reddit, 檢索日期：1月 14, 2026， [https://www.reddit.com/r/Games/comments/6y1dmc/what\_makes\_a\_good\_detective\_game\_game\_makers/](https://www.reddit.com/r/Games/comments/6y1dmc/what_makes_a_good_detective_game_game_makers/)  
20. “Live \- Die \- Repeat”. The Time Loop as a Narrative and a Game Mechanic | Lahdenperä | International Journal of Transmedia Literacy (IJTL), 檢索日期：1月 14, 2026， [https://www.ledonline.it/index.php/transmedialiteracy/article/view/1657/0](https://www.ledonline.it/index.php/transmedialiteracy/article/view/1657/0)  
21. Time loop \- Wikipedia, 檢索日期：1月 14, 2026， [https://en.wikipedia.org/wiki/Time\_loop](https://en.wikipedia.org/wiki/Time_loop)  
22. How Time Loops Are Used to Tell Great Stories : r/VideoGameAnalysis \- Reddit, 檢索日期：1月 14, 2026， [https://www.reddit.com/r/VideoGameAnalysis/comments/1ibyowl/how\_time\_loops\_are\_used\_to\_tell\_great\_stories/](https://www.reddit.com/r/VideoGameAnalysis/comments/1ibyowl/how_time_loops_are_used_to_tell_great_stories/)  
23. Are time loop mechanics fun? : r/gamedesign \- Reddit, 檢索日期：1月 14, 2026， [https://www.reddit.com/r/gamedesign/comments/1pwkld5/are\_time\_loop\_mechanics\_fun/](https://www.reddit.com/r/gamedesign/comments/1pwkld5/are_time_loop_mechanics_fun/)  
24. How to improve that "stuck in the time-loop" design? : r/gamedesign \- Reddit, 檢索日期：1月 14, 2026， [https://www.reddit.com/r/gamedesign/comments/1b0qe2y/how\_to\_improve\_that\_stuck\_in\_the\_timeloop\_design/](https://www.reddit.com/r/gamedesign/comments/1b0qe2y/how_to_improve_that_stuck_in_the_timeloop_design/)  
25. 15 AMAZING Cozy Games Like Spiritfarer You Need to Try Next \- YouTube, 檢索日期：1月 14, 2026， [https://www.youtube.com/watch?v=2gH\_wFJZ0zM](https://www.youtube.com/watch?v=2gH_wFJZ0zM)  
26. The Rise of Cozy Games \- Epic Games Store, 檢索日期：1月 14, 2026， [https://store.epicgames.com/en-US/news/best-cozy-games-why-cozy-feature-interview](https://store.epicgames.com/en-US/news/best-cozy-games-why-cozy-feature-interview)  
27. Spiritfarer is a hand-drawn crafting story game about making friends with animals, 檢索日期：1月 14, 2026， [https://www.pcgamer.com/spiritfarer-is-a-hand-drawn-crafting-story-game-about-making-friends-with-animals/](https://www.pcgamer.com/spiritfarer-is-a-hand-drawn-crafting-story-game-about-making-friends-with-animals/)  
28. Sharing my 17 strategies for improving player retention (and I want to hear your feedback), 檢索日期：1月 14, 2026， [https://www.reddit.com/r/gamedesign/comments/1els3pg/sharing\_my\_17\_strategies\_for\_improving\_player/](https://www.reddit.com/r/gamedesign/comments/1els3pg/sharing_my_17_strategies_for_improving_player/)  
29. Send Flex Messages \- LINE Developers, 檢索日期：1月 14, 2026， [https://developers.line.biz/en/docs/messaging-api/using-flex-messages/](https://developers.line.biz/en/docs/messaging-api/using-flex-messages/)  
30. Flex Message elements | LINE Developers, 檢索日期：1月 14, 2026， [https://developers.line.biz/en/docs/messaging-api/flex-message-elements/](https://developers.line.biz/en/docs/messaging-api/flex-message-elements/)  
31. Bird Alone Diary: Part One \- Fanbyte, 檢索日期：1月 14, 2026， [https://www.fanbyte.com/legacy/bird-alone-diary-part-one](https://www.fanbyte.com/legacy/bird-alone-diary-part-one)  
32. Kind Words: A game of lo-fi beats, letters to strangers, and feeling less alone, 檢索日期：1月 14, 2026， [https://www.gamesindustry.biz/kind-words-a-game-of-lofi-beats-letters-to-strangers-and-feeling-less-alone](https://www.gamesindustry.biz/kind-words-a-game-of-lofi-beats-letters-to-strangers-and-feeling-less-alone)  
33. The Kindness Game: A Review of “Kind Words” | by Oliver Meredith Cox | Wonk Bridge, 檢索日期：1月 14, 2026， [https://medium.com/wonk-bridge/the-kindness-game-a-review-of-kind-words-db367c66c0](https://medium.com/wonk-bridge/the-kindness-game-a-review-of-kind-words-db367c66c0)  
34. How do conversations work? :: Kind Words 2 General Discussions \- Steam Community, 檢索日期：1月 14, 2026， [https://steamcommunity.com/app/2118120/discussions/0/4852156627906188411/](https://steamcommunity.com/app/2118120/discussions/0/4852156627906188411/)  
35. Kind Words Game Review : A Rare Haven of Companionship \- Game Design Blog, 檢索日期：1月 14, 2026， [https://cjleo.com/blog/kind-words-is-the-rare-haven-of-companionship-we-need-from-a-video-game/](https://cjleo.com/blog/kind-words-is-the-rare-haven-of-companionship-we-need-from-a-video-game/)  
36. How to use Chat GPT to write a customised murder mystery game \- Red Herring Games, 檢索日期：1月 14, 2026， [https://www.red-herring-games.com/how-to-use-chat-gpt-to-write-a-customised-murder-mystery-game/](https://www.red-herring-games.com/how-to-use-chat-gpt-to-write-a-customised-murder-mystery-game/)  
37. Message limits | LINE Official Account Help Center, 檢索日期：1月 14, 2026， [https://help2.line.me/official\_account/web/categoryId/20006330/pc?lang=en\&contentId=20011707](https://help2.line.me/official_account/web/categoryId/20006330/pc?lang=en&contentId=20011707)  
38. Send messages | LINE Developers, 檢索日期：1月 14, 2026， [https://developers.line.biz/en/docs/messaging-api/sending-messages/](https://developers.line.biz/en/docs/messaging-api/sending-messages/)  
39. What are reply messages and push messages? \- Sinch Community \- 9785, 檢索日期：1月 14, 2026， [https://community.sinch.com/t5/LINE/What-are-reply-messages-and-push-messages/ta-p/9785](https://community.sinch.com/t5/LINE/What-are-reply-messages-and-push-messages/ta-p/9785)  
40. Use quick replies \- LINE Developers, 檢索日期：1月 14, 2026， [https://developers.line.biz/en/docs/messaging-api/using-quick-reply/](https://developers.line.biz/en/docs/messaging-api/using-quick-reply/)  
41. How to Build a Internal Data App with Google Sheets Backend ..., 檢索日期：1月 14, 2026， [https://dev.to/squadbase/how-to-build-a-internal-data-app-with-google-sheets-backend-using-streamlit-27d8](https://dev.to/squadbase/how-to-build-a-internal-data-app-with-google-sheets-backend-using-streamlit-27d8)  
42. Build A Complete Back End In 20 Minutes With Google Sheets (A Hack For Beginners) | by Kevin Kononenko | Medium, 檢索日期：1月 14, 2026， [https://medium.com/@kevink/build-a-complete-back-end-in-20-minutes-with-google-sheets-a-hack-for-beginners-404c8e728e3](https://medium.com/@kevink/build-a-complete-back-end-in-20-minutes-with-google-sheets-a-hack-for-beginners-404c8e728e3)  
43. How to use Google Sheet as Backend for your App \- YouTube, 檢索日期：1月 14, 2026， [https://www.youtube.com/watch?v=Kyyxpp4gvt8](https://www.youtube.com/watch?v=Kyyxpp4gvt8)  
44. How to Use Google Apps Script to Automate Google Sheets | by Ayush Raj | Medium, 檢索日期：1月 14, 2026， [https://medium.com/@ayushraj1024/how-to-use-google-apps-script-to-automate-google-sheets-63ff27d765e7](https://medium.com/@ayushraj1024/how-to-use-google-apps-script-to-automate-google-sheets-63ff27d765e7)  
45. Google Apps Script for Beginners: Start Automating Google Sheets \- YouTube, 檢索日期：1月 14, 2026， [https://www.youtube.com/watch?v=8UmdqwY9AdA](https://www.youtube.com/watch?v=8UmdqwY9AdA)  
46. Using Flex Message to create World Cup LINE Bot | by Sitthi Thiammekha \- Medium, 檢索日期：1月 14, 2026， [https://medium.com/linedevth/using-flex-message-to-create-world-cup-line-bot-60e0591f9d02](https://medium.com/linedevth/using-flex-message-to-create-world-cup-line-bot-60e0591f9d02)  
47. How to create dynamic LINE flex message via Amity Bots | by Pitchaya Thipkham, 檢索日期：1月 14, 2026， [https://tutorials.amity.co/how-to-create-dynamic-line-flex-message-via-amity-bots-c6acf3a90e3b](https://tutorials.amity.co/how-to-create-dynamic-line-flex-message-via-amity-bots-c6acf3a90e3b)  
48. Tutorial｜Basic Setup and Multi-page Guide for Rich Menu, 檢索日期：1月 14, 2026， [https://crescendolab.zendesk.com/hc/en-us/articles/4413211682329-Tutorial-Basic-Setup-and-Multi-page-Guide-for-Rich-Menu](https://crescendolab.zendesk.com/hc/en-us/articles/4413211682329-Tutorial-Basic-Setup-and-Multi-page-Guide-for-Rich-Menu)  
49. Using Data and Analytics to Improve Your Narrative Games \- Emilia Lazer-Walker, 檢索日期：1月 14, 2026， [https://blog.lazerwalker.com/azure,/game/dev/2020/01/29/using-data-to-improve-your-narrative-games.html](https://blog.lazerwalker.com/azure,/game/dev/2020/01/29/using-data-to-improve-your-narrative-games.html)  
50. TextQuests: How Good are LLMs at Text-Based Video Games? \- arXiv, 檢索日期：1月 14, 2026， [https://arxiv.org/html/2507.23701v1](https://arxiv.org/html/2507.23701v1)  
51. Six Metrics for Better Game Narrative \- Game Developer, 檢索日期：1月 14, 2026， [https://www.gamedeveloper.com/design/six-metrics-for-better-game-narrative](https://www.gamedeveloper.com/design/six-metrics-for-better-game-narrative)  
52. MVP Testing \- A Guide to Validate a Minimum Viable Product \- UXCam, 檢索日期：1月 14, 2026， [https://uxcam.com/blog/mvp-testing/](https://uxcam.com/blog/mvp-testing/)  
53. Game retention: 12 strategies from the most popular games \- Feature Upvote, 檢索日期：1月 14, 2026， [https://featureupvote.com/blog/game-retention/](https://featureupvote.com/blog/game-retention/)  
54. Getting started with LINE Login \- LINE Developers, 檢索日期：1月 14, 2026， [https://developers.line.biz/en/docs/line-login/getting-started/](https://developers.line.biz/en/docs/line-login/getting-started/)  
55. Top 25 Chatbot Case Studies & Success Stories in 2026 \- Research AIMultiple, 檢索日期：1月 14, 2026， [https://research.aimultiple.com/top-chatbot-success/](https://research.aimultiple.com/top-chatbot-success/)