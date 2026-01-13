// ⚠️ 警告：此檔案包含敏感資訊（LINE Token、Google Sheets ID）
// 請勿將此檔案上傳到公開的 Git 倉庫或分享給他人
// 建議：在正式環境中使用 Google Apps Script 的 PropertiesService 儲存敏感資訊

// 【除錯版程式碼】
// 版本：V1.4 - 2026-01-12（技術底層打通階段）
const SPREADSHEET_ID = '1XWl0iPO5QMVMcI8_tYLzJipGFmfiWS4lVzLgNZi6ECk'; // 你的試算表 ID
const TOKEN = 'IADUHTu/gVHrJEXQ0YpLeUN/mIS6zhMMpwyrz9/2OqTBy8gKutxHjxIptvSrLnPI0UySJmIwYHoqoKP2zV8qL+vauBSqixT3v9QdfubKhOmlD0530gtGw/ftdGdnxSfap58MazHBZ6wFlSQ5InckXwdB04t89/1O/w1cDnyilFU='; // 直接貼上 Token，不要用抓屬性的

function doPost(e) {
  let replyToken = "無";
  try {
    const event = JSON.parse(e.postData.contents).events[0];
    replyToken = event.replyToken;
    const userId = event.source.userId;

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("userState");
    const data = sheet.getDataRange().getValues();
    
    let userRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        userRowIndex = i + 1;
        break;
      }
    }

    if (userRowIndex === -1) {
      sheet.appendRow([userId, 1, "normal", "", new Date()]);
      replyToLine(replyToken, "【連線成功】雲寶感受到主人的記憶體了！這是第 1 天！ ☁️✨");
    } else {
      const currentDay = data[userRowIndex-1][1];
      sheet.getRange(userRowIndex, 5).setValue(new Date());
      replyToLine(replyToken, "【記憶成功】主人，雲寶記得你喔！這是第 " + currentDay + " 天～");
    }

  } catch (err) {
    // 如果出錯，直接傳 LINE 給你！這就不需要看執行紀錄了
    if (replyToken !== "無") {
      replyToLine(replyToken, "雲寶大腦出錯了： " + err.toString());
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ content: 'ok' })).setMimeType(ContentService.MimeType.JSON);
}

function replyToLine(replyToken, text) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{ 'type': 'text', 'text': text }]
    }),
  });
}

function doGet(e) {
  return ContentService.createTextOutput("OK! 雲寶測試成功");
}

function setup() {
  // 隨便讀取一個儲存格，單純為了觸發 Google 的權限審核
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheets()[0];
  Logger.log("成功連接到試算表：" + sheet.getName());
}
