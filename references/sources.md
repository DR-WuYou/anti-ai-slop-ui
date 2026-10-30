# 出处与致谢

本仓库的规则是从一批中文设计师长期拆解"AI 界面哪里露馅"的公开内容里归纳出来的，不是某一篇文章的转述。数值和判据经过本地实测与互相校验，冲突时取更可执行的那个。

## 起点

- 推文：[bruc3van · vibe 出来的界面一眼廉价，往往输在细节上](https://x.com/bruc3van/status/2115963644811116732)（2026-10-30）

> 原文里的 8 条 `t.co` 短链已失效，跳转只到作者主页（`x.com/<user>/status` 缺 id），因此无法逐条回到原帖。下面按作者记录各自贡献的方向；具体条目由本仓库重新表述并补全为可执行规则。

## 8 位设计师与各自的贡献

| 作者 | 定位 | 被吸收进本仓库的部分 |
| --- | --- | --- |
| [@Kubai087](https://x.com/Kubai087) 枯白啃设计 | App 图标设计师，《999 个小技巧》日更，每条附可直接对 AI 说的 prompt | 圆角嵌套公式（R2）、超椭圆 squircle（geometry.md §3）、prompt 写法 |
| [@ZaynHao](https://x.com/ZaynHao) | 设计工程师，拆 Codex / Claude 客户端界面 | 0.5px 边框（R3）、字号 ≤4 种（R4）、Radix Colors（color.md §3） |
| [@ianneo_ai](https://x.com/ianneo_ai) 伊恩 | 每日点评一个好界面，给一句"能直接对 AI 说的话" | 颜色给多了就显廉价（R5）、颜色只留给内容 |
| [@dingyi](https://x.com/dingyi) | 资深设计师 | AI slop 特征清单：被用烂的三款字体、紫色渐变、全大写小标题、1px 粗边（tells.md §2/§3） |
| [@Xian0063](https://x.com/Xian0063) 弦 | 10 年 UI/UX，审美心得系列 | 从上万张高保真稿归纳的审美原则，落成打分卡（audit.md） |
| [@yanliudreamer](https://x.com/yanliudreamer) | 硅谷 Principal 设计师 | 10 个常用组件与工具库（components.md） |
| [@ricouii](https://x.com/ricouii) | 网页设计师，专讲中文网页排版 | 中文 `font-family` 顺序：西文在前、中文在后、兜底（typography.md §3） |
| [@remixdesigner](https://x.com/remixdesigner) | Remix Icon 作者，拆大厂图标与交互细节 | 一套图标语言、尺寸与描边统一（R10） |

## 独立的公共依据

- WCAG 2.2 对比度与焦点可见性要求（color.md §4、motion.md §4）
- Radix Colors / Radix Primitives 的 12 阶语义分配（color.md §3）
- Apple HIG 的圆角比例与连续曲率（geometry.md §3）
- 中文排版常识：全角标点、行首禁则、汉字不加字距（typography.md §4）

## 立场

规则是下限，不是风格。照着做到 92 分只能保证"不像 AI 一键生成"；要好看，还得自己决定这一页只讲一件事。
