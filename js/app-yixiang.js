/* ============================================================
   家庭药箱页面逻辑：药品录入（localStorage）+ 列表 + 到期提醒 + 查询
   ============================================================ */
(function () {
  "use strict";
  var Store = window.MedicineStore;
  var REF = (window.MEDICINE_DATA && window.MEDICINE_DATA.items) || [];
  var state = { q: "" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtDate(s) {
    return s || "未填写";
  }

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
    document.getElementById("stat-total").textContent = all.length;
    document.getElementById("stat-expired").textContent = counts.expired;
    document.getElementById("stat-soon").textContent = counts.soon;

    var box = document.getElementById("med-list");
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
      li.innerHTML =
        '<div class="med-name">' + esc(it.name) + '</div>' +
        '<span class="badge ' + badge + '">' + Store.statusText(st) + '</span>' +
        '<span class="badge-gray">' + esc(it.category || "未分类") + '</span>' +
        '<div class="med-meta">数量：' + esc(String(it.quantity || 1)) + ' ｜ 开封日期：' + esc(fmtDate(it.openedDate)) + ' ｜ 有效期至：' + esc(fmtDate(it.expiryDate)) + extra + '</div>' +
        (it.note ? '<div class="med-note">备注：' + esc(it.note) + '</div>' : '') +
        '<div class="med-actions"><button type="button" class="btn btn-danger-ghost" data-id="' + esc(it.id) + '">删除</button></div>';
      box.appendChild(li);
    });
    box.querySelectorAll("[data-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.confirm("确定删除这条药品记录吗？")) {
          Store.remove(btn.dataset.id);
          render();
        }
      });
    });
  }

  function initForm() {
    var form = document.getElementById("med-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("f-name").value.trim();
      if (!name) { alert("请填写药品名称。"); return; }
      Store.add({
        name: name,
        category: document.getElementById("f-category").value,
        quantity: document.getElementById("f-quantity").value || "1",
        openedDate: document.getElementById("f-opened").value,
        expiryDate: document.getElementById("f-expiry").value,
        note: document.getElementById("f-note").value.trim()
      });
      form.reset();
      render();
    });
  }

  function initSearch() {
    var input = document.getElementById("med-search");
    if (!input) return;
    input.addEventListener("input", function () { state.q = input.value; render(); });
  }

  function initRef() {
    var box = document.getElementById("med-ref");
    if (!box || !REF.length) return;
    box.innerHTML = "";
    REF.forEach(function (it) {
      var d = document.createElement("div");
      d.className = "ref-item";
      d.innerHTML =
        '<div class="ref-name">' + esc(it.name) + ' <span class="badge-gray">' + esc(it.category) + '</span></div>' +
        '<div class="ref-use">用途：' + esc(it.uses) + '</div>' +
        '<div class="ref-use">要点：' + esc(it.points) + '</div>' +
        (it.caution ? '<div class="ref-caution">⚠️ ' + esc(it.caution) + '</div>' : '') +
        '<div class="source-line">来源：' + esc(it.source.org) + '《' + esc(it.source.title) + '》（' + esc(it.source.date) + '）</div>';
      box.appendChild(d);
    });
  }

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

  function init() {
    initForm();
    initSearch();
    initRef();
    initSense();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
