/* ============================================================
   家庭药箱 V2：录入/编辑/删除 + 用药提醒 + 症状找药 + 家庭共享 + 买药
   ============================================================ */
(function () {
  "use strict";
  var Store = window.MedicineStore;
  var REF = (window.MEDICINE_DATA && window.MEDICINE_DATA.items) || [];
  var SYM = window.MEDICINE_SYMPTOMS || {};
  var state = { q: "", editId: null };
  var CLOUD = { app: null, auth: null, db: null, uid: null, homeId: null, ready: false };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(s) { return s || "未填写"; }
  function parseReminders(v) {
    return String(v || "").split(/[,，;；\s]+/).map(function (t) { return t.trim(); }).filter(function (t) { return /^\d{1,2}:\d{2}$/.test(t); });
  }

  /* ---------- 列表渲染 ---------- */
  function sorted(list) {
    var rank = { expired: 0, soon: 1, ok: 2, none: 3 };
    return list.slice().sort(function (a, b) {
      var ra = rank[Store.statusOf(a)];
      var rb = rank[Store.statusOf(b)];
      if (ra === undefined) ra = 9;
      if (rb === undefined) rb = 9;
      if (ra !== rb) return ra - rb;
      var da = a.expiryDate ? new Date(a.expiryDate + "T00:00:00").getTime() : Infinity;
      var db = b.expiryDate ? new Date(b.expiryDate + "T00:00:00").getTime() : Infinity;
      return da - db;
    });
  }

  function render() {
    var all = Store.load();
    var list = state.q ? all.filter(function (it) {
      return (it.name || "").toLowerCase().indexOf(state.q.toLowerCase()) !== -1 ||
             (it.category || "").indexOf(state.q) !== -1 ||
             (it.note || "").indexOf(state.q) !== -1;
    }) : all;
    list = sorted(list);

    var counts = { expired: 0, soon: 0, ok: 0, none: 0 };
    all.forEach(function (it) { counts[Store.statusOf(it)]++; });
    setText("stat-total", all.length);
    setText("stat-expired", counts.expired);
    setText("stat-soon", counts.soon);

    var box = document.getElementById("med-list");
    if (!box) return;
    if (!list.length) {
      box.innerHTML = '<li class="empty-tip">还没有药品记录。用上方表单录入第一种药吧。</li>';
      return;
    }
    box.innerHTML = "";
    list.forEach(function (it) {
      var st = Store.statusOf(it);
      var badge = { expired: "badge-danger", soon: "badge-warn", ok: "badge-ok", none: "badge-gray" }[st];
      var li = document.createElement("li");
      li.className = "med-item" + (st === "expired" ? " expired" : st === "soon" ? " soon" : "");
      var dl = Store.daysLeft(it);
      var extra = "";
      if (st === "expired") extra = "（已过期 " + Math.abs(dl) + " 天，请停止使用并按有害垃圾处理）";
      else if (st === "soon") extra = "（还剩 " + dl + " 天到期，请注意）";
      var rm = (it.reminders && it.reminders.length) ? " ｜ 服用提醒：" + esc(it.reminders.join("、")) : "";
      li.innerHTML =
        '<div class="med-name">' + esc(it.name) + '</div>' +
        '<span class="badge ' + badge + '">' + Store.statusText(st) + '</span>' +
        '<span class="badge-gray">' + esc(it.category || "未分类") + '</span>' +
        '<div class="med-meta">数量：' + esc(String(it.quantity || 1)) + ' ｜ 开封：' + esc(fmtDate(it.openedDate)) + ' ｜ 有效期至：' + esc(fmtDate(it.expiryDate)) + extra + rm + '</div>' +
        (it.note ? '<div class="med-note">备注：' + esc(it.note) + '</div>' : '') +
        '<div class="med-actions">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-edit="' + esc(it.id) + '">编辑</button> ' +
          '<button type="button" class="btn btn-green btn-sm" data-buy="' + esc(it.id) + '">🛒 买药</button> ' +
          '<button type="button" class="btn btn-danger-ghost btn-sm" data-del="' + esc(it.id) + '">删除</button>' +
        '</div>' +
        '<div class="med-buybox" id="buy-' + esc(it.id) + '"></div>';
      box.appendChild(li);
    });

    box.querySelectorAll("[data-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.confirm("确定删除这条药品记录吗？")) { removeMed(btn.dataset.del); }
      });
    });
    box.querySelectorAll("[data-edit]").forEach(function (btn) { btn.addEventListener("click", function () { startEdit(btn.dataset.edit); }); });
    box.querySelectorAll("[data-buy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.dataset.buy;
        var box2 = document.getElementById("buy-" + id);
        if (!box2) return;
        var it = Store.load().filter(function (x) { return x.id === id; })[0];
        if (!it) return;
        if (box2.innerHTML) { box2.innerHTML = ""; return; }
        if (window.BuyLinks) window.BuyLinks.render(box2, it.name);
      });
    });
  }

  function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

  /* ---------- 新增 / 编辑 / 删除 ---------- */
  function collectForm() {
    return {
      name: document.getElementById("f-name").value.trim(),
      category: document.getElementById("f-category").value,
      quantity: document.getElementById("f-quantity").value || "1",
      openedDate: document.getElementById("f-opened").value,
      expiryDate: document.getElementById("f-expiry").value,
      note: document.getElementById("f-note").value.trim(),
      reminders: parseReminders(document.getElementById("f-reminders").value)
    };
  }
  function fillForm(it) {
    document.getElementById("f-name").value = it.name || "";
    document.getElementById("f-category").value = it.category || "退热镇痛";
    document.getElementById("f-quantity").value = it.quantity || "1";
    document.getElementById("f-opened").value = it.openedDate || "";
    document.getElementById("f-expiry").value = it.expiryDate || "";
    document.getElementById("f-note").value = it.note || "";
    document.getElementById("f-reminders").value = (it.reminders || []).join(",");
  }
  function resetForm() {
    var form = document.getElementById("med-form");
    if (form) form.reset();
    state.editId = null;
    var t = document.getElementById("form-title");
    if (t) t.textContent = "➕ 录入药品";
    var cancel = document.getElementById("cancel-edit");
    if (cancel) cancel.style.display = "none";
  }
  function startEdit(id) {
    var it = Store.load().filter(function (x) { return x.id === id; })[0];
    if (!it) return;
    state.editId = id;
    fillForm(it);
    var t = document.getElementById("form-title");
    if (t) t.textContent = "✏️ 编辑药品：" + it.name;
    var cancel = document.getElementById("cancel-edit");
    if (cancel) cancel.style.display = "inline-flex";
    document.getElementById("med-form").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function removeMed(id) {
    Store.remove(id);
    if (CLOUD.ready && CLOUD.homeId) cloudDelete(id);
    render(); renderBanner(); renderFamily();
  }

  function initForm() {
    var form = document.getElementById("med-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = collectForm();
      if (!data.name) { alert("请填写药品名称。"); return; }
      if (!data.expiryDate) { alert("请填写有效期至。"); return; }
      if (state.editId) {
        Store.update(state.editId, data);
        if (CLOUD.ready && CLOUD.homeId) cloudUpdate(state.editId, data);
      } else {
        var it = Store.add(data);
        if (CLOUD.ready && CLOUD.homeId) cloudAdd(it);
      }
      resetForm();
      render(); renderBanner(); renderFamily();
    });
    var cancel = document.getElementById("cancel-edit");
    if (cancel) cancel.addEventListener("click", resetForm);
  }

  /* ---------- 今日提醒横幅 ---------- */
  function todayDoseList() {
    var now = new Date();
    var hm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    var out = [];
    Store.load().forEach(function (it) {
      if (Store.statusOf(it) === "expired" || Store.statusOf(it) === "none") return;
      var rms = it.reminders || [];
      if (!rms.length) return;
      out.push({ name: it.name, times: rms, pending: rms.filter(function (t) { return t >= hm; }) });
    });
    return out;
  }
  function renderBanner() {
    var box = document.getElementById("reminder-banner");
    if (!box) return;
    var list = todayDoseList();
    if (!list.length) { box.innerHTML = ""; box.style.display = "none"; return; }
    box.style.display = "";
    var html = '<div class="rb-title">⏰ 今天还有 <strong>' + list.length + '</strong> 种药需要服用：</div>';
    list.forEach(function (it) {
      html += '<span class="rb-item">' + esc(it.name) + '（' + esc(it.times.join("、")) + '）</span>';
    });
    box.innerHTML = html;
  }

  /* 浏览器通知（仅页面打开时尽力而为） */
  function initNotifications() {
    var btn = document.getElementById("notify-btn");
    if (!btn) return;
    if (!("Notification" in window)) { btn.style.display = "none"; return; }
    btn.addEventListener("click", function () {
      if (Notification.permission === "granted") { btn.textContent = "✅ 已开启提醒"; return; }
      Notification.requestPermission().then(function (p) {
        btn.textContent = p === "granted" ? "✅ 已开启提醒" : "未授权，仍可在页面内看到提醒";
        if (p === "granted") startNotifyLoop();
      });
    });
    if (Notification.permission === "granted") { btn.textContent = "✅ 已开启提醒"; startNotifyLoop(); }
  }
  function startNotifyLoop() {
    setInterval(function () {
      try {
        if (Notification.permission !== "granted") return;
        var now = new Date();
        var hm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
        Store.load().forEach(function (it) {
          if (Store.statusOf(it) === "expired") return;
          (it.reminders || []).forEach(function (t) {
            if (t !== hm) return;
            var key = "hfs_notify_" + new Date().toISOString().slice(0, 10) + "_" + it.id + "_" + t;
            try { if (localStorage.getItem(key)) return; localStorage.setItem(key, "1"); } catch (e) {}
            new Notification("💊 该吃药了：" + it.name, { body: "请按医嘱/说明书服用。如已服用请忽略。", tag: key });
          });
        });
      } catch (e) {}
    }, 30000);
  }

  /* ---------- 症状找药 ---------- */
  function initSymptom() {
    var btn = document.getElementById("sym-open");
    var box = document.getElementById("symptom-box");
    if (!btn || !box) return;
    btn.addEventListener("click", function () {
      var open = box.style.display !== "none";
      box.style.display = open ? "none" : "";
      if (!open) renderSymptomChips();
    });
  }
  function renderSymptomChips() {
    var box = document.getElementById("symptom-chips");
    if (!box) return;
    box.innerHTML = "";
    Object.keys(SYM).forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = s;
      b.addEventListener("click", function () { showSymptomResult(s); });
      box.appendChild(b);
    });
  }
  function showSymptomResult(sym) {
    var box = document.getElementById("symptom-result");
    if (!box) return;
    var names = SYM[sym] || [];
    var cabinet = Store.load();
    var html = '<div class="symptom-result"><h3>针对「' + esc(sym) + '」的建议</h3>';
    if (!names.length) { html += '<p class="text-light">暂无对应常备药建议，请咨询医生或药师。</p></div>'; box.innerHTML = html; return; }
    html += '<p class="text-light">以下为常备药参考；"药箱已有"表示你录入的药品名称命中了推荐项。</p>';
    names.forEach(function (n) {
      var ref = REF.filter(function (r) { return r.name === n; })[0];
      var inCab = cabinet.some(function (c) { return (c.name || "").indexOf(n.split("（")[0]) !== -1 || n.indexOf(c.name) !== -1; });
      html += '<div class="sr-item"><strong>' + esc(n) + '</strong> ' + (inCab ? '<span class="in-cabinet">✅ 药箱已有</span>' : '<span class="badge-gray">未录入</span>');
      if (ref) {
        if (ref.uses) html += '<div>' + esc(ref.uses) + '</div>';
        if (ref.points) html += '<div>用法要点：' + esc(ref.points) + '</div>';
        if (ref.caution) html += '<div class="ref-caution">⚠️ ' + esc(ref.caution) + '</div>';
      }
      var buyBoxId = "syr-buy-" + names.indexOf(n);
      html += '<div><button type="button" class="btn btn-green btn-sm" onclick="window._toggleSymBuy(\'' + buyBoxId + '\',\'' + esc(n).replace(/'/g, "&#39;") + '\')">🛒 买药</button></div>';
      html += '<div id="' + buyBoxId + '"></div>';
      html += '</div>';
    });
    html += '<div class="emergency-note">⚠️ 以上仅为科普参考，不能替代专业医疗诊断；症状持续或加重请及时就医，紧急情况拨打 120。</div></div>';
    box.innerHTML = html;
  }
  window._toggleSymBuy = function (id, name) {
    var el = document.getElementById(id);
    if (!el) return;
    if (el.innerHTML) { el.innerHTML = ""; return; }
    if (window.BuyLinks) window.BuyLinks.render(el, name);
  };

  /* ---------- 家庭共享（CloudBase） ---------- */
  function initFamily() {
    var panel = document.getElementById("family-panel");
    if (!panel) return;
    if (!window.cloudbase) {
      document.getElementById("family-status").innerHTML = '<span class="family-note">云端共享需联网环境（https）。当前为本地模式。</span>';
      return;
    }
    try {
      CLOUD.app = window.cloudbase.init({ env: "fridge-blindbox-d9foky90cf58fa93" });
      CLOUD.auth = CLOUD.app.auth();
      CLOUD.db = CLOUD.app.database();
    } catch (e) {
      document.getElementById("family-status").innerHTML = '<span class="family-note">云端初始化失败：' + esc(e.message) + '</span>';
      return;
    }
    CLOUD.auth.signInAnonymously().then(function () {
      CLOUD.ready = true;
      var fam = window.FamilyStore.get();
      if (fam && fam.homeId) { CLOUD.homeId = fam.homeId; pullCloud(); }
      renderFamily();
    }).catch(function (e) {
      document.getElementById("family-status").innerHTML = '<span class="family-note">匿名登录失败（可能未在控制台开启匿名登录）：' + esc(e.message) + '</span>';
    });
  }
  function renderFamily() {
    var box = document.getElementById("family-status");
    if (!box) return;
    var fam = window.FamilyStore.get();
    if (!CLOUD.ready) { box.innerHTML = '<span class="family-note">正在连接云端…</span>'; return; }
    if (fam && fam.homeId) {
      box.innerHTML = '<div>🏠 已加入家庭：<span class="fp-code">' + esc(fam.code || "") + '</span></div>' +
        '<div class="family-note">药品已云端同步，家人共用同一药箱。</div>' +
        '<button type="button" class="btn btn-danger-ghost btn-sm mt-2" id="fp-leave">退出家庭</button>';
      var leave = document.getElementById("fp-leave");
      if (leave) leave.addEventListener("click", leaveHome);
    } else {
      box.innerHTML = '<div class="family-note">创建家庭后，其他成员输入家庭码即可加入，共同管理同一个药箱。</div>' +
        '<div class="buy-links-row mt-2">' +
        '<button type="button" class="btn btn-primary btn-sm" id="fp-create">🏠 创建家庭</button>' +
        '<input type="text" id="fp-code-input" placeholder="输入家庭码" style="max-width:180px">' +
        '<button type="button" class="btn btn-ghost btn-sm" id="fp-join">加入家庭</button>' +
        '</div>';
      document.getElementById("fp-create").addEventListener("click", createHome);
      document.getElementById("fp-join").addEventListener("click", joinHome);
    }
  }
  function createHome() {
    callFamily({ action: "createHome" }).then(function (r) {
      var fam = { homeId: r.homeId, code: r.code };
      window.FamilyStore.set(fam);
      CLOUD.homeId = r.homeId;
      uploadAllLocal();
      renderFamily(); render();
    }).catch(function (e) { alert("创建家庭失败：" + e.message); });
  }
  function joinHome() {
    var code = document.getElementById("fp-code-input").value.trim();
    if (!code) { alert("请输入家庭码。"); return; }
    callFamily({ action: "joinHome", code: code }).then(function (r) {
      window.FamilyStore.set({ homeId: r.homeId, code: code.toUpperCase() });
      CLOUD.homeId = r.homeId;
      uploadAllLocal();
      pullCloud();
      renderFamily(); render();
    }).catch(function (e) { alert("加入家庭失败：" + e.message + "（请核对家庭码）"); });
  }
  function leaveHome() {
    if (!CLOUD.homeId) { window.FamilyStore.clear(); renderFamily(); return; }
    callFamily({ action: "leaveHome", homeId: CLOUD.homeId }).then(function () {
      window.FamilyStore.clear();
      CLOUD.homeId = null;
      renderFamily();
    }).catch(function () {
      window.FamilyStore.clear();
      CLOUD.homeId = null;
      renderFamily();
    });
  }
  function callFamily(params) {
    return CLOUD.app.callFunction({ name: "family", data: params }).then(function (res) {
      var d = (res && res.result) || res;
      if (!d) throw new Error("云函数无返回");
      if (d.code !== 0) throw new Error(d.msg || "未知错误");
      return d.data || {};
    });
  }
  function uploadAllLocal() {
    if (!CLOUD.ready || !CLOUD.homeId) return;
    Store.load().forEach(function (it) {
      if (it._cloud) return;
      CLOUD.db.collection("medicines").add({ data: cloudShape(it) }).then(function (r) {
        Store.update(it.id, { _cloud: true, _cloudId: r.id });
      }).catch(function () {});
    });
  }
  function cloudAdd(it) {
    CLOUD.db.collection("medicines").add({ data: cloudShape(it) }).then(function (r) {
      Store.update(it.id, { _cloud: true, _cloudId: r.id });
    }).catch(function () {});
  }
  function cloudUpdate(id, data) {
    var it = Store.load().filter(function (x) { return x.id === id; })[0];
    if (!it || !it._cloudId) return;
    CLOUD.db.collection("medicines").doc(it._cloudId).update({ data: cloudShape(Object.assign({}, it, data)) }).catch(function () {});
  }
  function cloudDelete(id) {
    var it = Store.load().filter(function (x) { return x.id === id; })[0];
    if (it && it._cloudId) CLOUD.db.collection("medicines").doc(it._cloudId).remove().catch(function () {});
  }
  function cloudShape(it) {
    return {
      homeId: CLOUD.homeId,
      name: it.name, category: it.category, quantity: it.quantity,
      openedDate: it.openedDate, expiryDate: it.expiryDate, note: it.note,
      reminders: it.reminders || [], clientId: it.id, updatedAt: new Date().toISOString()
    };
  }
  function pullCloud() {
    if (!CLOUD.ready || !CLOUD.homeId) return;
    CLOUD.db.collection("medicines").where({ "data.homeId": CLOUD.homeId }).get().then(function (res) {
      var items = res.data || [];
      var local = Store.load();
      var merged = items.map(function (c) {
        var f = c.data || c;
        return { id: f.clientId || c._id, _cloud: true, _cloudId: c._id, name: f.name, category: f.category || "其他", quantity: f.quantity || "1", openedDate: f.openedDate || "", expiryDate: f.expiryDate || "", note: f.note || "", reminders: f.reminders || [] };
      });
      local.forEach(function (l) { if (!l._cloud) merged.push(l); });
      Store.save(merged);
      render(); renderBanner();
    }).catch(function () {});
  }

  /* ---------- 常备药参考 / 常识 ---------- */
  function initRef() {
    var box = document.getElementById("med-ref");
    if (!box || !REF.length) return;
    box.innerHTML = "";
    REF.forEach(function (it) {
      var d = document.createElement("div");
      d.className = "ref-item";
      var buyBoxId = "ref-buy-" + REF.indexOf(it);
      d.innerHTML =
        '<div class="ref-name">' + esc(it.name) + ' <span class="badge-gray">' + esc(it.category) + '</span></div>' +
        '<div class="ref-use">用途：' + esc(it.uses) + '</div>' +
        '<div class="ref-use">要点：' + esc(it.points) + '</div>' +
        (it.caution ? '<div class="ref-caution">⚠️ ' + esc(it.caution) + '</div>' : '') +
        (it.symptoms && it.symptoms.length ? '<div class="text-light" style="font-size:.85rem">适用症状：' + esc(it.symptoms.join("、")) + '</div>' : '') +
        '<div><button type="button" class="btn btn-green btn-sm" onclick="window._toggleRefBuy(\'' + buyBoxId + '\',\'' + esc(it.name).replace(/'/g, "&#39;") + '\')">🛒 买药</button></div>' +
        '<div id="' + buyBoxId + '"></div>' +
        '<div class="source-line">来源：' + esc(it.source.org) + '《' + esc(it.source.title) + '》（' + esc(it.source.date) + '）</div>';
      box.appendChild(d);
    });
  }
  window._toggleRefBuy = function (id, name) {
    var el = document.getElementById(id);
    if (!el) return;
    if (el.innerHTML) { el.innerHTML = ""; return; }
    if (window.BuyLinks) window.BuyLinks.render(el, name);
  };

  function initSense() {
    var box = document.getElementById("med-sense");
    if (!box || !window.MEDICINE_DATA) return;
    box.innerHTML = "";
    (window.MEDICINE_DATA.commonSense || []).forEach(function (it) {
      var d = document.createElement("div");
      d.className = "ref-item";
      d.innerHTML =
        '<div class="ref-name">' + esc(it.title) + '</div>' +
        '<div class="ref-use">' + esc(it.content) + '</div>' +
        '<div class="source-line">来源：' + esc(it.source.org) + '《' + esc(it.source.title) + '》（' + esc(it.source.date) + '）</div>';
      box.appendChild(d);
    });
  }

  function initSearch() {
    var input = document.getElementById("med-search");
    if (!input) return;
    input.addEventListener("input", function () { state.q = input.value; render(); });
  }

  function init() {
    initForm();
    initSearch();
    initRef();
    initSense();
    initSymptom();
    initNotifications();
    initFamily();
    renderBanner();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
