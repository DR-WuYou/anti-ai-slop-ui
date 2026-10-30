# 动效

动效的作用只有三个：**说明因果、确认操作、掩盖等待**。做不到这三点就别动。

## 1. 时长

| 场景 | 时长 |
| --- | --- |
| 悬停/按下反馈 | 80–120ms |
| 展开/收起、淡入 | 150–200ms |
| 弹层进出 | 180–240ms |
| 页面转场 | 240–320ms |

超过 400ms 的动效必须有充分理由（例如物理拖拽松手后的惯性）。

## 2. 曲线

```css
:root {
  --ease-out: cubic-bezier(0.2, 0, 0, 1);     /* 进入 */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);      /* 退出 */
  --ease-spring: cubic-bezier(0.34, 1.36, 0.64, 1); /* 少量回弹 */
}
```

- 进入用 ease-out（快起慢收），退出用 ease-in。
- 不要用 `ease`、`linear` 做 UI 过渡——前者太软，后者机械。
- 回弹只用于"可以被扔出去"的东西（抽屉、卡片拖拽），别给按钮。

## 3. 只动这两个属性

```css
.btn {
  transition: background-color 120ms var(--ease-out),
              color 120ms var(--ease-out),
              transform 120ms var(--ease-out);
}
.btn:hover { background-color: var(--gray-2); }
.btn:active { transform: translateY(0.5px); }
```

禁止 `transition: all`。`width`、`height`、`top`、`left`、`box-shadow` 会触发重排/重绘，大列表里必然掉帧。需要尺寸变化用 `transform: scale` 或 `clip-path`。

## 4. 交互反馈

- hover：改背景或边框，位移 ≤ 2px。
- focus-visible：2px 描边 + 2px 偏移，必须可见（不要 `outline: none` 了事）。
- active：下沉 0.5–1px 或降 4% 亮度。
- 禁用：降对比到 40–50%，但不隐藏，光标 `not-allowed`。

```css
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

## 5. 加载与等待

- < 300ms：什么都不做，别闪 loading。
- 300ms–2s：骨架屏，尺寸与真实内容一致，避免跳动。
- > 2s：进度 + 可取消。
- 转圈是最后手段；文字"正在生成预览…"比转圈更有预期。

## 6. 减少动效

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
