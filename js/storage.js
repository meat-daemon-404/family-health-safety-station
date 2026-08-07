/* ============================================================
   家庭健康与安全守护站 - 本地存储（药箱数据）
   纯 localStorage，无云端同步
   ============================================================ */
(function () {
  "use strict";
  var KEY = "hfs_medicines_v1";

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function save(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
  }

  function add(item) {
    var arr = load();
    item.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    item.createdAt = new Date().toISOString();
    arr.push(item);
    save(arr);
    return item;
  }

  function remove(id) {
    var arr = load().filter(function (it) { return it.id !== id; });
    save(arr);
    return arr;
  }

  /* 状态：expired 已过期 / soon 30天内到期 / ok 正常 / none 未填有效期 */
  function statusOf(item, now) {
    if (!item.expiryDate) return "none";
    var d = new Date(item.expiryDate + "T00:00:00");
    if (isNaN(d.getTime())) return "none";
    var base = now || new Date();
    var today = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    var diffDays = Math.floor((d.getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) return "expired";
    if (diffDays <= 30) return "soon";
    return "ok";
  }

  function statusText(s) {
    return { expired: "已过期", soon: "即将过期（30天内）", ok: "正常", none: "未填有效期" }[s] || "";
  }

  function daysLeft(item, now) {
    if (!item.expiryDate) return null;
    var d = new Date(item.expiryDate + "T00:00:00");
    if (isNaN(d.getTime())) return null;
    var base = now || new Date();
    var today = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    return Math.floor((d.getTime() - today.getTime()) / 86400000);
  }

  window.MedicineStore = {
    KEY: KEY, load: load, save: save, add: add, remove: remove,
    statusOf: statusOf, statusText: statusText, daysLeft: daysLeft
  };
})();
