/* 云函数：aidsearch — 在线免费 AI 急救问答
   模型：hy3（腾讯混元，体验版内置免费 AI，实测约 2~4s 返回）
   仅用于科普问答，不能替代专业医疗诊断；紧急情况请拨打 120。
   部署后需在控制台「云函数 → 权限控制」放行匿名调用（invoke: auth != null）。 */
const tcb = require("@cloudbase/node-sdk");
let app = null, ai = null, initErr = "";
try {
  app = tcb.init({ env: tcb.SYMBOL_CURRENT_ENV || "" });
  ai = app.ai();
} catch (e) {
  initErr = (e && e.message) ? e.message : String(e);
}
const MODEL = "hy3";

const SYSTEM_PROMPT =
  "你是一位谨慎、专业的急救科普助手，服务于「家庭健康与安全守护站」公益网站。" +
  "回答规则：\n" +
  "1. 只回答与急救、家庭安全、常见意外处理、健康科普相关的问题；与急救无关的问题请礼貌拒绝。\n" +
  "2. 回答结构：先一句话说明核心处理原则；再分点列出「识别症状 / 处理步骤 / 禁忌」；最后给出「何时必须就医或拨打 120」。\n" +
  "3. 若用户描述的是明确紧急状况（昏迷、大出血、呼吸困难、胸痛、窒息等），回答第一句就要强调「请立即拨打 120」。\n" +
  "4. 不要编造具体药物名称与剂量；涉及用药请建议咨询医生或药师。\n" +
  "5. 输出简体中文，300~500 字，短句、易读、适老化。\n" +
  "6. 每次回答末尾附一句：以上仅供科普参考，不能替代专业医疗诊断；如遇紧急情况请立即拨打 120。";

exports.main = async (event, context) => {
  try {
    if (!ai) return { code: 500, msg: "AI 初始化失败：" + (initErr || "未知错误") };
    const q = String((event && event.q) || "").trim();
    if (!q) return { code: 400, msg: "请先输入要查询的急救问题" };
    if (q.length > 200) return { code: 400, msg: "问题太长了，请精简到 200 字以内" };

    const model = ai.createModel("cloudbase");
    const result = await model.generateText({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "急救问题：" + q }
      ]
    });
    const answer = (result && result.text) ? String(result.text).trim() : "";
    if (!answer) return { code: 500, msg: "AI 未返回有效内容，请稍后再试" };
    return { code: 0, data: { answer: answer } };
  } catch (e) {
    console.error("aidsearch error:", e);
    return { code: 500, msg: (e && e.message) ? e.message : String(e) };
  }
};
