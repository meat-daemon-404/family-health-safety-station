/* ============================================================
   急救百科 V2：分类筛选 + 模糊搜索 + 详情弹窗 + 语音播报 + 短信求助
   ============================================================ */
(function () {
  "use strict";
  var data = window.FIRSTAID_DATA || [];
  var state = { cat: "全部", q: "" };

  function textOf(it) {
    return [it.title, it.category, it.short, it.icon]
      .concat(it.keywords || [])
      .concat(it.symptoms || [])
      .concat(it.steps || [])
      .join(" ");
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function filtered() {
    var list = data.slice();
    if (state.cat !== "全部") list = list.filter(function (it) { return it.category === state.cat; });
    if (state.q) list = window.FuzzySearch.search(list, state.q, textOf);
    return list;
  }

  function renderChips() {
    var box = document.getElementById("fa-chips");
    if (!box) return;
    var cats = ["全部"].concat(data.map(function (it) { return it.category; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
    box.innerHTML = "";
    cats.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (c === state.cat ? " active" : "");
      b.textContent = c;
      b.addEventListener("click", function () { state.cat = c; render(); });
      box.appendChild(b);
    });
  }

  function renderGrid() {
    var grid = document.getElementById("fa-grid");
    if (!grid) return;
    var list = filtered();
    if (!list.length) {
      grid.innerHTML = '<div class="empty-tip">没有找到相关内容，换个关键词试试，例如"烫""卡喉""发烧"。</div>';
      return;
    }
    grid.innerHTML = "";
    list.forEach(function (it) {
      var card = document.createElement("div");
      card.className = "fa-card";
      card.setAttribute("role", "button");
      card.tabIndex = 0;
      card.innerHTML =
        '<div class="fa-icon">' + esc(it.icon) + '</div>' +
        '<h3>' + esc(it.title) + '</h3>' +
        '<div class="fa-urg"><span class="badge ' + (it.urgency === "高" ? "badge-danger" : it.urgency === "中高" ? "badge-warn" : "badge-ok") + '">紧急度：' + esc(it.urgency) + '</span> <span class="badge-gray">' + esc(it.category) + '</span></div>' +
        '<div class="fa-desc">' + esc(it.short) + '</div>' +
        '<div class="fa-more">查看急救步骤 →</div>';
      function open() { openModal(it); }
      card.addEventListener("click", open);
      card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      grid.appendChild(card);
    });
  }

  /* ---------- 语音播报 ---------- */
  function speakSteps(steps, lis) {
    stopSpeak();
    if (!("speechSynthesis" in window)) { highlightFallback(steps, lis); return; }
    var i = 0;
    function next() {
      if (i >= steps.length) { stopSpeak(); return; }
      if (lis && lis[i]) {
        lis.forEach(function (l) { l.classList.remove("step-hl"); });
        lis[i].classList.add("step-hl");
      }
      var ut = new SpeechSynthesisUtterance(steps[i]);
      ut.lang = "zh-CN";
      ut.rate = 0.95;
      ut.onend = function () { i++; next(); };
      window.speechSynthesis.speak(ut);
    }
    next();
  }
  function stopSpeak() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    document.querySelectorAll("#fa-modal .step-hl").forEach(function (l) { l.classList.remove("step-hl"); });
  }
  function highlightFallback(steps, lis) {
    var i = 0;
    var t = setInterval(function () {
      if (i >= steps.length) { clearInterval(t); return; }
      lis.forEach(function (l) { l.classList.remove("step-hl"); });
      if (lis[i]) lis[i].classList.add("step-hl");
      i++;
    }, 1200);
    window.__hlTimer = t;
  }

  /* ---------- 短信求助 ---------- */
  function sendSms() {
    var num = window.ContactStore ? window.ContactStore.get() : "";
    if (!num) {
      alert("请先在页面下方的「紧急联系人」设置里填写号码。");
      return;
    }
    var msg = "我需要急救，请帮我拨打 120。";
    var openSms = function (loc) {
      if (loc) msg += " 我的大致位置：" + loc;
      var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent || "");
      var href = ios ? ("sms:" + num + "&body=" + encodeURIComponent(msg)) : ("sms:" + num + "?body=" + encodeURIComponent(msg));
      window.location.href = href;
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (p) {
        openSms(p.coords.latitude.toFixed(4) + "," + p.coords.longitude.toFixed(4));
      }, function () { openSms(""); }, { timeout: 8000, maximumAge: 60000 });
    } else { openSms(""); }
  }

  /* ---------- 详情弹窗 ---------- */
  function openModal(it) {
    stopSpeak();
    var mask = document.getElementById("fa-modal");
    if (!mask) return;
    var html = "";
    html += '<div class="modal">';
    html += '<button type="button" class="modal-close" aria-label="关闭">✕</button>';
    html += '<h2>' + esc(it.icon) + ' ' + esc(it.title) + '</h2>';
    html += '<p><span class="badge ' + (it.urgency === "高" ? "badge-danger" : it.urgency === "中高" ? "badge-warn" : "badge-ok") + '">紧急度：' + esc(it.urgency) + '</span> <span class="badge-gray">' + esc(it.category) + '</span></p>';

    html += '<h3 class="section-title" style="margin-top:16px">识别症状</h3><ul class="do-list">';
    (it.symptoms || []).forEach(function (s) { html += '<li>' + esc(s) + '</li>'; });
    html += '</ul>';

    html += '<h3 class="section-title" style="margin-top:16px">急救步骤</h3><ol class="step-list" id="modal-steps">';
    (it.steps || []).forEach(function (s) { html += '<li>' + esc(s) + '</li>'; });
    html += '</ol>';

    html += '<div class="buy-links-row">' +
      '<button type="button" class="btn btn-primary" id="modal-speak">🔊 语音播报步骤</button>' +
      '<button type="button" class="btn btn-ghost" id="modal-stop">⏹ 停止</button>' +
      '<button type="button" class="btn btn-green" id="modal-sms">📨 发送求助短信</button>' +
      '<a class="btn btn-danger" href="tel:120">🚑 拨打 120</a>' +
      '</div>';

    if (it.forbidden && it.forbidden.length) {
      html += '<h3 class="section-title" style="margin-top:16px">禁忌 / 错误做法</h3><ul class="forbid-list">';
      it.forbidden.forEach(function (s) { html += '<li>' + esc(s) + '</li>'; });
      html += '</ul>';
    }

    html += '<h3 class="section-title" style="margin-top:16px">何时必须就医</h3><p>' + esc(it.whenToSeeDoctor) + '</p>';

    html += '<div class="emergency-note">🚑 紧急情况请立刻拨打 120（火警 119、报警 110）。</div>';

    html += '<div class="source-line"><strong>参考来源：</strong>';
    (it.sources || []).forEach(function (s, i) {
      html += '<div style="margin-top:6px">' + (i + 1) + '. ' + esc(s.org) + '《' + esc(s.title) + '》（' + esc(s.date) + '）<br><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.url) + '</a></div>';
    });
    html += '<div style="margin-top:6px">⚠️ 以上为科普整理，急救请以正规培训与官方最新指南为准。</div></div>';

    html += '<div class="source-line">🎬 视频教学：本模块视频内容后续接入（版权与制作原因），敬请期待。</div>';
    html += '</div>';

    mask.innerHTML = html;
    mask.classList.add("show");
    mask.querySelector(".modal-close").addEventListener("click", closeModal);
    mask.addEventListener("click", function (e) { if (e.target === mask) closeModal(); });
    document.addEventListener("keydown", function escKey(e) { if (e.key === "Escape") { closeModal(); document.removeEventListener("keydown", escKey); } });
    document.body.style.overflow = "hidden";

    var speak = document.getElementById("modal-speak");
    if (speak) speak.addEventListener("click", function () {
      var lis = Array.prototype.slice.call(mask.querySelectorAll("#modal-steps li"));
      speakSteps(it.steps, lis);
    });
    var stop = document.getElementById("modal-stop");
    if (stop) stop.addEventListener("click", stopSpeak);
    var sms = document.getElementById("modal-sms");
    if (sms) sms.addEventListener("click", sendSms);
  }

  function closeModal() {
    stopSpeak();
    var mask = document.getElementById("fa-modal");
    if (mask) mask.classList.remove("show");
    document.body.style.overflow = "";
  }

  /* ---------- 紧急联系人设置 ---------- */
  function initContact() {
    var input = document.getElementById("contact-num");
    var btn = document.getElementById("contact-save");
    if (!input || !btn || !window.ContactStore) return;
    input.value = window.ContactStore.get();
    btn.addEventListener("click", function () {
      window.ContactStore.set(input.value);
      alert("紧急联系人已保存（仅存在本机浏览器）。");
    });
  }

  function render() {
    renderGrid();
    var count = document.getElementById("fa-count");
    if (count) count.textContent = "共 " + filtered().length + " 条";
  }

  function init() {
    renderChips();
    initContact();
    var input = document.getElementById("fa-search");
    if (input) {
      input.addEventListener("input", function () { state.q = input.value; render(); });
      var params = new URLSearchParams(location.search);
      var q = params.get("q");
      if (q) { input.value = q; state.q = q; }
    }
    var floatSms = document.getElementById("float-sms");
    if (floatSms) floatSms.addEventListener("click", function (e) { e.preventDefault(); sendSms(); });
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
