# 选库：让 AI 从高处起跳

不要从 `<div>` 开始搭组件。选一套有既定品味和可访问性的底座，AI 的默认值就自动变好。

## 组件与样式

| 库 | 用途 | 备注 |
| --- | --- | --- |
| Radix UI Primitives | 无样式 + 完整无障碍的交互原语 | 弹层、下拉、Tabs 的行为全对，皮肤自己写 |
| shadcn/ui | Radix + Tailwind 的复制即用组件 | 组件是源码，改样式不被库绑架 |
| Tailwind CSS | 原子类 | 配 `@theme` 定 token，避免散落魔法值 |
| Base UI | Radix 团队的下一代原语 | 需要新 API 时看 |
| Park UI / Ark UI | 有设计语言的组件集 | 想省设计决策时用 |

**别做**：同时上两套组件库；把 Ant Design 默认皮肤直接上线；用 `styled-components` 在每个文件里写不同圆角。

## 图标

| 库 | 风格 |
| --- | --- |
| Lucide | 1.5–2px 线性，最通用 |
| Remix Icon | 线性 + 填充双套，中文产品常用 |
| Phosphor | 六种字重，风格选择多 |
| Heroicons | 与 Tailwind 同源，20/24 两档 |

规则：一个项目一套；尺寸只用 16 / 20 / 24；描边宽度统一；图标不参与文字流（`aria-hidden`），有语义就配文本。

## 颜色

- **Radix Colors**：12 阶语义化色板，暗色成对提供，直接按角色取阶（见 color.md）。
- **Tailwind 调色板**：方便，但容易越用越多；只用其中 2–3 个色系。
- 自建：一个中性 12 阶 + 一个品牌色 9 阶，够用三年。

## 字体

| 场景 | 建议 |
| --- | --- |
| 通用 UI | 系统栈（见 typography.md），零加载成本 |
| 中文品牌 | 思源黑体 / MiSans / HarmonyOS Sans SC（按需子集化） |
| 等宽 | JetBrains Mono、Cascadia Code、SF Mono |
| 展示标题 | 一款有性格的衬线（思源宋体、霞鹜文楷），只用于标题 |

避免：Inter / Poppins / Montserrat 作为"默认现代感"——它们已经是"我让 AI 写的"签名。

## 工具

- **Figma**：搭 token 与组件，导出 CSS 变量。
- **squircle / superellipse 插件**：做 iOS 那种连续圆角图标。
- **Radix Themes / Open Props**：现成的 token 集，抄数值也行。
- **PageSpeed / axe DevTools**：对比度与无障碍检查。
- **本项目 `scripts/audit.mjs`**：静态扫 AI 味表症。

## 起手模板（30 秒）

```css
:root {
  --r-sm: 6px; --r-md: 10px; --r-lg: 16px; --r-full: 999px;
  --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-6: 24px; --s-8: 32px; --s-12: 48px;
  --text-sm: 14px; --text-base: 16px; --text-lg: 20px; --text-2xl: 32px;
  --gray-2: #f5f6f7; --gray-4: #e2e4e8; --gray-8: #6b717b; --gray-10: #2c3037; --gray-11: #16181c;
  --accent: #3b5bdb;
  --ease-out: cubic-bezier(0.2, 0, 0, 1);
}
```

完整可用的 token 文件见 `demo/tokens.css`。
