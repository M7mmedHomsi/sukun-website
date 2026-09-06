/* =============================================================
   سُكون — site behaviour
   Sections: config · i18n · nav · reveal · hero stage
             · faq · waitlist form
   ============================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------
     1. Config
     ---------------------------------------------------------------
     Public waitlist edge function — no auth, see
     assets/sukun-cms-api-package/cms-api.md.
  --------------------------------------------------------------- */
  var CONFIG = {
    WAITLIST_URL: "https://xrxztpcijkhehrrpneve.supabase.co/functions/v1/waitlist",
    SOURCE: "website"
  };
  var ENDPOINT_READY = CONFIG.WAITLIST_URL.indexOf("<PROJECT_REF>") === -1;

  var STORE_KEY = "sukun_lang";
  var DEFAULT_LANG = "ar";
  var DICT = window.SUKUN_I18N || { ar: {}, en: {} };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------
     2. i18n
  --------------------------------------------------------------- */

  var lang = document.documentElement.getAttribute("lang") || DEFAULT_LANG;

  var AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  /** Format a number in the script of the active language. */
  function num(value) {
    var s = String(value);
    if (lang !== "ar") return s;
    return s.replace(/[0-9]/g, function (d) { return AR_DIGITS[+d]; });
  }

  function t(key) {
    var table = DICT[lang] || {};
    if (Object.prototype.hasOwnProperty.call(table, key)) return table[key];
    var fallback = DICT[DEFAULT_LANG] || {};
    return Object.prototype.hasOwnProperty.call(fallback, key) ? fallback[key] : key;
  }

  function applyLang(next, opts) {
    lang = next === "en" ? "en" : "ar";
    var dir = lang === "ar" ? "rtl" : "ltr";

    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dir);

    $$("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    $$("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    $$("[data-i18n-attr]").forEach(function (el) {
      // format: "placeholder:key, aria-label:key"
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var bits = pair.split(":");
        if (bits.length === 2) el.setAttribute(bits[0].trim(), t(bits[1].trim()));
      });
    });

    document.title = t("meta.title");
    var desc = $('meta[name="description"]');
    if (desc) desc.setAttribute("content", t("meta.desc"));
    var ogT = $('meta[property="og:title"]');   if (ogT) ogT.setAttribute("content", t("meta.title"));
    var ogD = $('meta[property="og:description"]'); if (ogD) ogD.setAttribute("content", t("meta.desc"));

    // Language toggle pressed state
    $$("[data-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === lang));
    });

    // Country <select> option labels (values stay English for the API)
    $$("#wl-country option[data-country]").forEach(function (opt) {
      opt.textContent = t("country." + opt.getAttribute("data-country"));
    });
    var ph = $("#wl-country option[value='']");
    if (ph) ph.textContent = t("form.countryPh");

    try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* private mode */ }

    if (!opts || !opts.initial) {
      if (hasGSAP && window.ScrollTrigger) window.ScrollTrigger.refresh();
    }
  }

  /* ---------------------------------------------------------------
     3. Navigation
  --------------------------------------------------------------- */

  function initNav() {
    var header = $(".header");
    var burger = $(".burger");
    var sheet = $(".sheet");

    if (header) {
      var onScroll = function () {
        header.classList.toggle("is-stuck", window.scrollY > 12);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    if (burger && sheet) {
      var setOpen = function (open) {
        burger.setAttribute("aria-expanded", String(open));
        sheet.classList.toggle("is-open", open);
        sheet.setAttribute("aria-hidden", String(!open));
        document.body.style.overflow = open ? "hidden" : "";
      };
      burger.addEventListener("click", function () {
        setOpen(burger.getAttribute("aria-expanded") !== "true");
      });
      $$(".sheet a").forEach(function (a) {
        a.addEventListener("click", function () { setOpen(false); });
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
          setOpen(false);
          burger.focus();
        }
      });
    }

    $$("[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang"));
      });
    });
  }

  /* ---------------------------------------------------------------
     4. Scroll reveals
  --------------------------------------------------------------- */

  function initReveals() {
    var items = $$("[data-reveal]");
    if (!items.length) return;

    if (!hasGSAP || reduceMotion) {
      items.forEach(function (el) { el.style.opacity = "1"; });
      return;
    }

    var groups = {};
    items.forEach(function (el) {
      var key = el.getAttribute("data-reveal") || "solo:" + Math.random();
      (groups[key] = groups[key] || []).push(el);
    });

    Object.keys(groups).forEach(function (key) {
      var set = groups[key];
      gsap.set(set, { opacity: 0, y: 26 });
      gsap.to(set, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: set[0], start: "top 86%", once: true }
      });
    });
  }

  /* ---------------------------------------------------------------
     5. Hero stage — intro and floating chips
  --------------------------------------------------------------- */

  function initHero() {
    var stage = $(".stage");
    if (!stage) return;

    var phone = $(".stage__phone", stage);
    var chips = $$(".stage__chip", stage);

    if (!hasGSAP || reduceMotion) return;

    /* --- intro --- */
    var intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .from(".hero__eyebrow", { opacity: 0, y: 16, duration: 0.6 })
      .from(".hero__title .line", { opacity: 0, y: 30, duration: 0.9, stagger: 0.09 }, "-=0.35")
      .from(".hero__sub", { opacity: 0, y: 20, duration: 0.7 }, "-=0.55")
      .from(".hero__actions > *", { opacity: 0, y: 18, duration: 0.6, stagger: 0.08 }, "-=0.45")
      .from(phone, { opacity: 0, y: 40, scale: 0.94, duration: 1.0 }, "-=0.4")
      .from(chips, { opacity: 0, scale: 0.9, y: 14, duration: 0.6, stagger: 0.07 }, "-=0.55");

    /* The chips' float is a CSS keyframe animation, not a JS tween — see
       styles.css. Per Chrome's re-rastering rules, CSS and Web Animations
       run on the compositor and skip the per-frame high-quality repaint
       that made a scripted tween stutter here. */

    /* --- hero aura parallax --- */
    if (window.ScrollTrigger) {
      gsap.to(".hero__aura", {
        yPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

  /* ---------------------------------------------------------------
     6. FAQ accordion
  --------------------------------------------------------------- */

  function initFaq() {
    $$(".qa").forEach(function (qa) {
      var btn = $(".qa__q", qa);
      var panel = $(".qa__a", qa);
      if (!btn || !panel) return;

      btn.addEventListener("click", function () {
        var open = qa.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
        panel.setAttribute("aria-hidden", String(!open));
      });
    });
  }

  /* ---------------------------------------------------------------
     7. Waitlist form
  --------------------------------------------------------------- */

  function initForm() {
    var form = $("#waitlist-form");
    if (!form) return;

    var statusEl = $("#wl-status");
    var doneEl = $("#wl-done");
    var submit = $(".form__submit", form);
    var honey = $("#wl-company", form);

    var fields = {
      name: $("#wl-name", form),
      email: $("#wl-email", form),
      country: $("#wl-country", form)
    };

    function fieldWrap(input) { return input.closest(".field"); }

    function setInvalid(input, messageKey) {
      var wrap = fieldWrap(input);
      if (!wrap) return;
      wrap.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
      var err = $(".field__error", wrap);
      if (err) err.textContent = t(messageKey);
    }

    function clearInvalid(input) {
      var wrap = fieldWrap(input);
      if (!wrap) return;
      wrap.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
    }

    Object.keys(fields).forEach(function (key) {
      var input = fields[key];
      if (!input) return;
      input.addEventListener("blur", function () { validate(key, true); });
      input.addEventListener("input", function () { clearInvalid(input); });
      input.addEventListener("change", function () { clearInvalid(input); });
    });

    function validate(key, mark) {
      var input = fields[key];
      if (!input) return true;
      var value = (input.value || "").trim();
      var ok = true;
      var msg = "";

      if (key === "name")    { ok = value.length > 0 && value.length <= 200; msg = "form.errName"; }
      if (key === "email")   { ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 200; msg = "form.errEmail"; }
      if (key === "country") { ok = value.length > 0; msg = "form.errCountry"; }

      if (!ok && mark) setInvalid(input, msg); else if (ok) clearInvalid(input);
      return ok;
    }

    function showStatus(kind, text) {
      if (!statusEl) return;
      statusEl.className = "form__status is-shown form__status--" + kind;
      statusEl.textContent = text;
    }

    function hideStatus() {
      if (statusEl) statusEl.className = "form__status";
    }

    function showDone(titleKey, textKey) {
      form.classList.add("form--done");
      hideStatus();
      if (!doneEl) return;
      var h = $("h3", doneEl);
      var p = $("p", doneEl);
      if (h) { h.setAttribute("data-i18n", titleKey); h.textContent = t(titleKey); }
      if (p) { p.setAttribute("data-i18n", textKey);  p.textContent = t(textKey); }
      doneEl.setAttribute("tabindex", "-1");
      doneEl.focus({ preventScroll: true });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideStatus();

      // Honeypot: a filled hidden field means a bot. Pretend success.
      if (honey && honey.value) { showDone("form.doneTitle", "form.doneText"); return; }

      var order = ["name", "email", "country"];
      var firstBad = null;
      order.forEach(function (key) {
        if (!validate(key, true) && !firstBad) firstBad = fields[key];
      });
      if (firstBad) { firstBad.focus(); return; }

      if (!ENDPOINT_READY) {
        console.warn("[sukun] Waitlist endpoint is not configured. Set CONFIG.WAITLIST_URL in js/main.js.");
        showStatus("err", t("form.errServer"));
        return;
      }

      var payload = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        country: fields.country.value,
        source: form.getAttribute("data-source") || CONFIG.SOURCE
      };

      if (submit) {
        submit.setAttribute("data-busy", "true");
        submit.textContent = t("form.submitBusy");
      }

      fetch(CONFIG.WAITLIST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            return { ok: res.ok, status: res.status, body: body };
          });
        })
        .then(function (r) {
          if (!r.ok || r.body.success === false) {
            throw new Error((r.body.error && r.body.error.code) || "server");
          }
          var data = r.body.data || r.body;
          if (data.already_joined) showDone("form.alreadyTitle", "form.alreadyText");
          else showDone("form.doneTitle", "form.doneText");
        })
        .catch(function (err) {
          var isNetwork = err instanceof TypeError;
          showStatus("err", t(isNetwork ? "form.errNetwork" : "form.errServer"));
        })
        .then(function () {
          if (submit) {
            submit.removeAttribute("data-busy");
            submit.textContent = t("form.submit");
          }
        });
    });
  }

  /* ---------------------------------------------------------------
     8. Boot
  --------------------------------------------------------------- */

  function boot() {
    if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    var stored = null;
    try { stored = localStorage.getItem(STORE_KEY); } catch (e) { /* ignore */ }
    var qs = new URLSearchParams(window.location.search).get("lang");
    applyLang(qs || stored || DEFAULT_LANG, { initial: true });

    initNav();
    initFaq();
    initForm();
    initReveals();
    initHero();

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
