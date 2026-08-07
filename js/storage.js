/* ============================================================
   家庭健康与安全守护站 - 本地存储
   药箱数据 + 心情日记 + 紧急联系人 + 清单勾选 + 长辈模式
   纯 localStorage，无云端同步（家庭共享走 CloudBase 时另有云端缓存）
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
  function save(arr) { try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {} }
  function add(item) {
    var arr = load();
    item.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    item.createdAt = item.createdAt || new Date().toISOString();
    arr.push(item);
    save(arr);
    return item;
  }
  function update(id, patch) {
    var arr = load();
    var hit = null;
    arr = arr.map(function (it) {
      if (it.id === id) { for (var k in patch) it[k] = patch[k]; hit = it; }
      return it;
    });
    save(arr);
    return hit;
  }
  function remove(id) {
    var arr = load().filter(function (it) { return it.id !== id; });
    save(arr);
    return arr;
  }

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

  /* 通用小工具 */
  function lget(key, def) { try { var v = localStorage.getItem(key); return v == null ? def : v; } catch (e) { return def; } }
  function lset(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function jget(key, def) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function jset(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  window.MedicineStore = {
    KEY: KEY, load: load, save: save, add: add, update: update, remove: remove,
    statusOf: statusOf, statusText: statusText, daysLeft: daysLeft
  };

  /* 心情日记：hfs_mood = { "2026-08-07": {mood: 2, note: "..."} } */
  window.MoodStore = {
    KEY: "hfs_mood",
    load: function () { return jget("hfs_mood", {}); },
    saveEntry: function (date, mood, note) {
      var all = jget("hfs_mood", {});
      all[date] = { mood: mood, note: note || "" };
      jset("hfs_mood", all);
      return all;
    },
    removeEntry: function (date) {
      var all = jget("hfs_mood", {});
      delete all[date];
      jset("hfs_mood", all);
      return all;
    },
    getEntry: function (date) { return jget("hfs_mood", {})[date] || null; },
    lastNDays: function (n) {
      var all = jget("hfs_mood", {});
      var out = [];
      for (var i = n - 1; i >= 0; i--) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        var key = fmtDate(d);
        if (all[key]) out.push({ date: key, mood: all[key].mood, note: all[key].note });
      }
      return out;
    }
  };

  function fmtDate(d) {
    var y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + dd;
  }
  window.fmtDate = fmtDate;

  /* 紧急联系人 */
  window.ContactStore = {
    KEY: "hfs_emergency_contact",
    get: function () { return (lget("hfs_emergency_contact", "") || "").replace(/\D/g, ""); },
    set: function (num) { lset("hfs_emergency_contact", String(num || "").replace(/\D/g, "")); }
  };

  /* 应急清单勾选：hfs_checklist = ["id1","id2",...] */
  window.ChecklistStore = {
    KEY: "hfs_checklist",
    load: function () { return jget("hfs_checklist", []); },
    save: function (ids) { jset("hfs_checklist", ids); },
    has: function (id) { return jget("hfs_checklist", []).indexOf(id) !== -1; },
    toggle: function (id) {
      var ids = jget("hfs_checklist", []);
      var i = ids.indexOf(id);
      if (i === -1) ids.push(id); else ids.splice(i, 1);
      jset("hfs_checklist", ids);
      return ids;
    }
  };

  /* 长辈模式 */
  window.ElderStore = {
    KEY: "hfs_elder",
    get: function () { return lget("hfs_elder", "") === "1"; },
    set: function (on) { lset("hfs_elder", on ? "1" : ""); }
  };

  /* 家庭共享本地缓存：hfs_family = { homeId, code, uid } */
  window.FamilyStore = {
    KEY: "hfs_family",
    get: function () { return jget("hfs_family", null); },
    set: function (v) { jset("hfs_family", v); },
    clear: function () { try { localStorage.removeItem("hfs_family"); } catch (e) {} }
  };
})();
