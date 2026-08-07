/* ============================================================
   买药链接模块：网页搜索 + 手机端打开 App 直达搜索（药名自动预填）
   深链为非官方 scheme，可能随版本变化，统一在此维护
   ============================================================ */
window.BuyLinks = {
  isMobile: function () {
    try {
      var ua = navigator.userAgent || "";
      if (/Android|iPhone|iPad|iPod|Mobile|HarmonyOS/i.test(ua)) return true;
      if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return true;
    } catch (e) {}
    return false;
  },
  jdWeb: function (name) { return "https://search.jd.com/Search?keyword=" + encodeURIComponent(name) + "&enc=utf-8"; },
  taobaoWeb: function (name) { return "https://s.taobao.com/search?q=" + encodeURIComponent(name); },
  jdApp: function (name) {
    return "openapp.jdmobile://virtual?params=" + encodeURIComponent(JSON.stringify({ des: "productList", keyWord: name, from: "search", category: "jump" }));
  },
  taobaoApp: function (name) { return "tbopen://m.taobao.com/tbsearch?q=" + encodeURIComponent(name); },
  meituanApp: function () { return "imeituan://"; },
  ddxianyaoWeb: function () { return "https://www.ddxianyao.com/"; },

  esc: function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  },

  render: function (container, name) {
    if (!container) return;
    var n = String(name || "").trim();
    if (!n) return;
    var mobile = this.isMobile();
    var h = "";
    h += '<div class="buy-links">';
    h += '<div class="buy-links-title">🛒 购买/比价（自动填入「' + this.esc(n) + '」）</div>';
    h += '<div class="buy-links-row">';
    if (mobile) {
      h += '<a class="btn btn-primary btn-sm" href="' + this.esc(this.jdApp(n)) + '">📱 京东App搜</a>';
      h += '<a class="btn btn-primary btn-sm" href="' + this.esc(this.taobaoApp(n)) + '">📱 淘宝App搜</a>';
    } else {
      h += '<a class="btn btn-primary btn-sm" href="' + this.esc(this.jdWeb(n)) + '" target="_blank" rel="noopener">京东搜</a>';
      h += '<a class="btn btn-primary btn-sm" href="' + this.esc(this.taobaoWeb(n)) + '" target="_blank" rel="noopener">淘宝/天猫搜</a>';
    }
    h += '</div>';
    h += '<div class="buy-links-row">';
    h += '<a class="btn btn-ghost btn-sm" href="' + this.esc(this.jdWeb(n)) + '" target="_blank" rel="noopener">🌐 京东网页版</a>';
    h += '<a class="btn btn-ghost btn-sm" href="' + this.esc(this.taobaoWeb(n)) + '" target="_blank" rel="noopener">🌐 淘宝网页版</a>';
    if (mobile) {
      h += '<a class="btn btn-ghost btn-sm" href="' + this.esc(this.meituanApp()) + '">🛵 美团App</a>';
    }
    h += '<a class="btn btn-ghost btn-sm" href="' + this.esc(this.ddxianyaoWeb()) + '" target="_blank" rel="noopener">💊 叮当快药</a>';
    h += '</div>';
    h += '<div class="buy-links-note">⚠️ 美团买药/叮当快药无网页直达搜索：打开对应 App 后，在首页搜索「买药」，再输入药名即可。App 深链若未安装应用可能无响应，请改用网页版。购药请核对平台资质与药品说明书。</div>';
    h += '</div>';
    container.innerHTML = h;
  }
};
