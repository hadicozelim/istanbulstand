/* İstanbul Stand - arayüz etkileşimleri (bağımsız, kütüphane gerektirmez) */
(function () {
  "use strict";

  var nav = document.getElementById("mainNav");
  var navCollapse = document.getElementById("mainNavCollapse");
  var toggles = document.querySelectorAll('a[href^="#"]');

  /* --- Mobil menü aç/kapat --- */
  var navToggle = document.querySelector(".navbar-toggle");
  if (navToggle && navCollapse) {
    navToggle.addEventListener("click", function () {
      var acik = navCollapse.classList.toggle("in");
      navToggle.setAttribute("aria-expanded", acik ? "true" : "false");
      document.body.classList.toggle("nav-acik", acik);
    });
  }

  var navbarYuksekligi = function () {
    return nav ? nav.offsetHeight : 0;
  };

  /* --- Yumuşak kaydırma (requestAnimationFrame ile garanti) --- */
  var root = document.documentElement;
  var smoothScrollTo = function (targetY) {
    var prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    var startY = window.pageYOffset;
    var dist = targetY - startY;
    if (Math.abs(dist) < 2) {
      window.scrollTo(0, targetY);
      root.style.scrollBehavior = prevBehavior;
      return;
    }
    var dur = Math.min(900, Math.max(400, Math.abs(dist) * 0.6));
    var startTs = null;
    var ease = function (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; };
    var step = function (ts) {
      if (startTs === null) startTs = ts;
      var p = Math.min(1, (ts - startTs) / dur);
      window.scrollTo(0, startY + dist * ease(p));
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        root.style.scrollBehavior = prevBehavior;
      }
    };
    requestAnimationFrame(step);
  };

  toggles.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var hedefId = link.getAttribute("href");
      if (!hedefId || hedefId === "#" || hedefId.length < 2) return;
      var hedef = document.querySelector(hedefId);
      if (!hedef) return;
      e.preventDefault();
      var y = hedef.getBoundingClientRect().top + window.pageYOffset - navbarYuksekligi() + 1;
      smoothScrollTo(y);
      if (window.history && history.pushState) history.pushState(null, "", hedefId);
      else location.hash = hedefId;
      if (navCollapse && navCollapse.classList.contains("in")) {
        navCollapse.classList.remove("in");
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-acik");
      }
    });
  });

  /* --- Navbar küçülme + yukarı çık butonu --- */
  var backTop = document.getElementById("back-top");
  var onScroll = function () {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("navbar-shrink", y > 40);
    if (backTop) backTop.classList.toggle("visible", y > 400);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backTop) {
    var btLink = backTop.querySelector("a");
    if (btLink) {
      btLink.addEventListener("click", function (e) {
        e.preventDefault();
        smoothScrollTo(0);
        if (window.history && history.pushState) history.pushState(null, "", location.pathname + location.search);
      });
    }
  }

  /* --- Bölümler görünüme girince animasyon --- */
  var reveal = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("revealed");
        } else {
          en.target.classList.remove("revealed");
        }
      });
    }, { threshold: 0.15 });
    reveal.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 90 + "ms";
      io.observe(el);
    });
  } else {
    reveal.forEach(function (el) { el.classList.add("revealed"); });
  }

  /* ============================================================
     HİZMETLER METİN ANİMASYONU  (KALDIRILABİLİR)
     Kapatmak için: HIZMET_ANIM = false;
     Tamamen silmek için: bu bloğu ve style.css'teki
     ".mz-about-container p .w" kurallarını kaldırın.
     ============================================================ */
  var HIZMET_ANIM = true;
  if (HIZMET_ANIM) {
    var hizmetP = document.querySelector("#about .mz-about-container p");
    if (hizmetP) {
      var kelimeler = hizmetP.textContent.replace(/\s+/g, " ").trim().split(" ");
      hizmetP.innerHTML = "";
      var wSpans = [];
      kelimeler.forEach(function (k) {
        var s = document.createElement("span");
        s.className = "w";
        s.textContent = k;
        hizmetP.appendChild(s);
        hizmetP.appendChild(document.createTextNode(" "));
        wSpans.push(s);
      });
      var hizmetBasladi = false;
      var hizmetCalistir = function () {
        if (hizmetBasladi) return;
        hizmetBasladi = true;
        var i = 0;
        var HIZ = 380; /* ~2.6 kelime / saniye */
        var adim = function () {
          if (i > 0) {
            wSpans[i - 1].classList.remove("w-box");
            wSpans[i - 1].classList.add("w-read");
          }
          if (i < wSpans.length) {
            var kelime = wSpans[i].textContent;
            wSpans[i].classList.add("w-box");
            i++;
            var bekle = HIZ;
            if (/\.$/.test(kelime)) bekle += 500; /* noktadan sonra .5sn ek bekleme */
            setTimeout(adim, bekle);
          } else {
            setTimeout(function () {
              hizmetP.classList.add("anim-bitti");
            }, 400);
            setTimeout(function () {
              smoothScrollTo(window.pageYOffset + 120);
            }, 1000);
          }
        };
        adim();
      };
      if ("IntersectionObserver" in window) {
        var ioH = new IntersectionObserver(function (ents) {
          ents.forEach(function (en) {
            if (en.isIntersecting) {
              hizmetCalistir();
              ioH.disconnect();
            }
          });
        }, { threshold: 0.9, rootMargin: "0px 0px -15% 0px" });
        ioH.observe(hizmetP);
      } else {
        hizmetCalistir();
      }
    }
  }

  /* --- İlk portföy: açılıştan 2sn sonra otomatik hover; başka portföye geçince/tıklayınca kapanır --- */
  var ilkPortfolyo = document.querySelector("#portfolio figure.effect-bubba");
  if (ilkPortfolyo) {
    setTimeout(function () { ilkPortfolyo.classList.add("is-hover"); }, 2000);
    document.querySelectorAll("#portfolio figure.effect-bubba").forEach(function (fig) {
      var kapat = function () { ilkPortfolyo.classList.remove("is-hover"); };
      if (fig !== ilkPortfolyo) fig.addEventListener("mouseenter", kapat);
      fig.addEventListener("click", kapat);
    });
  }

  /* --- Footer yılı --- */
  var yil = document.getElementById("yil");
  if (yil) yil.textContent = new Date().getFullYear();
})();

/* --- Derin baglanti (# capa) ve geri/ileri gezinme --- */
(function () {
  function hedefBul(h) {
    if (!h || h.length < 2) return null;
    try { return document.querySelector(h); } catch (e) { return null; }
  }
  function kaydir(h, yumusak) {
    var el = hedefBul(h);
    if (!el) return;
    var nav = document.getElementById("mainNav");
    var ofs = nav ? nav.offsetHeight : 0;
    var y = el.getBoundingClientRect().top + window.pageYOffset - ofs + 1;
    if (!yumusak || Math.abs(y - window.pageYOffset) < 2) { window.scrollTo(0, y); return; }
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    var s = window.pageYOffset, d = y - s, t0 = null;
    var dur = Math.min(900, Math.max(400, Math.abs(d) * 0.6));
    var ease = function (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; };
    var step = function (ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      window.scrollTo(0, s + d * ease(p));
      if (p < 1) requestAnimationFrame(step); else root.style.scrollBehavior = prev;
    };
    requestAnimationFrame(step);
  }
  window.addEventListener("hashchange", function () { kaydir(location.hash, true); });
  window.addEventListener("load", function () {
    if (location.hash && location.hash.length > 1) setTimeout(function () { kaydir(location.hash, false); }, 80);
  });
})();

/* --- Portfolyo slider --- */
(function () {
  Array.prototype.slice.call(document.querySelectorAll(".ot-slider")).forEach(function (sl) {
    var items = sl.querySelectorAll(".ot-slide");
    if (items.length < 2) return;
    var i = 0, timer = null, sure = 6000;
    var dots = sl.querySelector(".ot-slider-dots");
    var btnDots = [];
    if (dots) {
      for (var d = 0; d < items.length; d++) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Slayt " + (d + 1));
        (function (n) { b.addEventListener("click", function () { git(n); baslat(); }); })(d);
        dots.appendChild(b);
        btnDots.push(b);
      }
    }
    function git(n) {
      i = (n + items.length) % items.length;
      for (var k = 0; k < items.length; k++) {
        items[k].classList.toggle("is-active", k === i);
        if (btnDots[k]) btnDots[k].classList.toggle("is-active", k === i);
      }
    }
    function durdur() { if (timer) { clearInterval(timer); timer = null; } }
    function baslat() { durdur(); timer = setInterval(function () { git(i + 1); }, sure); }
    var prev = sl.querySelector(".ot-slider-prev");
    var next = sl.querySelector(".ot-slider-next");
    if (prev) prev.addEventListener("click", function () { git(i - 1); baslat(); });
    if (next) next.addEventListener("click", function () { git(i + 1); baslat(); });
    sl.addEventListener("mouseenter", durdur);
    sl.addEventListener("mouseleave", baslat);
    sl.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { git(i - 1); baslat(); }
      if (e.key === "ArrowRight") { git(i + 1); baslat(); }
    });
    git(0);
    baslat();
  });
})();
