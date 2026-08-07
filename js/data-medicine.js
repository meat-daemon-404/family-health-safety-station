/* ============================================================
   家庭健康与安全守护站 - 家庭药箱数据
   常备药参考 + 用药常识 + 过期药处理（标注权威来源）
   ============================================================ */
window.MEDICINE_DATA = {
  items: [
    {
      name: "对乙酰氨基酚",
      category: "退热镇痛",
      uses: "用于退热、缓解头痛/肌肉痛等轻中度疼痛；是儿童常用退热药之一。",
      points: "按说明书/医嘱剂量服用，两次给药间隔足够；2～3 个月以上儿童可在医生指导下使用。",
      caution: "肝功能异常者慎用；不要与含“对乙酰氨基酚”成分的复方感冒药重复服用，以免过量伤肝。",
      storage: "密封、避光、阴凉干燥处保存。",
      source: { org: "中国药学会科技开发中心（PSM）", title: "儿童发烧，该选什么退烧药好？", url: "https://www.psmchina.cn/safe_medicines_information/safe_medicines_knowledge/jbcs/10116", date: "2024-11-27" }
    },
    {
      name: "布洛芬",
      category: "退热镇痛",
      uses: "退热、缓解疼痛（头痛、牙痛、关节痛、痛经等），兼有抗炎作用。",
      points: "6 个月以上儿童可选；成人按说明书剂量，饭后服用可减少胃肠刺激。",
      caution: "血液系统疾病、严重肝肾功能不全、消化道溃疡活动期者禁用；不要与对乙酰氨基酚同时或交替使用退热。",
      storage: "密封、避光、阴凉干燥处保存。",
      source: { org: "中国药学会科技开发中心（PSM）", title: "儿童发烧，该选什么退烧药好？", url: "https://www.psmchina.cn/safe_medicines_information/safe_medicines_knowledge/jbcs/10116", date: "2024-11-27" }
    },
    {
      name: "复方感冒药",
      category: "感冒",
      uses: "缓解普通感冒的鼻塞、流涕、打喷嚏、咽痛等症状（对症）。",
      points: "按说明书服用，多种感冒药成分可能重叠，不要同时吃多种；含解热成分的感冒药不要再叠加退热药。",
      caution: "看清成分表，避免重复用药；儿童使用儿童剂型；症状持续或加重及时就医。",
      storage: "密封、阴凉干燥处保存。",
      source: { org: "医药卫生报（河南省卫生健康委主管）", title: "家庭药箱规范化配置与安全用药", url: "https://adminc.yywsb.com/article/73430.html", date: "2026-07-20" }
    },
    {
      name: "口服补液盐 Ⅲ",
      category: "肠胃",
      uses: "腹泻、呕吐导致轻中度脱水时的补液首选，纠正水电解质紊乱。",
      points: "WHO 推荐低渗型口服补液盐Ⅲ；按说明书用温水冲服，少量多次。",
      caution: "不能直接吞服粉末；不能用牛奶、果汁等冲泡；少尿或无尿者慎用，需遵医嘱。",
      storage: "密封、防潮、阴凉干燥处保存。",
      source: { org: "郑州大学第三附属医院", title: "口服补液盐您用对了吗?", url: "https://www.zdsfy.net/kpzs/126727.jhtml", date: "2023-10-26" }
    },
    {
      name: "蒙脱石散",
      category: "肠胃",
      uses: "用于成人及儿童急、慢性腹泻，覆盖消化道黏膜、吸附病原与毒素。",
      points: "按说明书用温水调匀后服用，宜在两餐间；与其他药物间隔 1～2 小时服用。",
      caution: "便秘者慎用；腹泻伴发热、血便、脱水时应就医，不要单纯依赖止泻。",
      storage: "密封、防潮、阴凉干燥处保存。",
      source: { org: "医药卫生报（河南省卫生健康委主管）", title: "家庭药箱规范化配置与安全用药", url: "https://adminc.yywsb.com/article/73430.html", date: "2026-07-20" }
    },
    {
      name: "健胃消食类（如健胃消食片）",
      category: "肠胃",
      uses: "缓解积食、消化不良、食欲不振等轻症。",
      points: "按说明书服用；中成药成分请遵医嘱或药师建议。",
      caution: "反复腹胀、腹痛、消瘦或黑便时应就医，排除器质性疾病。",
      storage: "密封、阴凉干燥处保存。",
      source: { org: "医药卫生报（河南省卫生健康委主管）", title: "家庭用药须科学合理", url: "http://www.jiaozhou.gov.cn/sy/ywdt/bmts/202511/t20251128_10383555.shtml", date: "2025-11-27" }
    },
    {
      name: "氯雷他定 / 西替利嗪（抗过敏）",
      category: "抗过敏",
      uses: "缓解过敏性鼻炎、荨麻疹等过敏症状（瘙痒、打喷嚏、流涕）。",
      points: "按说明书剂量服用；部分二代抗组胺药嗜睡反应较轻，但仍建议服药后避免驾车。",
      caution: "严重肝肾功能不全者遵医嘱；儿童使用儿童剂型；出现呼吸困难等重症过敏立即就医。",
      storage: "密封、阴凉干燥处保存。",
      source: { org: "医药卫生报（河南省卫生健康委主管）", title: "家庭药箱规范化配置与安全用药", url: "https://adminc.yywsb.com/article/73430.html", date: "2026-07-20" }
    },
    {
      name: "炉甘石洗剂",
      category: "外用",
      uses: "用于蚊虫叮咬、湿疹、痱子等引起的瘙痒（外用止痒）。",
      points: "摇匀后涂抹患处；只用于皮肤完整处。",
      caution: "皮肤破损、感染处勿用；使用后如刺激加重停止使用。",
      storage: "密封、避光保存。",
      source: { org: "大众网", title: "暑假出游正当时，家庭药箱你备对了吗？", url: "https://hb.dzwww.com/p/p2uTX6TZ8G0.html", date: "2026-06-28" }
    },
    {
      name: "碘伏",
      category: "外用",
      uses: "皮肤、黏膜伤口消毒，刺激性小，适合家庭备用。",
      points: "用于清洁伤口周围消毒；开封后注意有效期，避免污染。",
      caution: "对碘过敏者禁用；大面积伤口、深部伤口请就医处理。",
      storage: "密封、避光、阴凉处保存。",
      source: { org: "医药卫生报（河南省卫生健康委主管）", title: "家庭药箱规范化配置与安全用药", url: "https://adminc.yywsb.com/article/73430.html", date: "2026-07-20" }
    },
    {
      name: "医用纱布、绷带、创可贴、胶带",
      category: "外用",
      uses: "小伤口覆盖、包扎、压迫止血等基础外伤处理。",
      points: "按压止血时用干净敷料直接压迫；包扎松紧适度。",
      caution: "嵌有异物或骨折外露的伤口不要直接按压；污染伤口及时就医。",
      storage: "密封、干燥、洁净处保存。",
      source: { org: "保定市红十字会", title: "【冀小红科普】这些知识，关键时刻能救命（2）", url: "http://www.bdredcross.org.cn/smartcore/web/bdhsz/hszydcs/2c9f7bd08cb813000191daea3aef4cff.htm", date: "2024-08-01" }
    },
    {
      name: "电子体温计",
      category: "器械",
      uses: "测量体温，发热时辅助判断是否需要用退热药。",
      points: "按说明书使用，注意探头清洁；测量环境温度适宜。",
      caution: "体温持续升高、精神差、抽搐或发热超 3 天应就医。",
      storage: "干燥、常温保存，避免摔碰。",
      source: { org: "医药卫生报（河南省卫生健康委主管）", title: "家庭药箱规范化配置与安全用药", url: "https://adminc.yywsb.com/article/73430.html", date: "2026-07-20" }
    },
    {
      name: "烫伤膏（湿润烧伤膏等）",
      category: "外用",
      uses: "轻度烧烫伤冷水冲洗后的创面外用药（遵说明书）。",
      points: "先用流动冷水充分冲洗降温后再用药；覆盖创面保持湿润。",
      caution: "水疱大、创面深、面积大或面部/关节等部位烫伤请就医，不要自行处理。",
      storage: "密封、阴凉处保存。",
      source: { org: "保定市红十字会", title: "烧烫伤莫惊慌，“冲脱泡盖送”五字诀要记牢", url: "http://www.bdredcross.org.cn/smartcore/web/bdhsz/wsjh/2c9f7bd0981c831f01995047055d3ebc.htm", date: "2025-06-10" }
    },
    {
      name: "驱蚊液 / 防蚊用品",
      category: "外用",
      uses: "户外防蚊，减少蚊虫叮咬及蚊媒疾病风险。",
      points: "按产品说明使用，儿童注意适用月龄与使用部位。",
      caution: "皮肤破损处勿用；如出现皮疹等过敏反应停用。",
      storage: "密封、避光、远离火源。",
      source: { org: "大众网", title: "暑假出游正当时，家庭药箱你备对了吗？", url: "https://hb.dzwww.com/p/p2uTX6TZ8G0.html", date: "2026-06-28" }
    },
    {
      name: "电子血压计（家用）",
      category: "器械",
      uses: "高血压等慢病家庭日常血压监测。",
      points: "按说明书正确绑袖带，静坐休息后测量，记录数值供复诊参考。",
      caution: "测量结果不能替代医生诊断；血压异常波动或不适及时就医。",
      storage: "干燥、常温保存。",
      source: { org: "医药卫生报（河南省卫生健康委主管）", title: "家庭药箱规范化配置与安全用药", url: "https://adminc.yywsb.com/article/73430.html", date: "2026-07-20" }
    }
  ],
  commonSense: [
    {
      title: "药品储存要点",
      content: "药品一般应存放在阴凉、干燥、避光处，按说明书标注的温度保存（少数需冷藏）；放在儿童够不到、上锁的柜子中；定期检查有效期，临近过期先使用。",
      source: { org: "医药卫生报（河南省卫生健康委主管）", title: "家庭药箱规范化配置与安全用药", url: "https://adminc.yywsb.com/article/73430.html", date: "2026-07-20" }
    },
    {
      title: "退热药怎么选：对乙酰氨基酚 vs 布洛芬",
      content: "两者选一种即可，不要同时吃、也不推荐交替用于儿童退热。对乙酰氨基酚适用年龄更宽（2～3 个月以上儿童可遵医嘱），对胃肠刺激较小；布洛芬退热持续时间较长，6 个月以上儿童可选。血液系统疾病者禁用布洛芬，肝功能异常者慎用对乙酰氨基酚。",
      source: { org: "北京交通大学校医院", title: "对乙酰氨基酚与布洛芬有何区别？（用药科普）", url: "http://xyy.bjtu.edu.cn/jkcj/yx/0d7cdd631d174102a4f8d74cf0e497dd.htm", date: "2024-12-19" }
    },
    {
      title: "抗生素不能自行使用",
      content: "抗生素是处方药，需医生明确细菌感染诊断后开具，不能凭经验自行购买服用；随意使用或停药容易导致耐药和不良反应。",
      source: { org: "医药卫生报（河南省卫生健康委主管）", title: "家庭药箱规范化配置与安全用药", url: "https://adminc.yywsb.com/article/73430.html", date: "2026-07-20" }
    },
    {
      title: "过期药别乱丢：正确处理",
      content: "过期药品属于《国家危险废物名录》中的危险废物/有害垃圾，不能随意当普通垃圾丢弃。优先送到当地过期药品回收点（社区卫生服务中心、指定药店等）；没有回收点时，口服片剂、胶囊可取出集中密封后投入红色有害垃圾桶。",
      source: { org: "央视网-健康", title: "家里过期药，究竟咋处理？", url: "https://jiankang.cctv.cn/2025/10/24/ARTIm0NqME3VOYJ4UvsoeJzQ251024.shtml", date: "2025-10-23" }
    },
    {
      title: "服药的基本原则",
      content: "按说明书或医嘱的剂量、频次、时间服用；不要自行加量、减量或突然停药；不与他人分享处方药；老人、儿童、孕妇用药前先咨询医生或药师。",
      source: { org: "医药卫生报（河南省卫生健康委主管）", title: "家庭用药须科学合理", url: "http://www.jiaozhou.gov.cn/sy/ywdt/bmts/202511/t20251128_10383555.shtml", date: "2025-11-27" }
    }
  ]
};
