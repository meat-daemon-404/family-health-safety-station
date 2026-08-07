/* ============================================================
   情绪急救页：4-7-8 呼吸引导 + 心理援助热线 + 安抚文字
   ============================================================ */
(function () {
  "use strict";
  var timer = null;
  var running = false;
  var PHASES = [
    { key: "in", cls: "phase-in", label: "吸气…", ms: 4000 },
    { key: "hold", cls: "phase-hold", label: "屏息…", ms: 7000 },
    { key: "out", cls: "phase-out", label: "呼气…", ms: 8000 }
  ];
  var step = 0;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function tick() {
    var ph = PHASES[step % PHASES.length];
    var circle = document.getElementById("breath-circle");
    var label = document.getElementById("breath-label");
    var text = document.getElementById("breath-text");
    if (circle) { circle.className = "breath-circle " + ph.cls; }
    if (label) label.textContent = ph.label;
    if (text) text.textContent = ph.key === "in" ? "🌬️" : ph.key === "hold" ? "😌" : "🍃";
    step++;
    timer = setTimeout(tick, ph.ms);
  }

  function start() {
    if (running) return;
    running = true;
    step = 0;
    var btn = document.getElementById("breath-toggle");
    if (btn) { btn.textContent = "⏸ 停止练习"; btn.classList.remove("btn-green"); btn.classList.add("btn-danger-ghost"); }
    tick();
  }
  function stop() {
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    var circle = document.getElementById("breath-circle");
    var label = document.getElementById("breath-label");
    var text = document.getElementById("breath-text");
    if (circle) circle.className = "breath-circle";
    if (label) label.textContent = "准备好了就点击开始";
    if (text) text.textContent = "🧘";
    var btn = document.getElementById("breath-toggle");
    if (btn) { btn.textContent = "▶ 开始呼吸练习"; btn.classList.add("btn-green"); btn.classList.remove("btn-danger-ghost"); }
  }

  function renderHotlines() {
    var box = document.getElementById("qx-hotlines");
    if (!box || !window.PSYCH_DATA || !window.PSYCH_DATA.hotlines) return;
    box.innerHTML = "";
    window.PSYCH_DATA.hotlines.slice(0, 4).forEach(function (h) {
      var d = document.createElement("div");
      d.className = "hotline-item";
      d.innerHTML =
        '<div class="hl-name">' + esc(h.name) + '</div>' +
        '<a class="hl-num" href="tel:' + esc(String(h.number).replace(/[^0-9+]/g, "")) + '">' + esc(h.number) + '</a>' +
        '<div class="hl-meta">' + esc(h.hours) + '</div>';
      box.appendChild(d);
    });
  }

  function init() {
    var btn = document.getElementById("breath-toggle");
    if (btn) btn.addEventListener("click", function () { if (running) stop(); else start(); });
    renderHotlines();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
