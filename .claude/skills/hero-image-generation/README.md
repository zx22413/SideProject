# Hero Image Generation - Quick Reference

> 靈魂食堂 Hero 圖生成快速參考

## 風格：Hollow Knight / Alto's Odyssey

| 特徵 | 說明 |
|------|------|
| 造型 | 幾何簡化、稜角剪影 |
| 色彩 | 低飽和、高對比 |
| 光影 | 暖光 vs 冷影 |
| 五官 | 輪廓或色塊 |

---

## 提示詞模板

```
Flat digital illustration, Hollow Knight / Alto's Odyssey aesthetic.
[描述：聚焦一個視覺元素]
Composition: Simple and bold, clear focal point, minimal background.
Style: Geometric shapes, angular silhouettes, flat color blocks.
Colors: Dark desaturated - deep purple, muted blue, warm amber.
Lighting: HIGH CONTRAST - warm light vs cold shadows.
Characters: Simplified facial features as outlines only.
No gradients, minimal details. Aspect ratio 3:2.
```

---

## 檔名格式

```
[day]_[phase]_[scene].png
```

範例：
- `opening_black_cat_hero.png`
- `day1_memory_attic_tea.png`

---

## 程式碼整合

```javascript
{
  type: "image",
  url: "https://media.githubusercontent.com/media/zx22413/SideProject/refs/heads/main/04-%E8%B3%87%E6%BA%90%E7%B4%A0%E6%9D%90/%E5%9C%96%E7%89%87/%E9%81%8A%E6%88%B2%E7%B4%A0%E6%9D%90/[filename].png",
  size: "full",
  aspectRatio: "3:2",
  aspectMode: "cover"
}
```

---

## 色彩調色盤

| Token | Hex | 用途 |
|-------|-----|------|
| taisho_midnight | `#1a1a2e` | 深紫夜空 |
| taisho_mist | `#16213e` | 暗藍霧氣 |
| taisho_lamplight | `#e09f3e` | 暖橙窗光 |

---

## 完整規範

詳見 [SKILL.md](./SKILL.md)
