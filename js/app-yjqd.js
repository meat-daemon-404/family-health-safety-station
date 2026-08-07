/* ============================================================
   应急清单 V2：交互式核对表（勾选保存 + 进度） + 打印
   ============================================================ */
(function () {
  "use strict";
  var ITEMS = [
    { id: "bag-1", cat: "🧰 急救包物品", label: "医用纱布、绷带、创可贴、医用胶带、棉签" },
    { id: "bag-2", cat: "🧰 急救包物品", label: "碘伏（伤口消毒）" },
    { id: "bag-3", cat: "🧰 急救包物品", label: "电子体温计" },
    { id: "bag-4", cat: "🧰 急救包物品", label: "退热镇痛药：对乙酰氨基酚 / 布洛芬" },
    { id: "bag-5", cat: "🧰 急救包物品", label: "口服补液盐 Ⅲ、蒙脱石散（腹泻备用）" },
    { id: "bag-6", cat: "🧰 急救包物品", label: "抗过敏药：氯雷他定 / 西替利嗪" },
    { id: "bag-7", cat: "🧰 急救包物品", label: "炉甘石洗剂、烫伤膏" },
    { id: "bag-8", cat: "🧰 急救包物品", label: "小剪刀、镊子、手电筒、哨子" },
    { id: "bag-9", cat: "🧰 急救包物品", label: "一次性口罩、手套" },
    { id: "bag-10", cat: "🧰 急救包物品", label: "应急联系卡（家庭成员信息与紧急电话）" },
    { id: "chk-1", cat: "🗓️ 定期检查", label: "每月：检查药品有效期，过期药送回收点或投入红色有害垃圾桶" },
    { id: "chk-2", cat: "🗓️ 定期检查", label: "每季度：检查急救包物品是否齐全、电池是否有效" },
    { id: "chk-3", cat: "🗓️ 定期检查", label: "每年：与家人演练一次急救流程，重温 120 报地址流程" }
  ];

  function render() {
    var box = document.getElementById("checklist");
    if (!box || !window.ChecklistStore) return;
    var cats = [];
    ITEMS.forEach(function (it) { if (cats.indexOf(it.cat) === -1) cats.push(it.cat); });
    box.innerHTML = "";
    cats.forEach(function (cat) {
      var h = document.createElement("h3");
      h.textContent = cat;
      box.appendChild(h);
      ITEMS.filter(function (it) { return it.cat === cat; }).forEach(function (it) {
        var done = window.ChecklistStore.has(it.id);
        var row = document.createElement("label");
        row.className = "checklist-item" + (done ? " done" : "");
        row.innerHTML = '<input type="checkbox" data-cid="' + it.id + '"' + (done ? " checked" : "") + '><span class="ci-label">' + it.label + '</span>';
        box.appendChild(row);
      });
    });
    box.querySelectorAll("input[data-cid]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        window.ChecklistStore.toggle(cb.dataset.cid);
        var row = cb.closest(".checklist-item");
        if (row) row.classList.toggle("done", cb.checked);
        updateProgress();
      });
    });
    updateProgress();
  }

  function updateProgress() {
    var pctEl = document.getElementById("cl-pct");
    var fill = document.getElementById("cl-fill");
    if (!pctEl || !fill || !window.ChecklistStore) return;
    var done = ITEMS.filter(function (it) { return window.ChecklistStore.has(it.id); }).length;
    var total = ITEMS.length;
    var pct = total ? Math.round(done / total * 100) : 0;
    fill.style.width = pct + "%";
    pctEl.textContent = "已完成 " + done + "/" + total + "（" + pct + "%）";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
