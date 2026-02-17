# LIFF 做飯小遊戲 - 設定指南（歸檔）

> **歸檔說明**：2026-02-17 自 liff-cooking/ 移入歸檔。現行開發以 Ink 為劇情載體。

## 一、LINE Developers Console 設定

建立 LIFF App、Endpoint URL（如 GitHub Pages）、Scope、Bot link feature。記下 LIFF ID。

## 二、部署前端到 GitHub Pages

啟用 Pages、更新 LIFF Endpoint URL。

## 三、GAS 後端 API 設定

doGet()、getCookingStateForLiff()、submitCookingFromLiff()；部署 Web App，更新前端 GAS_API_URL。

## 四、整合到遊戲流程

LIFF_ENABLED、getLiffCookingButton()、處理 LIFF 回傳結果。

完整步驟見版控歷史。
