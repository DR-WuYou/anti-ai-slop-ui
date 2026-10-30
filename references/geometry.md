# 几何：圆角、描边、阴影、间距

## 1. 圆角级数

只允许 3–4 档，写进 token：

```css
:root {
  --r-sm: 6px;    /* 输入框、小按钮、标签 */
  --r-md: 10px;   /* 卡片、面板 */
  --r-lg: 16px;   /* 大容器、弹层 */
  --r-full: 999px;/* 只给真正的圆形/胶囊 */
}
```

判断标准：**容器越大圆角越大**，但档位不增加。出现 8/10/12/14/16 五个值，说明每处都在用默认值。

## 2. 嵌套圆角公式

内层圆角必须退让，否则内外弧线不同心，视觉上"角里塞了个方块"。

```
inner = max(0, outer − padding)
```

```css
.card {
  --r: var(--r-md);       /* 10px */
  --pad: 12px;
  border-radius: var(--r);
  padding: var(--pad);
}
.card .inner {
  border-radius: max(0px, calc(var(--r) - var(--pad)));  /* 10 − 12 → 0 */
}
```

| 外圆角 | 内边距 | 内圆角 |
| --- | --- | --- |
| 16 | 4 | 12 |
| 16 | 8 | 8 |
| 16 | 12 | 4 |
| 16 | 16+ | 0 |
| 12 | 8 | 4 |
| 24 | 16 | 8 |

经验值：内边距 ≥ 外圆角时，内层直接 0，用直角反而更干净。图片在卡片里满贴边（padding 0）时，图与卡同圆角，但只在贴边的那几个角。

## 3. 超椭圆（squircle）

iOS 图标的连续曲率不是圆弧。要做同款：

**方案 A｜CSS 渐进增强**：部分 Chromium 版本提供 `corner-shape: squircle`，用 `@supports` 包住，不支持就回退普通圆角：

```css
.icon {
  border-radius: 22.37%;               /* iOS 图标比例 */
  corner-shape: squircle;              /* 不支持的浏览器忽略这一行 */
}
```

**方案 B｜采样路径**（兼容性最好）：超椭圆 `|x/a|^n + |y/b|^n = 1`，n≈5 接近 iOS：

```js
function squirclePath(size, n = 5, steps = 64) {
  const a = size / 2, pts = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t), s = Math.sin(t);
    const x = a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const y = a * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    pts.push([a + x, a + y]);
  }
  return 'M' + pts.map(p => p.map(v => v.toFixed(2)).join(' ')).join('L') + 'Z';
}
```

```css
.squircle { clip-path: path("..."); }   /* 把 squirclePath(48) 的 d 填进来 */
```

代价：`clip-path` 会裁掉外部阴影和对角描边。只在图标、头像这类小元素上用；大容器用普通圆角。

## 4. 描边：hairline

1px 在 DPR=2 上渲染成 2 物理像素，比设计稿"粗一倍"。

```css
/* 推荐：半透明内阴影，永远 1 物理像素 */
.hairline { box-shadow: inset 0 0 0 0.5px rgb(0 0 0 / 0.12); }

/* 或直接写 0.5px，多数浏览器会渲染成 1 物理像素 */
.hairline-2 { border: 0.5px solid rgb(0 0 0 / 0.12); }
```

规则：

- 分隔线颜色 ≤ 正文色 12% 不透明度，别用 `#eee` 这种死灰。
- 输入框、卡片、表格线统一用同一档，别有的 1px 有的 2px。
- 描边只表达"可交互边界"，纯静态分区用留白或底色。

## 5. 阴影

原则：**光从上面来，阴影贴着边，颜色带一点底色相**。

```css
:root {
  --shadow-1: 0 1px 2px rgb(16 18 27 / 0.06), 0 1px 1px rgb(16 18 27 / 0.04);
  --shadow-2: 0 4px 12px rgb(16 18 27 / 0.08), 0 1px 3px rgb(16 18 27 / 0.06);
  --shadow-3: 0 16px 40px rgb(16 18 27 / 0.14), 0 2px 8px rgb(16 18 27 / 0.06);
}
```

- 不要 `rgba(0,0,0,.1)` 单层大扩散——那是塑料感来源。
- 层级越高，扩散越大、透明度越高；同一层级只有一套阴影。
- 卡片默认可以没有阴影，只有浮层（popover/modal）需要。

## 6. 间距节奏

4 的倍数做基础，8 的倍数做结构：

```css
:root {
  --s-1: 4px;  --s-2: 8px;   --s-3: 12px; --s-4: 16px;
  --s-6: 24px; --s-8: 32px;  --s-12: 48px; --s-16: 64px;
}
```

三条硬约束：

1. 组件内边距 8–16；组件之间 16–24；区块之间 48–96。
2. 区块间距 ≥ 组件内间距 × 3，否则分组失效。
3. 页边距桌面 24–32，移动 16–20；内容最大宽度 1120–1280，正文 640–760。

## 7. 栅格与对齐

- 桌面 12 列，平板 8 列，移动 4 列；列间距 24 / 16。
- 所有文字左边缘对齐到同一条线；数字右对齐或等宽对齐（`font-variant-numeric: tabular-nums`）。
- 图标与文字基线对齐，别用 `vertical-align: middle` 硬凑；用 flex + `align-items: center` 并给图标一个固定盒。
- 圆形按钮/头像只有真圆才用 `50%`，其它一律走圆角级数。
