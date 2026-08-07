# 家庭健康与安全守护站 🏥

一个面向家庭的**公益科普网站**：管好家里的药箱、照顾好彼此的情绪、关键时刻知道该怎么救。

## 功能

- 💊 **家庭药箱**
  - 药品录入 / 编辑 / 删除，有效期与开封日期管理（数据存本机浏览器 localStorage）
  - **智能用药提醒**：为药品设置每日服用时间（如 08:00,20:00），首页与药箱页显示"今天还有 X 种药需要服用"；浏览器通知需授权（页面打开时生效）
  - **症状找药**：按"发烧/头痛/腹泻…"等常见症状，推荐药箱已有药品 + 常备药参考
  - **家庭共享（CloudBase 云端，已上线可用）**：创建家庭码，家人输入家庭码加入，多设备共用一个药箱（匿名登录 + 云函数 + NoSQL 安全规则）
  - **买药链接**：每个药品可一键跳转京东/淘宝搜索（药名自动预填），手机端可打开 App 直达搜索；美团/叮当为"打开 App + 指引"
- 🧠 **心理健康**
  - PHQ-9 / GAD-7 情绪自测（公共领域官方中文版）
  - **情绪急救页**：4-7-8 呼吸动画引导 + 大字号热线一键拨打
  - **心情日记**：表情 + 关键词记录，7/14/30 天心情曲线（SVG）
  - 正念练习、CBT 想法记录表、心理援助热线汇总（12356 等）
- 🚑 **急救百科**
  - 26 类常见急救场景，模糊搜索 + 分类筛选，逐条标注权威来源
  - **一键拨打 120**（悬浮按钮）+ **发送求助短信**（预设紧急联系人 + 可选定位）
  - **语音播报**急救步骤（Web Speech）
  - **离线可用**：PWA（可添加到主屏幕离线访问）+ 打印版急救速查
- 📋 **家庭应急清单**：交互式核对表（勾选自动保存 + 完成进度），可打印/另存 PDF

## 技术栈

纯 HTML / CSS / JavaScript 静态站，无框架、无构建、无依赖，双击 index.html 即可本地使用。家庭共享部分使用腾讯云 CloudBase（匿名登录 + NoSQL + 云函数）作渐进增强。

## 在线访问

- GitHub Pages：https://sun-zihang.github.io/family-health-safety-station/
- 腾讯云 CloudBase：https://fridge-blindbox-d9foky90cf58fa93-1463452526.tcloudbaseapp.com

## 目录结构

```
├── index.html                  # 首页（含今日服药提醒横幅）
├── manifest.webmanifest / sw.js # PWA 离线
├── css/style.css               # 全局样式（适老化：大字号/大按钮/长辈模式）
├── js/
│   ├── common.js               # 导航/页脚/字号/长辈模式/更新时间/PWA注册
│   ├── links.js                # 买药链接（网页 + App 深链，统一维护）
│   ├── storage.js              # localStorage（药箱/心情/联系人/清单/长辈/家庭缓存）
│   ├── data-*.js               # 内容数据
│   ├── app-*.js                # 各模块页面逻辑
│   └── search.js               # 模糊搜索
├── pages/
│   ├── yixiang.html            # 家庭药箱
│   ├── xinli.html              # 心理健康
│   ├── qingxu-jijiu.html       # 情绪急救
│   ├── jijiu.html              # 急救百科
│   └── yjqd.html               # 打印版应急清单
├── cloudfunctions/family/      # CloudBase 云函数（创建/加入/退出/查询家庭）
└── cloudbaserc.json            # CloudBase 部署配置
```

## 家庭共享：CloudBase 后端现状（已配置完成 ✅）

> 注意：本项目环境的 flexdb 文档数据库把文档字段统一存在 **`data.` 子对象**下，SDK 查询与安全规则都要用 `data.` 前缀（如 `where({"data.homeId": …})`、规则里 `doc.data.members`、`get(...).data.members`）。

已完成的后端配置：

1. **匿名登录**：环境 → 登录授权 → 「匿名登录」已开启。
2. **云函数调用权限**：环境 → 云函数 → 「权限控制」，默认规则为 `auth != null && auth.loginType != 'ANONYMOUS'`（拒绝匿名调用），已为 `family` 单独放行：
   ```json
   { "*": { "invoke": "auth != null && auth.loginType != 'ANONYMOUS'" }, "family": { "invoke": "auth != null" } }
   ```
3. **数据库安全规则**（集合 → 权限设置 → 切换到安全规则）：
   - `homes`：
     ```json
     { "read": "auth != null && (doc.data.createdBy == auth.uid || auth.uid in doc.data.members)", "write": "auth != null && doc.data.createdBy == auth.uid" }
     ```
   - `medicines`：
     ```json
     { "read": "auth != null && auth.uid in get(`database.homes.${doc.data.homeId}`).data.members", "write": "auth != null && auth.uid in get(`database.homes.${doc.data.homeId}`).data.members" }
     ```
4. **云函数 `family`**（Node 20）：`createHome / joinHome / leaveHome / getHome`，已部署。Web 匿名用户的 uid 取自 `context.environment.TCB_UUID`（兼容 OPENID / auth.uid / event.uid 多路兜底）。

维护提示：若安全规则/查询改动后不生效，注意 flexdb 的 `data.` 前缀与「权限修改 1~3 分钟、安全规则 2 分钟生效延迟」。

## 本地运行 / 部署

- 本地：直接双击 `index.html`；云端/PWA/语音/家庭共享为渐进增强，本地 file:// 下家庭共享显示提示
- 腾讯云 CloudBase 部署：
  ```bash
  tcb hosting deploy ./index.html /index.html --env-id fridge-blindbox-d9foky90cf58fa93
  tcb hosting deploy ./css /css --env-id fridge-blindbox-d9foky90cf58fa93
  tcb hosting deploy ./js /js --env-id fridge-blindbox-d9foky90cf58fa93
  tcb hosting deploy ./pages /pages --env-id fridge-blindbox-d9foky90cf58fa93
  tcb hosting deploy ./manifest.webmanifest /manifest.webmanifest --env-id fridge-blindbox-d9foky90cf58fa93
  tcb hosting deploy ./sw.js /sw.js --env-id fridge-blindbox-d9foky90cf58fa93
  tcb fn deploy family --dir cloudfunctions/family --env-id fridge-blindbox-d9foky90cf58fa93 --force
  ```
  （云函数目录需先 `npm install` 好 `@cloudbase/node-sdk`，node_modules 已在 .gitignore 中）

## 内容与合规说明

- 医学/心理内容整理自国家卫健委、红十字会、权威医院等公开科普，逐条标注来源；全站含醒目免责声明。
- 急救视频暂为占位；急救配图使用文字 + 图标示意，不使用 AI 生成医学图。
- 本项目为公益科普用途，不构成医疗建议。如遇紧急情况，请立刻拨打 120（火警 119、报警 110）。
