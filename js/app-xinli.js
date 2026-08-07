/* ============================================================
   心理健康 V2：情绪自测（PHQ-9 / GAD-7）+ 心情日记 + 正念 + CBT + 热线
   ============================================================ */
(function () {
  "use strict";
  var PSY = window.PSYCH_DATA || {};
  var MOODS = [
    { val: 3, emoji: "😊", label: "不错" },
    { val: 2, emoji: "😐", label: "一般" },
    { val: 1, emoji: "😞", label: "低落" }
  ];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- 情绪自测 ---------- */
  function buildQuiz(key, boxId, submitId, resultId) {
    var quiz = PSY[key];
    var box = document.getElementById(boxId);
    if (!box || !quiz) return;
    box.innerHTML = "";
    quiz.questions.forEach(function (q, qi) {
      var item = document.createElement("div");
      item.className = "q-item";
      var html = '<div class="q-text">' + (qi + 1) + '. ' + esc(q) + '</div><div class="q-opts">';
      quiz.options.forEach(function (opt) {
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

  /* ---------- 心情日记 ---------- */
  var moodSelected = null;
  function initMood() {
    var wrap = document.getElementById("mood-btns");
    var saveBtn = document.getElementById("mood-save");
    if (!wrap || !window.MoodStore) return;
    wrap.innerHTML = "";
    MOODS.forEach(function (m) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "mood-btn";
      b.textContent = m.emoji;
      b.title = m.label;
      b.dataset.val = m.val;
      b.addEventListener("click", function () {
        moodSelected = m.val;
        wrap.querySelectorAll(".mood-btn").forEach(function (x) { x.classList.remove("selected"); });
        b.classList.add("selected");
      });
      wrap.appendChild(b);
    });

    var today = window.fmtDate(new Date());
    var entry = window.MoodStore.getEntry(today);
    if (entry) {
      moodSelected = entry.mood;
      wrap.querySelectorAll(".mood-btn").forEach(function (x) {
        if (parseInt(x.dataset.val, 10) === entry.mood) x.classList.add("selected");
      });
      var note = document.getElementById("mood-note");
      if (note) note.value = entry.note || "";
    }

    if (saveBtn) saveBtn.addEventListener("click", function () {
      if (!moodSelected) { alert("请先选择一个表情。"); return; }
      var note = document.getElementById("mood-note").value.trim();
      window.MoodStore.saveEntry(today, moodSelected, note);
      renderMoodChart(14);
      renderMoodHistory();
      saveBtn.textContent = "✅ 已保存今天的记录";
      setTimeout(function () { saveBtn.textContent = "保存记录"; }, 1500);
    });

    var range = document.getElementById("mood-range");
    if (range) {
      var btns = range.querySelectorAll(".chip");
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          btns.forEach(function (x) { x.classList.remove("active"); });
          b.classList.add("active");
          renderMoodChart(parseInt(b.dataset.days, 10) || 14);
        });
      });
    }
    renderMoodChart(14);
    renderMoodHistory();
  }

  function renderMoodChart(days) {
    var box = document.getElementById("mood-chart");
    if (!box || !window.MoodStore) return;
    var data = window.MoodStore.lastNDays(days);
    if (!data.length) {
      box.innerHTML = '<p class="mood-legend">还没有记录。每天花 10 秒记一下心情，一周后就能看到自己的情绪曲线。</p>';
      return;
    }
    var W = 640, H = 200, pad = 34;
    var vals = data.map(function (d) { return d.mood; });
    var maxV = 3, minV = 1;
    function x(i) { return pad + (data.length === 1 ? (W - pad * 2) / 2 : (W - pad * 2) * i / (data.length - 1)); }
    function y(v) { return H - pad - (H - pad * 2) * (v - minV) / (maxV - minV); }
    var pts = vals.map(function (v, i) { return x(i) + "," + y(v); }).join(" ");
    var svg = '<svg class="mood-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="心情曲线">';
    // 网格线
    for (var v = 1; v <= 3; v++) {
      svg += '<line x1="' + pad + '" y1="' + y(v) + '" x2="' + (W - pad) + '" y2="' + y(v) + '" stroke="#DCE4EC" stroke-width="1"/>';
      svg += '<text x="6" y="' + (y(v) + 5) + '" font-size="13" fill="#5C6B7A">' + (v === 3 ? "😊" : v === 2 ? "😐" : "😞") + '</text>';
    }
    svg += '<polyline points="' + pts + '" fill="none" stroke="#1E6FB8" stroke-width="3" stroke-linejoin="round"/>';
    data.forEach(function (d, i) {
      svg += '<circle cx="' + x(i) + '" cy="' + y(d.mood) + '" r="4" fill="#1E6FB8"/>';
      if (i % 2 === 0 || data.length <= 8) {
        svg += '<text x="' + x(i) + '" y="' + (H - 8) + '" font-size="11" fill="#5C6B7A" text-anchor="middle">' + esc(d.date.slice(5)) + '</text>';
      }
    });
    svg += '</svg>';
    box.innerHTML = svg;
  }

  function renderMoodHistory() {
    var box = document.getElementById("mood-history");
    if (!box || !window.MoodStore) return;
    var data = window.MoodStore.lastNDays(14).filter(function (d) { return d; });
    if (!data.length) { box.innerHTML = ""; return; }
    var html = "<strong>最近记录：</strong>";
    data.slice(-7).reverse().forEach(function (d) {
      var emo = (d.mood === 3 ? "😊" : d.mood === 2 ? "😐" : "😞");
      html += '<span class="badge-gray" style="margin-right:6px">' + d.date.slice(5) + ' ' + emo + (d.note ? " " + esc(d.note) : "") + '</span>';
    });
    box.innerHTML = html;
  }

  /* ---------- 正念 / CBT / 热线（保持原有） ---------- */
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
    initMood();
    renderMindfulness();
    renderCBT();
    renderHotlines();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
