---
name: ink-integration
description: 將 Ink JSON 接進 C#/Unity/網頁載體。實作 Story API、存檔、tags、變數存取。接殼至 Unity、inkjs、或純 C# 時使用。
---

# Ink Integration Skill

## When to Use

- 將 Ink 編譯後的 JSON 接進 Unity、C# 或網頁
- 實作 Story 載入、內容輸出、選項處理
- 處理存檔、讀檔、tags、變數存取
- 選擇載體（Unity、inkjs、ink-engine-runtime）

---

## 基本流程

### 1. 載入 Story

```csharp
using Ink.Runtime;

// Unity：從 TextAsset 載入
_inkStory = new Story(inkAsset.text);

// 純 C#：從字串載入
_inkStory = new Story(inkJsonString);
```

### 2. 輸出內容

```csharp
while (_inkStory.canContinue) {
    string line = _inkStory.Continue();
    // 顯示給玩家
}

// 或一次取完
string all = _inkStory.ContinueMaximally();
```

### 3. 選項

```csharp
if (_inkStory.currentChoices.Count > 0) {
    foreach (var choice in _inkStory.currentChoices) {
        // choice.text 顯示選項
    }
    _inkStory.ChooseChoiceIndex(playerSelectedIndex);
    // 回到步驟 2
}
```

---

## 存檔 / 讀檔

```csharp
string savedJson = _inkStory.state.ToJson();
_inkStory.state.LoadJson(savedJson);
```

---

## Tags

| 用途 | API |
|------|-----|
| 當前行標籤 | `_inkStory.currentTags` → `List<string>` |
| Knot 標籤 | `_inkStory.TagsForContentAtPath("knot_name")` |
| 全域標籤 | `_inkStory.globalTags` |
| Choice 標籤 | `choice.tags`（每個 Choice 物件） |

在 Ink 內：`文字內容 # tag1 # tag2`

---

## 變數存取

```csharp
// 取得
int day = (int)_inkStory.variablesState["current_day"];
string phase = (string)_inkStory.variablesState["phase"];

// 設定
_inkStory.variablesState["current_day"] = 2;

// 變數觀察
_inkStory.ObserveVariable("health", (string varName, object newValue) => {
    UpdateUI((int)newValue);
});
```

---

## 跳轉

```csharp
_inkStory.ChoosePathString("DAY1_NIGHT");
_inkStory.ChoosePathString("knot.stitch");  // stitch 用 . 分隔
// 之後照常 Continue()
```

---

## 錯誤處理

```csharp
_inkStory.onError += (msg, type) => {
    if (type == Ink.ErrorType.Warning) Debug.LogWarning(msg);
    else Debug.LogError(msg);
};
```

---

## 載體對照

| 載體 | 套件 | 說明 |
|------|------|------|
| **Unity** | [ink-unity-integration](https://github.com/inkle/ink-unity-integration) | 自動編譯 .ink、Inspector Play 預覽 |
| **網頁** | [inkjs](https://github.com/y-lohse/inkjs) | JavaScript runtime，Inky Export for web |
| **C# 純程式** | ink-engine-runtime (NuGet) | 僅 runtime，需自行用 inklecate 編譯 .ink → JSON |

### 編譯 .ink → JSON

- **Inky**：File → Export → Export to JSON
- **inklecate**：`inklecate -o output.json story.ink`

---

## 延伸參考

- **01-開發實驗/docs/RunningYourInk.md**：完整 Running Your Ink 文檔（備份）
- **ink-writing** skill：Ink 語法與靈魂食堂慣例
- 線上：https://github.com/inkle/ink/blob/master/Documentation/RunningYourInk.md
