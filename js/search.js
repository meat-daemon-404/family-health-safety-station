/* ============================================================
   家庭健康与安全守护站 - 搜索工具
   模糊搜索：子串匹配 + 关键词别名
   ============================================================ */
(function () {
  "use strict";
  window.FuzzySearch = {
    /* 判断 query 是否命中 text（忽略大小写，支持多个空格分词，任一命中即可） */
    match: function (query, text) {
      if (!query) return true;
      if (!text) return false;
      var q = String(query).toLowerCase().trim();
      if (!q) return true;
      var t = String(text).toLowerCase();
      var parts = q.split(/[\s+]+/).filter(Boolean);
      if (parts.length === 1) return t.indexOf(parts[0]) !== -1;
      return parts.some(function (p) { return t.indexOf(p) !== -1; });
    },

    /* 在条目数组中搜索：条目提供 searchText() 返回可检索文本；命中返回条目数组 */
    search: function (items, query, getText) {
      return items.filter(function (it) {
        return window.FuzzySearch.match(query, getText(it));
      });
    }
  };
})();
