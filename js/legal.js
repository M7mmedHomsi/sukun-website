/* Language switch for the legal pages. The head script has already set
   html[lang] and dir from ?lang= or the saved choice, the same way the
   home page does; this keeps the buttons and the tab title in step. */
(function () {
  var STORE_KEY = "sukun_lang";
  var root = document.documentElement;

  function apply(lang) {
    if (lang !== "ar" && lang !== "en") lang = "ar";
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    var title = root.getAttribute("data-title-" + lang);
    if (title) document.title = title;
    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === lang));
    });
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) { }
  }

  document.querySelectorAll("[data-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () { apply(btn.getAttribute("data-lang")); });
  });
  apply(root.lang);
})();
