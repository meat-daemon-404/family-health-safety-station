# 家庭健康与安全守护站 V2 · Family Health & Safety Station

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![First Aid Topics](https://img.shields.io/badge/权威急救百科-26_类场景全覆盖-e17055)](https://github.com/meat-daemon-404/family-health-safety-station)
[![Architecture](https://img.shields.io/badge/PWA-Offline_First_%2B_CloudBase_Sync-00b894)](https://github.com/meat-daemon-404/family-health-safety-station)

> **面向多代同堂家庭的纯静态离线优先 PWA + CloudBase FlexDB 云同步健康与应急守护工作台** —— 集成家庭智能药箱（效期预警 / 症状找药 / 买药直达）、**26 类带国家卫健委与中国疾控中心权威溯源链接的急救百科**（含语音分步播报与一键 120 呼救）、情绪急救与心理关怀空间、灾害应急物资核查清单以及适老化长辈大字模式。

## 五大核心模块

1. **家庭智能药箱（Smart Medicine Cabinet）**
   - **三级效期预警**：自动标识已过期（红）、30 天内临期（黄）与正常（绿）药品，支持按家庭成员（成人/儿童/长辈）、存放位置与适应症分类检索。
   - **症状对症找药与禁忌提示**：输入发热、腹泻、扭伤等常见症状，快速匹配家中现有可用药品并高亮服用禁忌与补货直达链接。
2. **26 类权威溯源急救百科（Verified First-Aid Encyclopedia）**
   - 覆盖心肺复苏（CPR + AED）、海姆立克急救法（成人/婴幼儿）、烧烫伤、中暑、脑卒中（FAST 识别）、急性心梗、煤气中毒、宠物咬伤、鱼刺卡喉、触电、溺水、癫痫发作等 **26 类高频危急场景**。
   - **100% 权威来源可溯源**：每条急救指南均附带可实时访问的国家卫生健康委员会、中国疾病预防控制中心（China CDC）、人民网科普或红十字会权威出处链接，严禁无出处的偏方。
   - **危机时刻交互增强**：内置 Web Speech API **分步语音大声播报**、CPR 110 次/分钟节拍器与顶部常驻 **一键拨打 120 / 紧急联系人** 按钮。
3. **心理关怀与情绪急救站（Mental Wellness Corner）**
   - 提供 4-7-8 呼吸放松引导、5-4-3-2-1 感官着陆练习、家庭心情日记以及全国 24 小时心理援助热线速查。
4. **交互式家庭应急清单（Emergency Preparedness Checklists）**
   - 内置地震应急包、火灾逃生自检、台风防汛及外出就医四套交互式打勾核查表，进度自动持久化。
5. **适老化长辈模式与多端家庭共享**
   - 一键开启**长辈高对比大字模式**；支持纯本地 `localStorage` 零配置使用，也可开启 CloudBase FlexDB 实现全家多手机药箱与清单实时同步。

## 快速运行

```bash
git clone https://github.com/meat-daemon-404/family-health-safety-station.git
cd family-health-safety-station

# 零构建依赖，任意静态服务器或直接双击 index.html 即可运行
python3 -m http.server 8080
```

## 免责声明与许可证

- **医疗免责声明**：本系统提供的急救流程与家庭药箱建议均源自公开权威公共卫生指南，仅供紧急情况下的现场初步自救互救与日常药箱管理参考，不能替代执业医师诊断；遇危急重症请立即拨打 **120**。
- **开源许可**：本项目基于 [MIT License](LICENSE) 开源。
