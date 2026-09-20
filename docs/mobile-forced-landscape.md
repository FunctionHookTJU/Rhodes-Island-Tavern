# 移动端强制横屏说明

## 方案变更

上一版做过「移动端竖屏适配」（320–480px 单列流式布局），**已废弃并移除**，改为**强制横屏**：
触屏设备竖屏时不再重排布局，直接遮罩提示横置设备，横过来即进入游戏。

保留下来的是那次改动中与方向无关的部分（见文末「沿用的修复」）。

## 改动文件清单

| 文件 | 改动 |
|---|---|
| `index.html` | 唯一改动文件。4 处：① viewport meta 加 `viewport-fit=cover`；② 新增强制横屏遮罩块；③ `setView` 恢复为改动前逻辑；④ 玩法说明文案 |
| `docs/mobile-forced-landscape.md` | 本文件。同时删除了已废弃的 `mobile-portrait-adaptation.md` |

相对 `HEAD` 共 **+35 / −3 行**。

## 实现

```css
@media (orientation:portrait) and (max-width:900px) and (hover:none) and (pointer:coarse){
  html,body{overflow:hidden;height:100%}
  html::before{
    content:"⟳\A 请将设备横置\A 以横屏进入游戏";
    position:fixed; inset:0; z-index:60000;
    display:grid; place-content:center;
    /* 深色径向底 + 酸橙绿文字，与游戏配色一致 */
  }
}
```

四个条件各司其职：

| 条件 | 作用 |
|---|---|
| `orientation:portrait` | 只在竖屏生效；设备一转横，遮罩立即消失 |
| `max-width:900px` | 覆盖手机竖屏与小尺寸平板；避免大屏设备被误判 |
| `hover:none` | **排除桌面鼠标环境** —— 桌面即使窗口又窄又高也不命中 |
| `pointer:coarse` | 进一步限定为手指触摸这类粗糙指针 |

> 用 `html::before` 而非 `body::before`，因为 `body::before` 已被暗角装饰层占用
> （见 `body::before{content:"";position:fixed;inset:0;...}` 与 700px 断点里的 `display:none`）。

`overflow:hidden` 在竖屏时锁住滚动，避免遮罩下层页面仍在滚动。z-index 取 60000，
高于项目内最高的 `.scene-curtain`（50000）。

### JS 侧

`setView()` 恢复为改动前的实现，并在末尾保留一次 `setView('landscape')` 初始化调用
（其中包含 `updateHud()`，不能省略）。页头「横屏 / 竖屏」按钮仍在，仅供桌面端使用；
移动端该按钮本就隐藏，竖屏时由遮罩接管。

## 关键断点汇总

| 媒体查询 | 来源 | 说明 |
|---|---|---|
| `(orientation:portrait) and (max-width:900px) and (hover:none) and (pointer:coarse)` | **本次新增** | 强制横屏遮罩 |
| `@media (hover:none)` | 上次新增，保留 | 触屏去 hover 粘滞 |
| `@media(max-width:700px)` | 原有 | 移动端紧凑布局（底部多级菜单、点按部署） |
| `@media(max-width:900px)` | 原有 | 中等屏幕卡片尺寸 |
| `@media(max-width:480px)` | **无** | 竖屏断点已随竖屏方案一并移除 |

## 验证结果（Chrome 无头实测）

无头模式下用 `--blink-settings=primaryHoverType=1,availableHoverTypes=1,primaryPointerType=2,availablePointerTypes=2`
可让 `hover:none` / `pointer:coarse` 生效，从而精确模拟触屏设备。

**① 遮罩命中条件**

| 场景 | 视口 | 条件命中 | 遮罩 |
|---|---|---|---|
| 触屏 · 竖屏 | 375×812 | ✅ true | 显示（z-index 60000） |
| 触屏 · 竖屏 | 320×568 | ✅ true | 显示 |
| 触屏 · 横屏 | 812×375 | ❌ false | 无，正常游戏界面 |
| 触屏 · 横屏 | 1440×900 | ❌ false | 无 |
| **桌面鼠标 · 竖长窗口** | **375×812** | ❌ **false** | **无**（关键：桌面不误伤） |

**② 桌面布局零影响**
逐项 computed-style 对比「改后 vs `git show HEAD:index.html`」，覆盖 `body` 内边距、
`html/body` overflow、`header/main/panel` 内边距与列数、`.board`、`.card`、`.stats`、
`.mobile-nav`、`.controls .btn`、`.start-box`、`.codex-grid` 等 17 组属性与实测矩形：

| 视口 | 结果 |
|---|---|
| 1440×900 | ✓ 与改动前完全一致 |
| 1024×768 | ✓ 与改动前完全一致 |
| 820×1180（竖屏平板，鼠标环境） | ✓ 与改动前完全一致 |
| 600×900（窄窗口） | ✓ 与改动前完全一致 |

## 如何在真机验证

1. `python server.py`，手机连同一局域网访问 `http://<本机IP>:11451`。
2. 竖着拿：应看到深色遮罩 +「请将设备横置 / 以横屏进入游戏」。
3. 横过来：遮罩消失，直接进入横屏游戏界面（启动页 → 开始游戏 → 底部菜单）。
4. 若用桌面浏览器验证：Chrome DevTools 打开设备模拟（Device Toolbar）并选中任一手机机型，
   模拟环境会自动带上触摸特性，遮罩即会出现；切到横屏方向遮罩消失。

## 已知限制

- 竖屏时游戏仍在后台运行（回合倒计时继续）。如果希望竖屏时暂停，需要额外的 JS 支持，
  目前未做——正常使用下用户会立刻横过来。
- 不涉及 `screen.orientation.lock()` 方向锁定。该 API 要求在全屏状态下由用户手势触发，
  且 iOS Safari 不支持，做成"兜底提示"更稳。如需接入可以再加。
- 触屏笔记本（同时有鼠标与触摸屏）判定为 `hover:hover`，不会出现遮罩，按横屏正常使用。

## 沿用的修复（与方向无关，来自上一轮）

- `viewport` 加 `viewport-fit=cover`；`env(safe-area-inset-*)` 已在底栏、浮层、结算层
  等处保留（横屏刘海屏同样需要）。
- 启动页副标题（`h1::after`）的 `letter-spacing` 收紧与断行 —— 原 `.34em` × 31 字符会把
  `.start-box` 撑出屏幕。
- 底栏子菜单由「`left:50% + translateX(-50%)` 气泡」改为贴底面板 —— 原实现会被父级
  `riseIn` 动画的 `to{transform:none}` 覆盖居中，且在窄屏下溢出。
- `@media (hover:none)` 下去掉 hover 位移/变色，避免悬停态粘在手指下。
