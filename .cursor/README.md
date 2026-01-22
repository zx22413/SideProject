# Cursor AI 配置說明

本目錄包含 Cursor AI 的專案級配置。

## 📂 目錄結構

```
.cursor/
├── PROJECT_ARCHITECTURE.md   # 專案架構總覽（含 AI 配置指南）
├── install-skills.ps1         # Skills 安裝腳本
├── rules/                     # AI 行為規則（待建立）
└── skills/                    # Agent Skills（不推送至 Git）
    └── obsidian-skills/       # Obsidian 專用 Skills
```

## 🚀 快速開始

### 首次設定（新電腦/新協作者）

1. **Clone 專案**
   ```bash
   git clone <your-repo-url>
   cd SideProject
   ```

2. **安裝 Skills**（擇一）
   
   **方法 1：使用安裝腳本（推薦）**
   ```powershell
   .\.cursor\install-skills.ps1
   ```
   
   **方法 2：手動安裝**
   ```bash
   cd .cursor/skills
   git clone https://github.com/kepano/obsidian-skills.git obsidian-skills
   cd ../..
   ```

3. **開啟 Cursor**
   - Skills 會自動載入
   - 可以開始使用 Obsidian 相關功能

## 🔄 更新 Skills

```bash
cd .cursor/skills/obsidian-skills
git pull origin main
```

## 📚 已安裝的 Skills

### Obsidian Skills
- **來源**：[kepano/obsidian-skills](https://github.com/kepano/obsidian-skills)
- **功能**：
  - `obsidian-markdown`：處理 Obsidian Flavored Markdown
  - `obsidian-bases`：處理 `.base` 檔案
  - `json-canvas`：處理 `.canvas` 檔案
- **用途**：確保 AI 正確處理 Obsidian 的雙向連結 `[[連結]]` 格式

## 📝 待開發的自訂 Skills

請參考 [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md) 中的「建議開發的自訂 Skills」章節：

1. `daily-journal-sync` - 工作日記同步（優先級 P0）
2. `archive-detector` - 自動檢測可歸檔文件（優先級 P1）
3. `project-cleanup` - 專案清理（優先級 P2）
4. `obsidian-link-validator` - 連結驗證（優先級 P2）

## 🔗 相關資源

- [專案架構總覽](PROJECT_ARCHITECTURE.md)
- [Agent Skills 規範](https://agentskills.io/specification)
- [Obsidian Skills 文檔](https://github.com/kepano/obsidian-skills)

## ⚠️ 注意事項

- `.cursor/skills/` 目錄已加入 `.gitignore`，不會推送至 Git
- 每台新電腦都需要重新安裝 Skills
- Skills 是外部依賴，可獨立更新

## 🆘 問題排查

**Q: Cursor 沒有載入 Skills？**
- 檢查 `.cursor/skills/obsidian-skills/` 是否存在
- 重啟 Cursor
- 檢查 Skills 格式是否正確

**Q: 如何確認 Skills 已載入？**
- 編輯 Markdown 檔案時，AI 會自動使用 Obsidian 格式
- 可以在 Cursor 設定中查看已載入的 Skills

**Q: 需要手動啟用 Skills 嗎？**
- 不需要，Cursor 會自動載入 `.cursor/skills/` 下的所有 Skills
