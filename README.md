# 崔睿 · UI 视觉设计作品集

纯 HTML / CSS / 原生 JavaScript，无框架、无构建步骤。

## 预览

可直接双击 index.html。推荐在此目录运行 `python3 -m http.server 4173`，访问 http://localhost:4173。

本机没有系统 Python 时可双击“启动预览.command”，使用当前环境自带的 Python。

入口：index.html → portfolio.html。作品支持筛选和详情画廊；联系区支持邮件、电话、复制微信号。复制微信需 localhost 或 HTTPS，失败时直接显示可手动复制的微信号。

开场轮播使用用户提供的六张小老虎作品图片，素材已本地化，无需联网。内页素材全部在 assets，无运行时依赖。原始素材目录保持不变，项目图片已压缩为 WebP。无后台表单，不收集访客信息。

## 修改位置

- DESIGN.md：内容结构、来源和 PC / 手机设计规范
- index.html / intro.js：开场文案与弧形视频效果
- portfolio.html：介绍、经历、优势和联系
- projects.js：项目名称、说明、图片及视频顺序
- style.css：主题与响应式样式
- app.js：筛选、详情与联系交互
