# 性能审查与优化 · 2026-10-29

本次结论基于本地文件审计、脚本检查及浏览器功能验证。没有运行 Lighthouse / 网络限速，未给出未经测量的 LCP、帧率或性能分数。下列体积为本地文件字节数，非整页实测流量。

## 1. 视频与图片

| 项目 | 原体积 | 优化后 | 说明 |
| --- | ---: | ---: | --- |
| 头像 | 7,247,401 B | 42,300 B / 197,566 B | 原色 WebP 640 / 1280，根据尺寸和像素密度选取；原 JPG 保留但不再引用 |
| 八张封面合计 | 1,032,358 B | 289,240 B（960px 档） | 增加 480 / 960 / 1440px srcset；手机/高分屏实际选档不同；详情仍可看原尺寸 |
| 六张开场小老虎合计 | 448,292 B | 171,076 B（360px 档） | 保留 600px 高清档；循环复用相同 URL，不重复下载同图 |
| 首屏背景 | 约 120 KiB | 保持 | 已是 WebP；背景和前景遮挡层复用同一 URL |

三段视频分别为 1,637,167 / 1,113,300 / 1,110,006 B，总计约 3.68 MiB。原文件 moov 播放索引在文件末尾，生成 `*-faststart.mp4` 将 moov 移到 mdat 前，并修正 stco 偏移。逐字节验证媒体载荷一致，未重编码、画质和文件大小不变。

视频仅在打开机器人详情后创建，preload=none，无自动播放；关闭时停止播放、清除 src、调用 load 并移除画廊节点，切到后台暂停。浏览器验证：打开详情时三段视频均 paused、readyState=0，关闭后视频节点数为 0。

所有封面增加准确宽高、async 解码；详情图片也预留准确宽高，减少懒加载造成的布局跳动。原始文件未删除，磁盘目录不等于网页运行时下载量。

## 2. WebGL / 动态背景

当前站点没有 WebGL，没有 Three.js。未引用的 visual.js 为旧 Canvas2D 方案，不在实际页面执行。

实际动效为 CSS 纹理和 DOM 玻璃方块：
- 从每帧读取 clientWidth / clientHeight / getComputedStyle，改为 ResizeObserver 缓存几何数据。
- 尺寸与前景图位置仅在 resize 更新；动画帧只更新 transform / opacity，不再逐帧改 left、top、width、height。
- 离开首屏、后台、减少动态效果时暂停；移动端视觉更新上限 30fps，桌面保留浏览器刷新节奏（不是实测帧率承诺）。
- 移除移动玻璃片的 backdrop-filter 和 left/top will-change，保留渐变玻璃外观。
- 开场轮播缓存容器尺寸，跳过屏幕外卡片的几何/clip-path 更新。

## 3. 滚动监听

用户要求封面完整显示后，视差已取消，但旧实现仍有空 scroll 监听和 RAF。现已删除相关 scroll 监听、空视差计算及观察器。模块进入使用 IntersectionObserver，触发一次后 unobserve。分类切换清理被移除卡片的观察状态，避免隐藏节点积累。

## 4. GSAP / 动画

当前没有 GSAP 或 ScrollTrigger 下载。使用原生 Web Animations API + IntersectionObserver，无需增加外部库。

保留 opening、标题行遮罩、卡片 stagger、图片揭示。结束后取消动画实例；减少动态效果时取消并显示内容。没有常驻滤镜动画或 JS 滚动位置轮询。遮罩动画仍有绘制成本，但只在进场短时间执行；刻意保留视觉设计效果。

## 5. 首屏加载

- 主站背景增加高优先级 preload，避免仅等待 CSS 发现。
- 脚本改为 defer，保持 projects → app → orbit → reveal 的依赖顺序。
- 头像、项目图保持懒加载；视频不参与首屏加载。
- 无远程字体、远程视频、框架或动画库依赖。
- Opening 是视觉编排，并非真实加载进度；保持现有约 3.5 秒节奏，锚点直达跳过。若后续追求更快可感知首屏，可进一步缩短 opening，不在本轮擅自取消视觉设计。

## 验证与边界

- 所有变更 JS 通过 node --check。
- 浏览器确认八张封面选中 cover-960 响应式资源并成功加载，控制台无错误。
- 项目详情打开/关闭、视频资源释放已验证。
- Fast Start 文件 atom 结构、偏移及 mdat 媒体载荷一致性已验证。
- 保留高清原始素材；上线发布时只打包实际引用的资源，可额外减少发布包磁盘体积。
- 尚未在真实低端手机、移动网络、生产 CDN 上采样 Core Web Vitals，因此不报告 LCP/INP/FPS 改善百分比。

## 第二轮复查（新增纹理、导航状态后）

本轮继续检查五项，保留第一轮媒体优化：

1. 图片与视频：主站仍引用 WebP 响应式头像和封面；首屏视频元素数为 0；无新增远程视频。原图与备份保留在 assets，整个目录约 25MiB 并非一次页面加载量，不能据此判断首屏流量。
2. WebGL：仍无 WebGL。新增的磨砂质感使用重复的静态 SVG 纹理及 CSS 渐变。关于我的 CSS 网格新增 IntersectionObserver 可见性控制，离屏/后台暂停，减少动态效果设置仍禁用动画。手机导航取消 backdrop-filter，保留近不透明暗底。
3. 滚动：导航状态通过 IntersectionObserver 在读取线附近更新；没有新增 scroll 事件或每帧滚动位置扫描。仅 resize 时重建读取线观察器。
4. 动画：开场移除 documentElement 上持续 1e9ms 的空 opacity 动画时钟，改为 RAF 时间戳；轮播离屏暂停，手机非拖拽时几何更新上限约 30fps。Opening 的整屏退出由 clip-path 换为 translate3d，保留向上揭幕效果。取消动画时从 active Set 清理引用。原先未使用的 frame 状态已清除。
5. 首屏：原有背景 preload 与 defer 继续有效；新背景无需额外大图或依赖库。刻意保留完整 opening 节奏，不宣称已消除其对可感知首屏的影响。

浏览器验证：无脚本错误、无已完成但解码失败的图片；首屏关于我 ambient-active=false；进入关于我后 ambient-active=true 且 animation-play-state=running。头像根据设备选择 1280 高清档。导航模块高亮可随位置更新。

本轮仍未测量真实低端设备、限速网络和 Core Web Vitals；不报告未经实测的 FPS / Lighthouse 分数。

## 第三轮复查（蓝色网格、玻璃卡片与选中态后）

### 新发现与已实施修改

- 详情画廊原先统一使用 2200px 图片，并在 src 后才设置 loading。已改为先设置 loading / sizes / srcset，首张 eager、其余 lazy，再设置 src，避免创建 Image 时抢先发起原图请求。
- 为 54 张详情图新增 720px / 1440px 档，保留 2200px 原图与“查看原尺寸”链接。54 张原图合计 9,010,466 B；720px 档合计 1,568,736 B（减少约 82.6%）。这只是相同档位合计，不表示单次浏览流量；浏览器按显示尺寸与 DPR 选档，桌面高分屏仍可能选择原图。
- 桌面玻璃卡片仅在视口附近且进场结束后启用 6px 背景模糊；离屏和进场中关闭。移动端继续使用透明渐变模拟玻璃，没有背景模糊。
- 新蓝色网格已是静态 CSS 背景，删除旧 ambient.js 的页面引用，移除无实际作用的观察器和 visibilitychange 监听。未删除原文件以保留历史来源。
- 导航 resize 回调用 requestAnimationFrame 合并，避免连续调整窗口时多次重建 IntersectionObserver；没有增加 scroll 监听。

### 五项结论

1. 媒体：响应式头像、封面、详情图均已设置；视频保持 Fast Start / preload=none / 关闭释放。
2. WebGL：没有 WebGL。现有旋转方块只在可见状态运行；蓝网格与磨砂纹理没有持续动画。
3. 滚动：未使用 scroll 事件扫描，使用 IntersectionObserver。只保留可见首屏或开场轮播所需 RAF。
4. GSAP：没有 GSAP / ScrollTrigger，原生 WAAPI；保留现有完整 opening 和 stagger，结束释放动画实例。
5. 首屏：背景 preload、defer、图片尺寸占位继续有效；详情图和视频不提前参与首屏；没有新增外部依赖。

### 验证

- 四个修改脚本通过 node --check。
- 桌面可见优势卡片：glass-active=true、is-revealing=false、backdrop-filter=blur(6px)；离屏头像：backdrop-filter=none。
- 页面不再引用 ambient.js，首屏 video 节点数为 0，控制台无脚本错误。
- 桌面打开详情：首图 eager、后续 lazy、宽高占位正确；高分屏实际选中 2200px 原图，符合 sizes/srcset 策略。
- 三段视频 paused=true、preload=none、readyState=0。
- 390px iframe 手机预览：已打开详情确认图片完整展示和画廊布局。受浏览器工具读取 iframe 内资源状态限制，未声称实测手机网络流量。
- 没有真实设备限速、Lighthouse 或 FPS 采样，不提供性能评分或帧率保证。
