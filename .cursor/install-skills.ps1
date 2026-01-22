# Cursor Skills 安裝腳本
# 用途：在新環境中快速安裝所有必要的 Skills

Write-Host "🚀 開始安裝 Cursor Skills..." -ForegroundColor Cyan

# 檢查 .cursor/skills 目錄是否存在
if (-not (Test-Path ".cursor/skills")) {
    New-Item -ItemType Directory -Path ".cursor/skills" -Force | Out-Null
    Write-Host "✅ 建立 .cursor/skills 目錄" -ForegroundColor Green
}

# 安裝 Obsidian Skills
$obsidianSkillsPath = ".cursor/skills/obsidian-skills"
if (Test-Path $obsidianSkillsPath) {
    Write-Host "⚠️  Obsidian Skills 已存在，跳過安裝" -ForegroundColor Yellow
    Write-Host "   如需更新，請執行：cd $obsidianSkillsPath && git pull" -ForegroundColor Yellow
} else {
    Write-Host "📦 正在安裝 Obsidian Skills..." -ForegroundColor Cyan
    Set-Location ".cursor/skills"
    git clone https://github.com/kepano/obsidian-skills.git obsidian-skills
    Set-Location "../.."
    Write-Host "✅ Obsidian Skills 安裝完成" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 所有 Skills 安裝完成！" -ForegroundColor Green
Write-Host ""
Write-Host "已安裝的 Skills：" -ForegroundColor Cyan
Write-Host "  - Obsidian Skills (obsidian-markdown, obsidian-bases, json-canvas)" -ForegroundColor White
Write-Host ""
Write-Host "下一步：開啟 Cursor，Skills 將自動載入" -ForegroundColor Yellow
