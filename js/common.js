/* ============================================================
   家庭健康与安全守护站 - 公共脚本
   统一头部导航 + 底部免责声明 + 字号切换 + 长辈模式 + 最后更新时间 + PWA 注册
   依赖：每个页面需在 <head> 定义 window.BASE（"./" 或 "../"）
   ============================================================ */
(function () {
  "use strict";
  var BASE = window.BASE || "./";
  var FS_KEY = "hfs_fontsize";
  var LAST_UPDATED = "2026年8月";
  window.LAST_UPDATED = LAST_UPDATED;

  function navItems(elder) {
    var page = (document.body && document.body.dataset.page) || "";
    var items = [
      { href: BASE + "index.html", label: "🏠 首页", page: "home" },
      { href: BASE + "pages/yixiang.html", label: "💊 家庭药箱", page: "yixiang" },
      { href: BASE + "pages/xinli.html", label: "🧠 心理健康", page: "xinli" },
      { href: BASE + "pages/jijiu.html", label: "🚑 急救百科", page: "jijiu" },
      { href: BASE + "pages/yjqd.html", label: "📋 应急清单", page: "yjqd" }
    ];
    if (elder) items = items.filter(function (it) { return it.page === "home" || it.page === "yixiang" || it.page === "jijiu"; });
    return items.map(function (it) {
      var a = document.createElement("a");
      a.href = it.href;
      a.textContent = it.label;
      if (it.page === page) a.className = "active";
      return a;
    });
  }

  function applyElder(on) {
    if (on) document.documentElement.setAttribute("data-elder", "true");
    else document.documentElement.removeAttribute("data-elder");
    try { localStorage.setItem("hfs_elder", on ? "1" : ""); } catch (e) {}
    var t = document.getElementById("elder-toggle");
    if (t) t.classList.toggle("active", on);
    rebuildNav();
  }

  function rebuildNav() {
    var nav = document.querySelector(".main-nav");
    if (!nav) return;
    nav.innerHTML = "";
    var elder = false;
    try { elder = localStorage.getItem("hfs_elder") === "1"; } catch (e) {}
    navItems(elder).forEach(function (a) { nav.appendChild(a); });
  }

  function setFontSize(v) {
    if (v) document.documentElement.setAttribute("data-fs", v);
    else document.documentElement.removeAttribute("data-fs");
    try { localStorage.setItem(FS_KEY, v); } catch (e) {}
    document.querySelectorAll(".fs-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.fs === v);
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

    var controls = document.createElement("div");
    controls.className = "fs-toggle";

    var elderBtn = document.createElement("button");
    elderBtn.type = "button";
    elderBtn.id = "elder-toggle";
    elderBtn.textContent = "👴 长辈模式";
    elderBtn.title = "长辈模式：更大字号 + 极简布局";
    elderBtn.addEventListener("click", function () {
      var on = false;
      try { on = localStorage.getItem("hfs_elder") === "1"; } catch (e) {}
      applyElder(!on);
    });

    var fsLabel = document.createElement("span");
    fsLabel.textContent = "字号";
    var sizes = [["", "标准"], ["lg", "大"], ["xl", "特大"]];
    var fsBtns = [];
    sizes.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = s[1];
      b.dataset.fs = s[0];
      b.addEventListener("click", function () { setFontSize(s[0]); });
      fsBtns.push(b);
      controls.appendChild(b);
    });
    controls.insertBefore(fsLabel, controls.firstChild);
    controls.appendChild(elderBtn);

    wrap.appendChild(logo);
    wrap.appendChild(nav);
    wrap.appendChild(controls);
    header.appendChild(wrap);

    // 应用存储状态
    var v = "";
    try { v = localStorage.getItem(FS_KEY) || ""; } catch (e) {}
    if (v) document.documentElement.setAttribute("data-fs", v);
    var elder = false;
    try { elder = localStorage.getItem("hfs_elder") === "1"; } catch (e) {}
    if (elder) document.documentElement.setAttribute("data-elder", "true");
    fsBtns.forEach(function (b) { b.classList.toggle("active", b.dataset.fs === v); });
    document.getElementById("elder-toggle").classList.toggle("active", elder);
    rebuildNav();
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
    copy.innerHTML = "家庭健康与安全守护站 · 公益科普 · 数据仅保存在本机浏览器 · 内容最后更新于：" + LAST_UPDATED + " · " + new Date().getFullYear();

    wrap.appendChild(dis);
    wrap.appendChild(links);
    wrap.appendChild(copy);
    footer.appendChild(wrap);
  }

  /* 在带 data-updated 的元素标题旁插入更新时间徽标 */
  function addUpdatedBadges() {
    document.querySelectorAll("[data-updated]").forEach(function (el) {
      if (el.querySelector(".updated-badge")) return;
      var b = document.createElement("span");
      b.className = "updated-badge";
      b.textContent = "内容更新于 " + LAST_UPDATED;
      el.appendChild(b);
    });
  }

  /* PWA：注册 Service Worker（仅 https/localhost 生效） */
  function registerSW() {
    try {
      if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
        navigator.serviceWorker.register(BASE + "sw.js").catch(function () {});
      }
    } catch (e) {}
  }

  function init() {
    buildHeader();
    buildFooter();
    addUpdatedBadges();
    registerSW();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
