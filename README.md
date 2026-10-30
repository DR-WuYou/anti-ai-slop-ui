# 去 AI 味 UI（anti-ai-slop-ui）

一个给 AI 编程代理用的技能包：**让 vibe 出来的界面不再一眼假**。

它不是新皮肤，是一套减法规则——圆角有级数、字号有阶梯、颜色有主次、留白有节奏、文案有主语。装进 Claude Code / Codex / Cursor / DeepSeek Harness，AI 写界面时会先定 token 再写组件，写完自己跑体检。

## 效果

| 改造前（AI 默认值） | 改造后（同一份内容） |
| --- | --- |
| ![before](docs/screenshots/before.png) | ![after](docs/screenshots/after.png) |

同一段文案、同样没有设计稿，差别全在默认值：`demo/before.html` 得分 41，`demo/after.html` 得分 100。

```bash
node scripts/audit.mjs demo/before.html
node scripts/audit.mjs demo/after.html
```

## 装法

**Claude Code / 通用 Agent Skills**

```bash
git clone https://github.com/DR-WuYou/anti-ai-slop-ui.git ~/.claude/skills/anti-ai-slop-ui
```

**DeepSeek Harness**

```powershell
git clone https://github.com/DR-WuYou/anti-ai-slop-ui.git E:\DeepSeek-Harness\shared\custom-skills\anti-ai-slop-ui
# 再把该目录联结进 E:\DeepSeek-Harness\data\skills
```

**Codex / Cursor / 其它**：把 `SKILL.md` 放进项目的 `AGENTS.md` 引用链，或直接把 `SKILL.md` 内容追加到项目的 agent 指令里。

## 怎么用

- **新建界面**：“用 anti-ai-slop-ui 的规则，先给 token 再写页面，写完跑 `scripts/audit.mjs`。”
- **改造旧界面**：“按 R1–R10 体检这个页面，列出改前改后，别重写结构。”
- **评审截图**：“挑出 5 个最像 AI 的地方，每条给出具体数值改法。”

## 里面有什么

```
anti-ai-slop-ui/
├── SKILL.md                  # 入口：三件事、七步流程、十条硬规则
├── references/
│   ├── tells.md              # AI 味症状表：骨架/皮肤/文案/动效
│   ├── geometry.md           # 圆角嵌套公式、超椭圆、hairline、栅格
│   ├── typography.md         # 字号阶梯、中文栈、标点与数字
│   ├── color.md              # 灰阶 + Radix 12 阶 + 对比度 + 暗色
│   ├── layout.md             # 间距节奏、分组、密度、断点
│   ├── motion.md             # 时长曲线、反馈、reduce motion
│   ├── components.md         # 组件库/图标/字体工具选型
│   ├── prompts.md            # 30 条复制即用的指令
│   ├── audit.md              # 100 分打分卡
│   └── sources.md            # 出处与致谢
├── scripts/audit.mjs         # 零依赖体检脚本（Node ≥18）
└── demo/                     # before / after 对照 + 设计 token
```

## 十条硬规则（摘要）

| # | 规则 |
| --- | --- |
| R1 | 圆角只用 3–4 档 |
| R2 | 内圆角 = 外圆角 − 内边距 |
| R3 | 细分隔线用 0.5px 或半透明 1px |
| R4 | 字号 ≤4 级，比例 1.2–1.33 |
| R5 | 底色只有黑白灰，颜色给内容 |
| R6 | 间距走 4/8 栅格 |
| R7 | 中文排版西文在前、中文在后、兜底 sans-serif |
| R8 | 层级只用一个信号 |
| R9 | 动效 120–240ms，只动 transform/opacity |
| R10 | 一个界面一种图标语言 |

## 体检脚本

```bash
node scripts/audit.mjs .                    # 扫当前目录
node scripts/audit.mjs src --json           # 机器可读
node scripts/audit.mjs . --fail-under 85    # CI 用，低于阈值退出码 1
```

抓 12 类可量化表症：禁用字体、紫渐变、全大写眉标、字号/圆角档位过多、1px 描边泛滥、emoji 图标、blur 滥用、`transition: all`、纯黑阴影、渐变色文字、色板失控。零依赖，只读不写。

## 出处

规则整理自 [@bruc3van 的这条推文](https://x.com/bruc3van/status/2115963644811116732) 引用的 8 位中文设计师，以及各自长期拆解 AI 界面的公开内容：

- @Kubai087 枯白啃设计 — 圆角嵌套、superellipse、900+ 条可直接对 AI 说的技巧
- @ZaynHao — 让 AI 界面精致的 10 句提示词（0.5px 边框、≤4 字号、Radix Colors）
- @ianneo_ai 伊恩 — 界面显廉价多半是颜色给多了
- @dingyi — AI slop 特征清单（滥用字体、紫渐变、全大写小标题、1px 粗边）
- @Xian0063 弦 — 从上万张稿里总结的 8 条审美原则
- @yanliudreamer — 10 个常用 UI 组件与工具库
- @ricouii — 中文网页排版与 font-family 顺序
- @remixdesigner — 图标与交互细节（Remix Icon 作者）

## License

MIT。规则可以抄，品味要自己练。
