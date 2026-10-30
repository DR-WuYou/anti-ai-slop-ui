# 字体与排版

## 1. 字号阶梯

先定基准（正文 14 或 16），再按 1.2–1.33 比例上台阶。全站 ≤4 级。

```css
:root {
  --text-xs: 12px;   /* 辅助、表格头 */
  --text-sm: 14px;   /* 正文（中文最小可用 13，12 只用于非中文） */
  --text-lg: 20px;   /* 小标题、卡片标题 */
  --text-3xl: 32px;  /* 页面标题 */
}
```

比例表（以 14 为基准）：

| 比例 | 序列 | 适合 |
| --- | --- | --- |
| 1.2 | 14 / 17 / 20 / 24 / 29 | 信息密集的产品界面 |
| 1.25 | 14 / 18 / 22 / 28 / 35 | 通用 |
| 1.333 | 14 / 19 / 25 / 33 / 44 | 内容站、宣传页 |

**用字重和颜色分级，别用字号分级**。正文 16 加 500 字重、次级 16 加 60% 灰，比 14 号字更稳。

## 2. 行高与行宽

- 中文正文行高 1.6–1.75；英文 1.5–1.6；标题 1.2–1.3。
- 行宽 60–75 字符（中文 30–40 字），超过 80 字符眼睛回行会丢行。
- 段落之间用 `margin`，不要用空行；段前段后只取一个方向。

```css
.prose { font-size: 16px; line-height: 1.7; max-width: 68ch; text-wrap: pretty; }
h1, h2 { line-height: 1.25; text-wrap: balance; letter-spacing: -0.01em; }
```

## 3. 中文站点的字体栈

核心顺序：**西文在前 → 中文在后 → 通用兜底**。因为中文字体自带的西文字形往往又宽又淡。

```css
:root {
  --font-sans:
    ui-sans-serif, -apple-system, "Segoe UI", "Helvetica Neue",
    "PingFang SC", "HarmonyOS Sans SC", "Source Han Sans SC", "Noto Sans SC",
    "Microsoft YaHei", sans-serif;
  --font-mono:
    ui-monospace, "SFMono-Regular", "JetBrains Mono", "Cascadia Code",
    "Menlo", "Consolas", "Noto Sans Mono CJK SC", monospace;
}
```

要点：

- 不要只写 `Arial`、`sans-serif` 或 `"Microsoft YaHei"` 一个值——三端字形会完全不一样。
- macOS 的 `PingFang SC`、Windows 的 `Microsoft YaHei`、Android 的 `Noto Sans SC` 都要覆盖。
- 品牌字体（如思源黑体、MiSans、HarmonyOS Sans）可以用 `@font-face` 只加载需要的字重，别整包 8 个字重。
- 英文名与品牌名放在中文里时，让西文字体接管，别手动加空格去凑视觉（用 `.latin` 包一层或直接依赖字体栈）。

## 4. 中文字距与标点

- 中文字距保持 0；只有全大写英文小标签才加 `letter-spacing: .04em`（而且这种标签本身就该少用）。
- 中文用全角标点：「」，。；：？！——不要混用英文逗号。
- 省略号用 `……`，破折号用 `——`。
- 数字与中文之间不强行加空格；数字与单位之间加不换行空格（`120&nbsp;ms`）。
- 行首禁则：标点不出现在行首。用 `text-spacing-trim`（新特性）或手动 `&` 处理，别用 `white-space: nowrap` 整段禁换行。

## 5. 数字与表格

```css
.tabular { font-variant-numeric: tabular-nums; }
```

- 表格、金额、时间列必须等宽数字，否则列会跳。
- 大数字用 `clamp()` 做响应式，而不是三套媒体查询：`font-size: clamp(28px, 4vw, 44px)`。
- 小数点对齐，千分位统一；单位（元 / ms / GB）字号降一级并降低对比。

## 6. 不要做的事

- 全大写小标题（尤其是英文 `FEATURES` / `HOW IT WORKS`）。
- 标题里挑一个词换颜色或加粗当强调。
- 用 `text-align: justify` 排中文（会产生大河）。
- 字号超过 5 级、字重超过 3 种。
- 给正文用 `font-weight: 300`（小字号下发虚）。
