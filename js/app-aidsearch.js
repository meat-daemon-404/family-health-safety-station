/* ============================================================
   AI 急救问答（在线免费）
   - CloudBase 匿名登录 -> 调用云函数 aidsearch（腾讯混元 hy3）
   - file:// 或未联网时优雅降级为提示，不影响本地使用
   ============================================================ */
(function () {
  "use strict";
  var ENV = "fridge-blindbox-d9foky90cf58fa93";
  var app = null;
  var busy = false;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }


  function isSafeHost() {
    var h = location.hostname || "";
    if (!h) return false;
    if (h === "localhost" || h === "127.0.0.1") return true;
    return h === "fridge-blindbox-d9foky90cf58fa93-1463452526.tcloudbaseapp.com"
      || h.endsWith(".tcloudbaseapp.com")
      || h.endsWith(".webapps.tcloudbase.com");
  }

    function renderAnswer(box, text) {
    var lines = String(text || "").split(/\r?\n/);
    box.innerHTML = lines.map(function (l) {
      var t = l.trim();
      if (!t) return "";
      return '<div class="ai-line">' + esc(t) + "</div>";
    }).join("");
  }

  function init() {
    var input = document.getElementById("ai-q");
    var btn = document.getElementById("ai-ask");
    var status = document.getElementById("ai-status");
    var answer = document.getElementById("ai-answer");
    if (!input || !btn || !status || !answer) return;

    if (location.protocol === "file:") {
      status.innerHTML = '<span class="family-note">当前为本地模式（file://）：AI 问答需在联网网页（https）中使用；下方急救百科与模糊搜索仍可正常使用。</span>';
      btn.disabled = true;
      return;
    }
    if (!window.cloudbase) {
      status.innerHTML = '<span class="family-note">⚠️ AI 问答需要联网环境。请在部署后的网页（https）中使用；急救内容仍可直接在下方搜索。</span>';
      btn.disabled = true;
      return;
    }
    try {
      app = window.cloudbase.init({ env: ENV });
    } catch (e) {
      status.innerHTML = '<span class="family-note">⚠️ AI 初始化失败：' + esc(e.message) + "</span>";
      btn.disabled = true;
      return;
    }
    if (!isSafeHost()) {
      status.innerHTML = '<span class="family-note">当前为镜像/第三方域名，可能未加入 CloudBase 安全域名：云端 AI 若不可用，请使用主站 <a href="https://fridge-blindbox-d9foky90cf58fa93-1463452526.tcloudbaseapp.com/pages/jijiu.html" target="_blank" rel="noopener">tcloudbaseapp.com 主站</a>。仍可先尝试提问。</span>';
    }
    app.auth().signInAnonymously().then(function () {
      status.innerHTML = '<span class="family-note">✅ AI 已就绪（免费）。输入急救问题后点「提问」，约几秒返回。</span>';
    }).catch(function (e) {
      status.innerHTML = '<span class="family-note">⚠️ 云端登录失败：当前域名可能未加入 CloudBase 安全域名（GitHub Pages 镜像暂不支持云端 AI），或未开启匿名登录。请使用主站或联网环境；急救内容仍可直接搜索。' + esc(e.message) + "</span>";
    });

    function ask() {
      if (busy) return;
      var q = input.value.trim();
      if (!q) {
        status.innerHTML = '<span class="family-note">请先输入急救问题。</span>';
        return;
      }
      busy = true;
      btn.disabled = true;
      status.innerHTML = '<span class="family-note">🤖 正在思考（约几秒），请稍候…</span>';
      answer.innerHTML = "";
      app.callFunction({ name: "aidsearch", data: { q: q } }).then(function (res) {
        var r = (res && res.result) || res;
        if (!r) throw new Error("云函数无返回");
        if (r.code !== 0) throw new Error(r.msg || "AI 服务出错");
        renderAnswer(answer, r.data.answer);
        status.innerHTML = '<span class="family-note">✅ 回答仅供参考；如遇紧急情况请直接拨打 120。</span>';
      }).catch(function (e) {
        var emsg = (e && e.message) ? e.message : "网络受限或域名未加入 CloudBase 安全域名（镜像站不可用）";
        status.innerHTML = '<span class="family-note">⚠️ AI 问答失败：' + esc(emsg) + '。可稍后重试或使用主站；急救内容仍可在下方搜索。</span>';
      }).finally(function () {
        busy = false;
        btn.disabled = false;
      });
    }

    btn.addEventListener("click", ask);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") ask();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
