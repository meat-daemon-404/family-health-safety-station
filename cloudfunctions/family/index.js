/* 家庭共享云函数：createHome / joinHome / leaveHome / getHome
   注意：本环境 flexdb 文档字段存储在 data 子对象下，where 查询需用 "data.xxx" 前缀 */
const cloudbase = require("@cloudbase/node-sdk");
let app, db;
try {
  app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV || "" });
  db = app.database();
} catch (e) {
  app = null;
  db = null;
}

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function getUid(context, event) {
  if (event && event.uid) return event.uid;
  try {
    if (context.OPENID) return context.OPENID;
    if (context.auth && context.auth.uid) return context.auth.uid;
    if (context.environment) {
      const env = typeof context.environment === "string" ? JSON.parse(context.environment) : context.environment;
      if (env.TCB_UUID) return env.TCB_UUID;
      if (env.TCB_OPENID) return env.TCB_OPENID;
    }
  } catch (e) {}
  return "";
}

/* 把查询结果里的第一条文档解包为 { _id, ...字段 }（兼容 data 嵌套） */
function firstDoc(res) {
  const arr = res && res.data;
  if (!arr) return null;
  const doc = Array.isArray(arr) ? arr[0] : arr;
  if (!doc) return null;
  if (doc.data && typeof doc.data === "object" && !Array.isArray(doc.data)) {
    return Object.assign({ _id: doc._id }, doc.data);
  }
  return doc;
}

exports.main = async (event, context) => {
  try {
    if (!db) return { code: 500, msg: "数据库初始化失败" };
    const action = (event && event.action) || "";
    const uid = getUid(context, event);
    if (!uid) return { code: 401, msg: "未登录（无法识别用户身份）" };

    const homes = db.collection("homes");
    if (action === "createHome") {
      let code = genCode();
      for (let i = 0; i < 6; i++) {
        const ex = await homes.where({ "data.code": code }).count();
        if (ex.total === 0) break;
        code = genCode();
      }
      const res = await homes.add({ data: { code: code, members: [uid], createdBy: uid, createdAt: new Date().toISOString() } });
      return { code: 0, data: { homeId: res.id || res._id, code: code } };
    }

    if (action === "joinHome") {
      const code = String((event && event.code) || "").trim().toUpperCase();
      if (!code) return { code: 400, msg: "缺少家庭码" };
      const q = await homes.where({ "data.code": code }).get();
      const home = firstDoc(q);
      if (!home) return { code: 404, msg: "家庭码不存在" };
      const members = (home.members || []).slice();
      if (members.indexOf(uid) === -1) {
        members.push(uid);
        await homes.doc(home._id).update({ data: { members: members } });
      }
      return { code: 0, data: { homeId: home._id } };
    }

    if (action === "leaveHome") {
      const homeId = (event && event.homeId) || "";
      if (!homeId) return { code: 400, msg: "缺少 homeId" };
      const doc = await homes.doc(homeId).get();
      const home = firstDoc(doc);
      if (!home) return { code: 404, msg: "家庭不存在" };
      const members = (home.members || []).filter(function (m) { return m !== uid; });
      await homes.doc(homeId).update({ data: { members: members } });
      return { code: 0, data: {} };
    }

    if (action === "getHome") {
      const homeId = (event && event.homeId) || "";
      if (!homeId) return { code: 400, msg: "缺少 homeId" };
      const doc = await homes.doc(homeId).get();
      const home = firstDoc(doc);
      if (!home) return { code: 404, msg: "家庭不存在" };
      if ((home.members || []).indexOf(uid) === -1) return { code: 403, msg: "非家庭成员" };
      return { code: 0, data: { homeId: homeId, code: home.code, members: home.members } };
    }

    return { code: 400, msg: "未知 action" };
  } catch (e) {
    return { code: 500, msg: e && e.message ? e.message : String(e) };
  }
};
