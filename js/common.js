/* ============================================================
   家庭健康与安全守护站 - 公共脚本
   注入统一头部导航 + 底部免责声明 + 字号切换
   依赖：每个页面需在 <head> 定义 window.BASE（"./" 或 "../"）
   ============================================================ */
(function () {
  "use strict";
  var BASE = window.BASE || "./";
  var FS_KEY = "hfs_fontsize";

  function navItems() {
    var page = (document.body && document.body.dataset.page) || "";
    return [
      { href: BASE + "index.html", label: "🏠 首页", page: "home" },
      { href: BASE + "pages/yixiang.html", label: "💊 家庭药箱", page: "yixiang" },
      { href: BASE + "pages/xinli.html", label: "🧠 心理健康", page: "xinli" },
      { href: BASE + "pages/jijiu.html", label: "🚑 急救百科", page: "jijiu" },
      { href: BASE + "pages/yjqd.html", label: "📋 应急清单", page: "yjqd" }
    ].map(function (it) {
      var a = document.createElement("a");
      a.href = it.href;
      a.textContent = it.label;
      if (it.page === page) a.className = "active";
      return a;
    });
  }

  function buildHeader() {
    var header = document.querySelector("#site-header");
    if (!header) return;
    header.className = "site-header";
    var wrap = document.createElement("div");
    wrap.className = "container";

    var logo = document.createElement("a");
    logo.href = BASE + "index.html";
    logo.className = "logo";
    logo.innerHTML = '<span class="logo-mark">🏥</span><span>家庭健康与安全守护站</span>';

    var nav = document.createElement("nav");
    nav.className = "main-nav";
    navItems().forEach(function (a) { nav.appendChild(a); });

    var fsBox = document.createElement("div");
    fsBox.className = "fs-toggle";
    var fsLabel = document.createElement("span");
    fsLabel.textContent = "字号";
    var sizes = [["", "标准"], ["lg", "大"], ["xl", "特大"]];
    sizes.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = s[1];
      b.dataset.fs = s[0];
      b.addEventListener("click", function () { setFontSize(s[0]); });
      fsBox.appendChild(b);
    });
    fsBox.insertBefore(fsLabel, fsBox.firstChild);

    wrap.appendChild(logo);
    wrap.appendChild(nav);
    wrap.appendChild(fsBox);
    header.appendChild(wrap);
  }

  function setFontSize(v) {
    if (v) document.documentElement.setAttribute("data-fs", v);
    else document.documentElement.removeAttribute("data-fs");
    try { localStorage.setItem(FS_KEY, v); } catch (e) {}
    document.querySelectorAll(".fs-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.fs === v);
    });
  }

  function buildFooter() {
    var footer = document.querySelector("#site-footer");
    if (!footer) return;
    footer.className = "site-footer";
    var wrap = document.createElement("div");
    wrap.className = "container";

    var dis = document.createElement("div");
    dis.className = "disclaimer-foot";
    dis.innerHTML = "⚠️ <strong>免责声明：</strong>本站内容仅供科普参考，不能替代专业医疗诊断。如遇紧急情况，请立刻拨打 120（火警 119、报警 110）。用药与急救请以医生、药师及官方最新指南为准。";

    var links = document.createElement("div");
    links.className = "foot-links";
    links.innerHTML =
      '<a href="' + BASE + 'index.html">首页</a>' +
      '<a href="' + BASE + 'pages/yixiang.html">家庭药箱</a>' +
      '<a href="' + BASE + 'pages/xinli.html">心理健康</a>' +
      '<a href="' + BASE + 'pages/jijiu.html">急救百科</a>' +
      '<a href="' + BASE + 'pages/yjqd.html">打印版应急清单</a>';

    var copy = document.createElement("div");
    copy.className = "copyright";
    copy.innerHTML = "家庭健康与安全守护站 · 公益科普 · 数据仅保存在本机浏览器 · " + new Date().getFullYear();

    wrap.appendChild(dis);
    wrap.appendChild(links);
    wrap.appendChild(copy);
    footer.appendChild(wrap);
  }

  function init() {
    var v = "";
    try { v = localStorage.getItem(FS_KEY) || ""; } catch (e) {}
    if (v) document.documentElement.setAttribute("data-fs", v);
    buildHeader();
    buildFooter();
    document.querySelectorAll(".fs-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.fs === v);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
