# 明日方舟主题设计 · 风格提示词速查

> 用途：给本项目（罗德岛酒馆自走棋）做 UI 改版、卡面重绘、底图/装饰素材生成时，直接抄这里的关键词与色值。
> 资料来源：腾讯游戏学堂《明日方舟 UI/UX 分析》、Hypergryph 设计语言拆解、PRTS / Arknights Terra Wiki 主题色、Civitai / TensorArt 官方风格 LoRA 卡、画师风格梳理。

---

## 0. 一句话内核

**工业风废土 × 现代主义平面构成 × 叙事型界面（Narrative UI）**

三个不可拆的特征：

1. **极简扁平 + 高度克制**——没有大渐变、没有拟物、没有多余装饰，所有元素都承担功能。
2. **重工业终端感**——界面不是菜单，是"泰拉世界里真实存在的一台设备"（PRTS 远程接入的设定）。
3. **现代主义平面构成**——包豪斯 / 构成主义 / 瑞士国际主义：非对称构图、几何切割、网格、错位排布、大面积留白。

---

## 1. 色彩系统（可直接抄的 HEX）

### 1.1 底色层（大面积中性色）

| 用途 | 色值 | 说明 |
|---|---|---|
| 页面最深底 | `#141516` | 碳黑，**不要用纯黑 #000** |
| 面板底 | `#1E1F21` | 深灰，主卡片 |
| 次级面板 / 弹窗 | `#3A3D40` | 悬浮层 |
| 分隔线 / 描边 | `#535353` | 1px 细线 |
| 分隔线（强调） | `#FFFFFF` | 极少使用 |

### 1.2 功能色（少量）

| 用途 | 色值 | 出处 |
|---|---|---|
| **酸橙绿**（本项目首推强调色） | `#B7E000` / `#A8E61D` | "酸橙色信笺"——源石、工业能源的意象，降蓝提黄的荧光涂料感 |
| 柠檬黄（终末地主题色） | `#F5D800` / `#FFEE22` | 终末地核心色，暖调、非荧光 |
| 高亮蓝（信息节点 / 链接） | `#22BBFF` | Terra Wiki 主题 accent，冷静的科技蓝 |
| **行动色（确认 / 开始）** | `#C14701` | 项目指定。所有"推进流程"的按钮统一用这个锈橙红，与蓝（选中态）、金（资源）三分 |
| 警示红 | `#FF3030` / `#FF001F` | 错误、红链、危险提示 |
| 提示橙 | `#FFAB5B` | 次级警示 |

### 1.3 文字色

| 层级 | 色值 |
|---|---|
| 主文字 | `#FFFFFF` |
| 次级文字 / 注释 | `#898989` |
| 标签文字 | `#AAAAAA` |
| 占位符 | `#808080` |
| 强调文字（高亮黄） | `#FFEE22` |
| 控件内文字（浅底面板上） | `#333333` |

### 1.4 项目当前配色对照

现有 `index.html` 变量：`--bg:#101722`、`--c:#ffd35a`、`--g:#ffcf58`、`--l:#3a4d65`、`--m:#9db0c9`、`--p:#1d2a3b`、`--t:#eef5ff`

- 已经是方舟路子（深蓝黑底 + 暖黄强调），**整体不用推翻**。
- 建议微调：把 `--bg` 往中性碳灰拉一点（`#141619`），强调色加一档酸橙绿 `#B7E000` 作为"源石/行动点"专用色，黄色 `#FFD35A` 保留给金币与稀有度。

### 1.5 配色纪律

> **大面积中性色 + 少量功能色 + 极少量警示色**

- 暖色只做点缀，绝不铺面。
- 高饱和只出现在"需要你立刻看见的地方"：按钮激活态、源石、稀有度、状态节点。
- 灰阶要分层级（至少 3 档），靠明度差而不是靠加颜色来分层。

---

## 2. 字体系统

| 位置 | 字体 | 气质 |
|---|---|---|
| 中文标题 | **思源宋体 / 方正准雅宋（粗宋）** | 古典骑士 + 工业军工，方舟主界面的"警戒"感 |
| 中文正文 | **思源黑体 Light / Regular** | 中性、耐读 |
| 英文标题 | **Novecento Wide**（全大写） | 线条粗、重量感、现代 |
| 英文副标题（古典章节） | **Trajan** | Old-Style 衬线，庄重 |
| 数字 / 工业标签 | **Bender**（伪等宽） | 基建系统同款，硬核工业风 |
| 参数 / 终端文本 | **JetBrains Mono / Roboto Mono / 任意等宽体** | 机械序列感 |

排版规范：

- **中英混排**：英文做装饰性信息（`OPERATOR // 干员`、`Lv.90`），中文做语义。
- 英文标题**全大写、拉开字距**（letter-spacing 0.1–0.3em）。
- 汉字用等线黑体或方折造型体，笔画粗细一致；数字拉丁字母一律等宽。
- 对齐**刻意不对齐**：错位、偏移式排布产生"参差感"和视觉流动方向。
- 大量留白给细几何线条，这些线不承载信息，只做层级分割。

---

## 3. 几何与构成语言（最重要的辨识度来源）

### 形状

- **斜切角 / 切角矩形**（chamfered corner，通常 8–16px 的 45° 切边）——方舟按钮和面板的标志。
- **矩形切割结构**：大块面被直线不规则切分。
- **三角形 / 六边形符号**（终末地大量使用），源自罗德岛 "Rook（城堡/战车）" 标志的辅助图形延展。
- **括号式角标** `⌐ ¬`、四角准星、十字刻度。
- **数据化辅助线**：1px 细线延伸出画面、标注线、引线编号。

### 质感

- **背景模糊 / 亚克力面板**（Frosted Glass）——覆盖时仍能"窥见"下层页面。
- **噪点 / 颗粒**（grain）、**扫描线**（scanline）、**半调网点**、**马赛克化**。
- **粗细条纹**与**几何切分**——从游戏内延伸到官网、塞壬唱片、泰拉记事社的统一手法。
- **vignette 暗角**：中心亮四周暗，突出卡片主体。
- **前景失焦取镜**（Out of focus foreground framing）做纵深。

### 布局

- 非对称构图，视觉中心不固定在正中。
- 模块两端对齐，而不是左对齐排不满。
- 页面层级用**滑动切换 + 延迟加载**衔接，减少跳转割裂感。

### 动效

- 按钮按下轻微"回弹"，冷却时粒子向内收缩 + 机械蓄能音效。
- 节点渐隐渐现、信息模块平移过渡。
- 主界面可加**陀螺仪/鼠标视差**——PRTS 全息投影的沉浸感来源。

---

## 4. AI 图像生成提示词（英文，可直接用）

### 通用前缀（质量锚）

```
masterpiece, best quality, amazing quality, very aesthetic, high resolution,
ultra-detailed, absurdres, official art
```

### 通用负面提示词

```
lowres, bad anatomy, bad hands, missing fingers, extra digits, extra limbs,
poorly drawn face, poorly drawn hands, blurry, jpeg artifacts,
watermark, signature, username, text, error, cropped, multiple views,
bright pastel candy colors, oversaturated, moe blob, chibi,
swimsuit, nudity, skimpy clothes, glossy plastic skin, 3d render
```

---

### A. 精二立绘风角色（主视觉、干员卡大图）

```
masterpiece, best quality, ultra-detailed, absurdres, official art,
arknights (game), ArknightsGame, arkbg,
1girl, solo, full body, standing, dynamic pose,
mature anime character, practical industrial uniform, long trench coat,
tactical harness, buckles, straps, utility pockets, combat boots, gloves,
animal ears, heterochromia, tired resolute expression,
muted desaturated palette, cold grey-blue and charcoal tones,
single high-saturation accent color (acid green or crimson),
dramatic low-key lighting, strong rim light, white outline glow around silhouette,
heavy contrast, semi-thick painterly shading (伪厚涂), visible brush strokes,
grain texture, dust particles, volumetric light,
dark industrial wasteland backdrop, rusted steel structures, ruins, ruins of a mobile city,
glowing hexagonal fragments floating, lens flare
```

> 参数：Illustrious / SDXL 系底模，CFG 5–7，Steps 28–35，尺寸 896×1280 或 768×1152。
> 若用 TensorArt 的 `[Style] Arknights Game Style` LoCON，权重 0.6–0.8，触发词 `ArknightsGame, arkbg`。

### B. 精英一立绘 / 干净卡面（去背景、好抠图）

```
masterpiece, best quality, official art, arknights (game),
ArkElite1, 1girl, solo, full body, standing, neutral pose,
simple background, two-tone background, white background,
flat colors, clean line art, character design sheet, arknights-inspired clothing
```

> 这套最适合做**卡面主体**：背景干净、姿态稳定、方便批量排版。

### C. Q 版棋子小人（自走棋棋盘上的单位）

```
arkblock, chibi, full body, two-tone background, white background,
1girl, solo, animal ears, arknights-inspired clothing,
flat color, cel-shaded, thick outline, cute, standing, simple
```

> 变体：半身头像用 `arkbox, chibi, simple background, upper body`。
> 棋盘小人建议 1:1（512×512 或 768×768），权重 0.6–0.8。

### D. UI 底图 / 终端界面（本项目最常用，做网页背景与分隔层）

```
arkbg, no humans, arknights ui background, dark industrial terminal interface,
sci-fi HUD, tactical control panel, blueprint grid, orthographic engineering drawing,
rectangular cut panels, chamfered corners, 45-degree beveled edges,
thin data auxiliary lines, crosshair marks, tick marks, scale ruler,
monospace code fragments, parameter readouts, geometric HUD frames,
hexagon and triangle motifs, deep charcoal background (#141516),
acid green (#B7E000) and amber (#F5D800) accent nodes,
frosted glass layers, vignette, film grain, subtle scanlines,
high tech, clean, minimal, no characters, 16:9 wide, wallpaper
```

> 生图时**务必加 `no humans`**，否则会冒出人。
> 用途：棋盘底、备战区底、加载页、模块分隔带。

### E. 罗德岛酒馆场景（本项目主题底图）

```
dim industrial bar interior inside a mobile city, arknights style,
dark metal walls, exposed pipes and conduits, riveted steel panels,
long wooden counter, warm amber pendant lights, glassware and bottles on shelves,
holographic PRTS terminal glowing on the wall, floating chamfered UI panels,
acid green display glow, low saturation, muted palette, deep shadows,
cinematic wide shot, volumetric haze, dust motes in light beams,
painterly semi-realistic anime background, no characters, highly detailed
```

### F. UI 图标 / 徽章元素（切图用）

```
arknights style game ui icon, flat vector, geometric,
rook chess piece motif, chamfered square frame, thin white outline,
dark grey fill, single accent color (acid green), minimal, centered,
clean edges, white background, asset sheet
```

> 生成后去背，统一成深色描边 + 单一强调色的线性图标，成体系才像方舟。

---

## 5. 中文"风格描述词"（给设计师 / 给 AI 写 CSS 用）

写需求或让 AI 改界面时，贴这段比贴一堆形容词有效：

> 深色工业终端风格的界面设计。碳黑（#141516）打底，深灰面板（#1E1F21），1px 灰色描边（#535353）。所有按钮和卡片采用 45° 斜切角矩形，无圆角或极小圆角，无渐变、无投影堆叠。强调色只用酸橙绿（#B7E000）和暖黄（#F5D800），出现在激活态、稀有度、数值高亮上，不铺面。标题用粗宋体中文配全大写英文（Novecento Wide 风格），数字与标签用等宽字体（Bender 风格）。背景有极淡的网格、噪点和扫描线。布局非对称，模块错位偏移，留白处放细辅助线、四角准星和编号。文字中英混排，英文为装饰性小字。整体气质：克制、冷硬、精密、军事终端感。

---

## 6. 避坑清单

| 不要 | 原因 |
|---|---|
| 高饱和糖果色 / 彩虹渐变按钮 | 直接破坏"硬核性冷淡"基调，瞬间变廉价 |
| 大圆角 + 厚重投影的卡片 | 那是 Material Design，不是方舟 |
| 大面积暖色铺底 | 暖色只做点缀 |
| 纯黑 `#000000` 背景 | 方舟用碳灰 `#141516`，纯黑会死板 |
| 卖肉 / 媚宅姿势、夸张表情 | 立绘走"去媚俗化"：服装严实、表情克制 |
| 字体混用衬线与无衬线不分层 | 中文粗宋做标题、黑体做正文、等宽做数字，各司其职 |
| 装饰性八卦元素堆砌 | 每条线要么承载信息，要么明确服务于层级分割 |

---

## 6.5 已落地：行动色 `--act:#C14701`

`index.html` 的 `:root` 已加入 `--act:#C14701`，并替换了三处：

- `.btn.primary` → `background:var(--act)`，加淡橙辉光 `0 0 14px #c1470155` 与 hover 提亮 1.12。
  受影响按钮：**开始游戏**、**结束备战**、**新游戏**（结算页）。
- `.btn.skip-ready` → 从 `#c06b3d` 统一为 `var(--act)`，辉光同步改 `#c1470188`。
  受影响按钮：**跳过对战**。

**色彩分工（改动后）**：锈橙红 `#C14701` = 推进流程的行动；蓝 `#3d8dc0` = 选中/激活态（横竖屏切换、图鉴页签）；暗金 `#8e6925` = 资源消费（刷新、升级商店、祝福二选一）；灰蓝 `#355477` = 中性操作（锁定商店、出售、返回、新游戏按钮）。

## 7. 本项目落地建议（酒馆自走棋）

按优先级排：

1. **切角**：所有卡片、按钮、备战格、商店格改成 45° 切角矩形（`clip-path: polygon(...)`，切 10px）。这一项改动辨识度提升最大。
2. **强调色分工**：`--c:#ffd35a` 保留给金币/稀有度；新增 `--ak-green:#B7E000` 给"可行动/激活/源石"状态；`--l` 蓝色降饱和，让绿色跳出来；**`--act:#C14701` 给确认/开始行动**（已落地，见下）。
3. **四角准星角标**：卡片四角加 1px L 形描边（8px 长），立刻有终端感。
4. **数字等宽**：攻击/血量/回合数用 Bender 或系统等宽 + `font-variant-numeric: tabular-nums`，避免数字跳动。
5. **中英混排标签**：`BATTLE // 战斗`、`ROUND 07 / 14`、`SHOP Lv.3`，英文全大写 + 大字距 + 低不透明度。
6. **底纹**：棋盘和主背景叠一层极淡网格 + 噪点（CSS `repeating-linear-gradient` + SVG noise，opacity 0.03–0.06）。
7. **棋子卡面**：统一用 B 套（干净双色底）生成，稀有度用边框颜色区分（灰 / 蓝 / 金），星级用六边形小方块而非五角星。
