# 家庭健康与安全守护站 🏥

一个面向家庭的**公益科普网站**：管好家里的药箱、照顾好彼此的情绪、关键时刻知道该怎么救。

- 💊 **家庭药箱**：药品录入与有效期管理（数据仅存本机浏览器 localStorage），到期自动提醒；附家庭常备药参考与安全用药常识。
- 🧠 **心理健康**：PHQ-9 / GAD-7 情绪自测（公共领域官方中文版）、正念入门练习、CBT 想法记录表、心理援助热线汇总（12356 等）。
- 🚑 **急救百科**：18 类常见急救场景（烧烫伤 / 气道异物 / 心肺复苏 / 中暑 / 溺水 / 触电 / 出血 / 骨折 / 扭伤 / 动物咬伤 / 中毒 / 低血糖 / 癫痫 / 鼻出血 / 冻伤等），支持模糊搜索，逐条标注权威来源。
- 📋 **家庭应急清单**：可打印（浏览器"另存为 PDF"）的应急清单。

## 技术栈

纯 HTML / CSS / JavaScript 静态网站，无框架、无构建、无依赖，**双击 index.html 即可本地使用**，也可部署到任意静态托管。

## 在线访问

- GitHub Pages：https://sun-zihang.github.io/family-health-safety-station/
- 腾讯云 CloudBase：https://fridge-blindbox-d9foky90cf58fa93-1463452526.tcloudbaseapp.com

## 目录结构

```
├── index.html            # 首页
├── css/style.css         # 全局样式（适老化设计：大字号/大按钮/高对比）
├── js/
│   ├── common.js         # 共享导航/页脚/字号切换
│   ├── data-*.js         # 内容数据（药箱/急救/心理），window 全局变量
│   ├── search.js         # 模糊搜索
│   ├── storage.js        # localStorage 封装（药品数据）
│   └── app-*.js          # 各模块页面逻辑
├── pages/
│   ├── yixiang.html      # 家庭药箱
│   ├── xinli.html        # 心理健康
│   ├── jijiu.html        # 急救百科
│   └── yjqd.html         # 打印版家庭应急清单
└── cloudbaserc.json      # 腾讯云 CloudBase 部署配置
```

## 内容与合规说明

- 所有医学/心理内容均整理自**国家卫健委、红十字会、权威医院等公开科普**，逐条标注来源机构、链接与更新日期，禁止自行编造。
- 全站（首页底部 + 每个核心页面）均有醒目免责声明：**本站内容仅供科普参考，不能替代专业医疗诊断。如遇紧急情况，请立刻拨打 120。**
- 急救视频暂以占位标注"后续接入"（版权与制作成本原因）；急救配图使用文字 + 简单图标示意，不使用 AI 生成医学图以避免误导。

## 本地运行 / 部署

- 本地：直接双击 `index.html`，或在项目目录运行 `python -m http.server 8000` 后访问 http://localhost:8000
- 腾讯云 CloudBase 部署：
  ```bash
  tcb hosting deploy . --env-id fridge-blindbox-d9foky90cf58fa93
  ```

## 免责声明

本项目为公益科普用途，不构成医疗建议。如遇紧急情况，请立刻拨打 120（火警 119、报警 110）。
