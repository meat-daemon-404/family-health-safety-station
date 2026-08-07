/* ============================================================
   心理健康页面逻辑：情绪自测（PHQ-9 / GAD-7）+ 正念练习 + CBT + 心理援助热线
   ============================================================ */
(function () {
  "use strict";
  var PSY = window.PSYCH_DATA || {};

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- 自测量表 ---------- */
  function buildQuiz(key, boxId, submitId, resultId) {
    var quiz = PSY[key];
    var box = document.getElementById(boxId);
    if (!box || !quiz) return;
    box.innerHTML = "";
    quiz.questions.forEach(function (q, qi) {
      var item = document.createElement("div");
      item.className = "q-item";
      var html = '<div class="q-text">' + (qi + 1) + '. ' + esc(q) + '</div><div class="q-opts">';
      quiz.options.forEach(function (opt, oi) {
        html += '<label><input type="radio" name="' + esc(key) + '_q' + qi + '" value="' + opt.score + '"> ' + esc(opt.label) + '</label>';
      });
      html += '</div>';
      item.innerHTML = html;
      box.appendChild(item);
    });

    var btn = document.getElementById(submitId);
    var res = document.getElementById(resultId);
    if (btn) btn.addEventListener("click", function () {
      var total = 0, answered = 0;
      quiz.questions.forEach(function (q, qi) {
        var checked = box.querySelector('input[name="' + key + '_q' + qi + '"]:checked');
        if (checked) { total += parseInt(checked.value, 10); answered++; }
      });
      if (answered < quiz.questions.length) {
        res.innerHTML = '<div class="result-panel warn">还有 ' + (quiz.questions.length - answered) + ' 题未作答，请完成全部题目后再查看结果。</div>';
        return;
      }
      var band = null;
      (quiz.bands || []).forEach(function (b) { if (total >= b.min && total <= b.max) band = b; });
      var positive = total >= (quiz.positiveCut || 10);
      var html = '<div class="result-panel' + (positive ? " warn" : "") + '">';
      html += '<div class="score">' + total + ' 分</div>';
      html += '<p><strong>结果解读：</strong>' + (band ? esc(band.label) : "超出常规范围") + '。</p>';
      html += '<p><strong>说明：</strong>本量表仅用于筛查参考，<strong>不能替代专业诊断</strong>。' + (positive
        ? '你的得分达到筛查阳性标准，建议尽快到精神心理专科或综合医院心理科就诊，由医生进一步评估；如有需要可先拨打 12356 全国心理援助热线倾诉。'
        : '如症状持续两周以上或影响生活、工作，也建议及时咨询专业医生。') + '</p>';
      html += '<p style="margin-top:8px">📞 需要倾诉：全国统一心理援助热线 <strong>12356</strong>；紧急情况请拨打 120/110。</p>';
      html += '</div>';
      res.innerHTML = html;
    });
  }

  /* ---------- 正念练习 ---------- */
  function renderMindfulness() {
    var box = document.getElementById("mindfulness");
    if (!box || !PSY.mindfulness) return;
    box.innerHTML = "";
    PSY.mindfulness.forEach(function (p) {
      var d = document.createElement("div");
      d.className = "practice";
      var html = '<h3>' + esc(p.icon) + ' ' + esc(p.title) + '</h3><ol class="step-list">';
      p.steps.forEach(function (s) { html += '<li>' + esc(s) + '</li>'; });
      html += '</ol><div class="note-box">💡 ' + esc(p.tips) + '</div>';
      d.innerHTML = html;
      box.appendChild(d);
    });
  }

  /* ---------- CBT ---------- */
  function renderCBT() {
    var box = document.getElementById("cbt");
    if (!box || !PSY.cbt) return;
    var c = PSY.cbt;
    var html = '<p>' + esc(c.description) + '</p>';
    html += '<table class="cbt-table"><thead><tr>';
    c.columns.forEach(function (col) { html += '<th>' + esc(col) + '</th>'; });
    html += '</tr></thead><tbody><tr>';
    var ex = c.example;
    html += '<td>' + esc(ex.situation) + '</td><td>' + esc(ex.thought) + '</td><td>' + esc(ex.emotion) + '</td>';
    html += '<td>' + esc(ex.for) + '</td><td>' + esc(ex.against) + '</td><td>' + esc(ex.alternative) + '</td>';
    html += '</tr></tbody></table>';
    html += '<div class="note-box"><strong>练习提示：</strong><ul style="padding-left:18px">';
    c.tips.forEach(function (t) { html += '<li>' + esc(t) + '</li>'; });
    html += '</ul></div>';
    box.innerHTML = html;
  }

  /* ---------- 热线 ---------- */
  function renderHotlines() {
    var box = document.getElementById("hotlines");
    if (!box || !PSY.hotlines) return;
    box.innerHTML = "";
    PSY.hotlines.forEach(function (h) {
      var d = document.createElement("div");
      d.className = "hotline-item";
      d.innerHTML =
        '<div class="hl-name">' + esc(h.name) + '</div>' +
        '<a class="hl-num" href="tel:' + esc(String(h.number).replace(/[^0-9+]/g, "")) + '">' + esc(h.number) + '</a>' +
        '<div class="hl-meta">' + esc(h.hours) + ' ｜ ' + esc(h.desc) + '</div>' +
        '<div class="source-line">来源：' + esc(h.source.org) + '《' + esc(h.source.title) + '》（' + esc(h.source.date) + '）</div>';
      box.appendChild(d);
    });
    var crisis = document.getElementById("crisis-note");
    if (crisis && PSY.crisisNote) crisis.innerHTML = '<div class="emergency-note">💛 ' + esc(PSY.crisisNote) + '</div>';
  }

  /* ---------- 页签 ---------- */
  function initTabs() {
    var btns = document.querySelectorAll(".tab-btn");
    var panels = {
      "tab-quiz": document.getElementById("panel-quiz"),
      "tab-mind": document.getElementById("panel-mind"),
      "tab-cbt": document.getElementById("panel-cbt"),
      "tab-hot": document.getElementById("panel-hot")
    };
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        Object.keys(panels).forEach(function (k) {
          if (panels[k]) panels[k].style.display = (k === b.dataset.tab) ? "" : "none";
        });
      });
    });
  }

  function init() {
    initTabs();
    buildQuiz("phq9", "phq9-questions", "phq9-submit", "phq9-result");
    buildQuiz("gad7", "gad7-questions", "gad7-submit", "gad7-result");
    renderMindfulness();
    renderCBT();
    renderHotlines();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
