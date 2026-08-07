/* ============================================================
   首页：今日服药提醒横幅
   ============================================================ */
(function () {
  "use strict";
  function todayDoseList() {
    if (!window.MedicineStore) return [];
    var Store = window.MedicineStore;
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
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function render() {
    var box = document.getElementById("home-reminder");
    if (!box) return;
    var list = todayDoseList();
    if (!list.length) { box.style.display = "none"; return; }
    box.style.display = "";
    var html = '<div class="rb-title">⏰ 今天还有 <strong>' + list.length + '</strong> 种药需要服用：</div>';
    list.forEach(function (it) {
      html += '<span class="rb-item">' + esc(it.name) + '（' + esc(it.times.join("、")) + '）</span>';
    });
    html += '<a class="btn btn-ghost btn-sm" href="' + (window.BASE || "./") + 'pages/yixiang.html">去药箱查看 →</a>';
    box.innerHTML = html;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
