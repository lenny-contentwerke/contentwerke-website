/* ============================================================
   CONTENTWERKE — hyper-modern interactions
   ============================================================ */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(max-width: 760px)").matches || !window.matchMedia("(hover:hover)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  gsap.registerPlugin(ScrollTrigger);

  /* ---- SMOOTH SCROLL ---- */
  let lenis = null, scrollVel = 0;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.12, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 1.5 });
    lenis.on("scroll", (e) => { ScrollTrigger.update(); scrollVel = e.velocity || 0; });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
  }
  const scrollToEl = (el) => { if (!el) return; if (lenis) lenis.scrollTo(el, { duration: 1.2, offset: -80 }); else el.scrollIntoView({ behavior: "smooth" }); };

  /* ---- HERO CANVAS SCRUB (gefilmte Kamerafahrt, endet auf CONTENTWERKE) ---- */
  const canvas = $("#heroCanvas"), ctx = canvas.getContext("2d", { alpha: false });
  const TOTAL = 240, PAD = 3, frames = [];
  let loaded = 0, ready = false, lastFrame = -1, heroRaf = false; const state = { frame: 0 };
  const SEQ_VER = "20261015m"; // bump wenn die Hero-Frames neu exportiert werden (Cache ist immutable!)
  const frameSrc = (i) => "assets/seq/f_" + String(i + 1).padStart(PAD, "0") + ".jpg?v=" + SEQ_VER;
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(canvas.clientWidth * dpr); canvas.height = Math.floor(canvas.clientHeight * dpr);
    render(state.frame);
  }
  function render(idx) {
    const i = Math.max(0, Math.min(TOTAL - 1, Math.round(idx))), img = frames[i];
    if (!img || !img.complete || !img.naturalWidth) return;
    const cw = canvas.width, ch = canvas.height, ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
    let dw, dh, dx, dy;
    if (cr > ir) { dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2; } else { dh = ch; dw = ch * ir; dy = 0; dx = (cw - dw) / 2; }
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  function drawHero() { heroRaf = false; const idx = Math.max(0, Math.min(TOTAL - 1, Math.round(state.frame))); if (idx !== lastFrame) { lastFrame = idx; render(idx); } }

  /* ---- PRELOADER ---- */
  const preloader = $("#preloader"), preBar = $("#preBar"), prePct = $("#prePct"), preWord = $("#preWord");
  document.body.classList.add("locked");
  function startExperience() {
    if (ready) return; ready = true; render(0);
    preloader.classList.add("done"); document.body.classList.remove("locked");
    setTimeout(() => { preloader.style.display = "none"; }, 1300);
    ScrollTrigger.refresh(); introAnimation();
  }
  for (let i = 0; i < TOTAL; i++) {
    const img = new Image();
    img.onload = img.onerror = () => {
      loaded++; const pct = Math.round((loaded / TOTAL) * 100);
      if (preBar) preBar.style.width = pct + "%"; if (prePct) prePct.textContent = String(pct).padStart(3, "0");
      if (preWord) preWord.textContent = pct < 40 ? "INITIALISIERE" : pct < 80 ? "LADE ASSETS" : "FAST FERTIG";
      if (i === 0) render(0);
      if (loaded >= TOTAL) startExperience();
    };
    img.src = frameSrc(i); frames[i] = img;
  }
  setTimeout(() => { if (loaded >= TOTAL * 0.55) startExperience(); }, 5000);
  setTimeout(startExperience, 9000);
  sizeCanvas(); window.addEventListener("resize", sizeCanvas);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

  /* ---- INTRO ---- */
  function introAnimation() {
    if (reduce) return;
    gsap.from(".hero__hud, .hero__hint, .hero__grid", { opacity: 0, duration: 1, ease: "power2.out" });
    // Start-Headline (H1) sanft einblenden – sie liegt bereits auf dem Startbild
    const introCopy = $('[data-hero="intro"]');
    if (introCopy) gsap.from(introCopy, { opacity: 0, y: 42, duration: 1.2, ease: "power3.out", delay: 0.25 });
  }

  /* ---- SCRAMBLE ---- */
  const glyphs = "▓▒░#@%&/<>=01ABCXYZ*+";
  function scramble(el) {
    const txt = el.dataset._t || el.textContent; el.dataset._t = txt;
    const dur = 900, t0 = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = txt.split("").map((c, i) => (c === " " || i / txt.length < p ? c : glyphs[(Math.random() * glyphs.length) | 0])).join("");
      if (p < 1) requestAnimationFrame(tick); else el.textContent = txt;
    })(t0);
  }
  $$("[data-scramble]").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => scramble(el) }));

  /* ---- HERO CHOREOGRAPHY ---- */
  const hint = $("#heroHint"), hudEl = $(".hero__hud");
  const cI = $('[data-hero="intro"]'), cM = $('[data-hero="mid"]'), cE = $('[data-hero="end"]');
  const igLink = cE && cE.querySelector(".ig-card");
  const band = (p, a, b) => (p <= a ? 0 : p >= b ? 1 : (p - a) / (b - a));
  const setC = (el, o, y) => { if (!el) return; el.style.opacity = o; el.style.transform = "translateY(" + y + "px)"; };
  ScrollTrigger.create({
    trigger: ".hero", start: "top top", end: "bottom bottom", pin: ".hero__pin", scrub: true,
    onUpdate: (s) => {
      const p = s.progress;
      state.frame = p * (TOTAL - 1); if (!heroRaf) { heroRaf = true; requestAnimationFrame(drawHero); }
      if (hint) hint.style.opacity = p > 0.03 ? 0 : 1;
      if (hudEl) hudEl.style.opacity = String(1 - band(p, 0, 0.12));
      const i1 = 1 - band(p, 0.12, 0.24); setC(cI, i1, (1 - i1) * -24);
      const m1 = band(p, 0.42, 0.52) * (1 - band(p, 0.58, 0.66)); setC(cM, m1, (1 - m1) * 24);
      const e1 = band(p, 0.72, 0.82); setC(cE, e1, (1 - e1) * 24);
      if (igLink) igLink.style.pointerEvents = e1 > 0.5 ? "auto" : "none";
    },
  });

  /* ---- REVEALS (kinetische Headlines: Wort-für-Wort aus der Maske) ---- */
  function wrapWords(root) {
    const words = [];
    (function walk(n) {
      Array.from(n.childNodes).forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((p) => {
            if (p === "") return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
            const clip = document.createElement("span"); clip.className = "kw-clip";
            const w = document.createElement("span"); w.className = "kw"; w.textContent = p;
            clip.appendChild(w); frag.appendChild(clip); words.push(w);
          });
          n.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
      });
    })(root);
    return words;
  }
  $$(".reveal-lines").forEach((el) => {
    if (reduce) { el.classList.add("in"); return; }
    const words = wrapWords(el);
    gsap.set(words, { yPercent: 118 });
    ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => {
      el.classList.add("in");
      gsap.to(words, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.055 });
    }});
  });
  $$(".reveal").forEach((el, i) => ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => gsap.delayedCall((i % 5) * 0.05, () => el.classList.add("in")) }));

  /* ---- SCROLLSPY ---- */
  const navLinks = $$(".nav-link");
  function setActive(id) {
    navLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.target === id));
    $$(".mobile-menu a").forEach((l) => l.classList.toggle("is-active", l.dataset.target === id));
  }
  const navTargets = new Set(navLinks.map((l) => l.dataset.target));
  const spySecs = $$("[data-nav]").filter((s) => navTargets.has(s.dataset.nav));
  function updateSpy() {
    const line = window.innerHeight * 0.4;
    let cur = spySecs.length ? spySecs[0].dataset.nav : "start";
    for (const sec of spySecs) { if (sec.getBoundingClientRect().top <= line) cur = sec.dataset.nav; }
    setActive(cur);
  }
  if (lenis) lenis.on("scroll", updateSpy); else window.addEventListener("scroll", updateSpy, { passive: true });
  if (window.ScrollTrigger) ScrollTrigger.addEventListener("refresh", updateSpy);
  updateSpy();

  /* ---- COUNT-UP ---- */
  $$("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count), pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    ScrollTrigger.create({ trigger: el, start: "top 95%", once: true, onEnter: () => {
      const o = { v: 0 }; gsap.to(o, { v: target, duration: 1.8, ease: "power2.out", onUpdate: () => { el.textContent = pre + Math.round(o.v) + suf; } });
    }});
  });

  /* ---- STAT SEQUENCE ---- */
  const slides = $$(".stat-slide"), statBar = $("#statBar");
  if (slides.length && !isTouch) {
    ScrollTrigger.create({
      trigger: "#statSeq", start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: (s) => {
        const p = s.progress, n = slides.length;
        slides.forEach((sl, i) => {
          const center = (i + 0.5) / n, d = (p - center) / (0.5 / n);
          const op = Math.max(0, Math.min(1, 1 - Math.abs(d) * 0.5));
          sl.style.opacity = op; sl.style.transform = "translateY(calc(-50% + " + (d * -48) + "px))";
        });
        if (statBar) statBar.style.width = p * 100 + "%";
      },
    });
  }

  /* ---- STICKY STACK subtle scale ---- */
  if (!isTouch) $$(".svc").forEach((card) => {
    gsap.to(card.querySelector(".svc__in"), { scale: 0.95, opacity: 0.55, ease: "none",
      scrollTrigger: { trigger: card, start: "top 15vh", end: "bottom 14vh", scrub: true } });
  });

  /* ---- SPLINE lazy mount/unmount (perf) ---- */
  const splineViz = $("#splineViz");
  if (splineViz) {
    let el = null;
    const mount = () => {
      if (el) return;
      el = document.createElement("spline-viewer");
      el.setAttribute("url", splineViz.dataset.spline);
      el.setAttribute("loading-anim-type", "none");
      const ready = () => { if (el) el.classList.add("ready"); };
      el.addEventListener("load", ready, { once: true });
      setTimeout(ready, 1800); // fallback falls kein load-Event
      splineViz.appendChild(el);
    };
    const unmount = () => { if (el) { el.remove(); el = null; } };
    // ~1 Viewport früher mounten (vorladen) und erst ~1 Viewport später entladen
    ScrollTrigger.create({ trigger: ".spline", start: "top bottom+=90%", end: "bottom top-=90%", onToggle: (s) => { if (s.isActive) mount(); else unmount(); } });
    // Szene-Datei im Leerlauf vorwärmen (Cache), damit das Mounten sofort rendert
    const warm = () => { try { fetch(splineViz.dataset.spline, { mode: "cors", cache: "force-cache" }).catch(function () {}); } catch (e) {} };
    if ("requestIdleCallback" in window) requestIdleCallback(warm, { timeout: 2500 }); else setTimeout(warm, 1500);
  }

  /* ---- INTERAKTIVE PASCAL-FIGUR (folgt dem Cursor) ---- */
  const pViz = $("#pascalViz"), pInner = $("#pascalInner"), pImg = pViz && pViz.querySelector(".pascal__img"), pCard = $("#splineCard");
  if (pViz && pInner && pImg && pCard && !isTouch) {
    pCard.addEventListener("mousemove", (e) => {
      const r = pCard.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      pInner.style.transform = "rotateX(" + (ny * -9).toFixed(2) + "deg) rotateY(" + (nx * 13).toFixed(2) + "deg) scale(1.06)";
      pImg.style.transform = "translate(" + (nx * -14).toFixed(1) + "px," + (ny * -10).toFixed(1) + "px)";
      pViz.classList.add("touched");
    });
    pCard.addEventListener("mouseleave", () => { pInner.style.transform = "rotateX(0deg) rotateY(0deg) scale(1.03)"; pImg.style.transform = "translate(0,0)"; });
  }

  /* ---- HORIZONTAL STORY ---- */
  const track = $("#storyTrack");
  if (track && !isTouch) {
    const amount = () => track.scrollWidth - window.innerWidth + 1;
    gsap.to(track, { x: () => -amount(), ease: "none",
      scrollTrigger: { trigger: ".story", start: "top top", end: () => "+=" + amount(), scrub: 1, pin: ".story__pin", anticipatePin: 1, invalidateOnRefresh: true } });
  }

  /* ---- MARQUEES ---- */
  function marquee(el, dir, base) {
    if (!el || reduce) return;
    const half = el.scrollWidth / 2; let x = dir < 0 ? 0 : -half;
    gsap.ticker.add(() => {
      x += (base + Math.min(Math.abs(scrollVel) * 0.1, 5)) * dir;
      if (x <= -half) x += half; if (x > 0) x -= half;
      el.style.transform = "translateX(" + x + "px)";
    });
  }
  marquee($("#marq1"), -1, 0.7);
  marquee($("#logoMarq"), 1, 0.5);

  /* ---- TEAM HOVER REVEAL ---- */
  const roster = $("#roster"), float = $("#teamFloat"), floatImg = $("#teamFloatImg");
  if (roster && float && floatImg && !isTouch) {
    const xTo = gsap.quickTo(float, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(float, "y", { duration: 0.4, ease: "power3" });
    roster.addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });
    $$(".rost", roster).forEach((r) => {
      const _img = r.dataset.img; r.addEventListener("mouseenter", () => { if (!_img) return; floatImg.src = _img; float.classList.add("show"); });
      r.addEventListener("mouseleave", () => float.classList.remove("show"));
    });
    gsap.set(float, { xPercent: 0, yPercent: 0 });
  }

  /* ---- SPLINE SPOTLIGHT ---- */
  const splineCard = $("#splineCard"), spot = $("#spotlight");
  if (splineCard && spot && !isTouch) {
    splineCard.addEventListener("mousemove", (e) => { const r = splineCard.getBoundingClientRect(); spot.style.opacity = 1; spot.style.left = e.clientX - r.left - 220 + "px"; spot.style.top = e.clientY - r.top - 220 + "px"; });
    splineCard.addEventListener("mouseleave", () => { spot.style.opacity = 0; });
  }

  /* ---- MAP ---- */
  const mapCanvas = $("#mapCanvas");
  if (mapCanvas) {
    const m = mapCanvas.getContext("2d"); let W = 0, H = 0, dpr = 1, dots = [], vis = false;
    function sizeMap() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = mapCanvas.clientWidth; H = mapCanvas.clientHeight; mapCanvas.width = W * dpr; mapCanvas.height = H * dpr; m.setTransform(dpr, 0, 0, dpr, 0, 0); build(); }
    function build() { dots = []; const cx = W * .5, cy = H * .5, N = Math.min(240, (W * H / 900) | 0); for (let i = 0; i < N; i++) { const a = Math.random() * 6.2832, rad = Math.pow(Math.random(), 1.7) * Math.min(W, H) * .52; dots.push({ x: cx + Math.cos(a) * rad * (.9 + Math.random() * .5), y: cy + Math.sin(a) * rad, r: Math.random() * 1.6 + .5, d: rad, ph: Math.random() * 6.28 }); } }
    function draw(t) {
      m.clearRect(0, 0, W, H); const cx = W * .5, cy = H * .5, maxD = Math.min(W, H) * .55;
      dots.forEach((p) => { const near = 1 - Math.min(1, p.d / maxD), pulse = .5 + .5 * Math.sin(t / 700 + p.ph); m.beginPath(); m.arc(p.x, p.y, p.r, 0, 6.2832); m.fillStyle = "rgba(255,42,57," + (.1 + near * .7 * pulse) + ")"; m.fill(); });
      const g = m.createRadialGradient(cx, cy, 0, cx, cy, 70); g.addColorStop(0, "rgba(255,42,57,.5)"); g.addColorStop(1, "rgba(255,42,57,0)"); m.fillStyle = g; m.beginPath(); m.arc(cx, cy, 70, 0, 6.2832); m.fill();
      const pr = 6 + 3 * Math.sin(t / 500); m.beginPath(); m.arc(cx, cy, pr + 8, 0, 6.2832); m.strokeStyle = "rgba(255,42,57,.5)"; m.lineWidth = 1.5; m.stroke();
      m.beginPath(); m.arc(cx, cy, 6, 0, 6.2832); m.fillStyle = "#ff2a39"; m.fill(); m.beginPath(); m.arc(cx, cy, 2.4, 0, 6.2832); m.fillStyle = "#fff"; m.fill();
    }
    sizeMap(); window.addEventListener("resize", sizeMap);
    ScrollTrigger.create({ trigger: ".region", start: "top bottom", end: "bottom top", onToggle: (s) => { vis = s.isActive; } });
    (function loop(t) { if (vis) draw(t); requestAnimationFrame(loop); })(0);
  }

  /* ---- REGION-KARTE: Fluglinien nur im Viewport animieren (Perf) ---- */
  const locRoot = $(".cw-loc-root");
  if (locRoot) { ScrollTrigger.create({ trigger: locRoot, start: "top bottom", end: "bottom top", onToggle: (s) => locRoot.classList.toggle("cw-inview", s.isActive) }); }

  /* ---- FAQ single-open ---- */
  const faqItems = $$(".faq-item");
  faqItems.forEach((it) => it.addEventListener("toggle", () => { if (it.open) faqItems.forEach((o) => { if (o !== it) o.open = false; }); }));

  /* ---- YOUTUBE FACADES (lazy, privacy-friendly) ---- */
  $$(".ytfacade").forEach((f) => f.addEventListener("click", () => {
    const id = f.dataset.yt; if (!id) return;
    f.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1" title="Kundenstimme" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>';
  }));

  /* ---- NETLIFY CONTACT FORM (AJAX) ---- */
  const kForm = $("#kontaktForm"), kStatus = $("#kontaktStatus");
  if (kForm) kForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = kForm.querySelector(".cta__submit");
    kStatus.className = "cta__status"; kStatus.textContent = "Wird gesendet …";
    if (btn) btn.disabled = true;
    fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(kForm)).toString() })
      .then((r) => { if (!r.ok) throw new Error(r.status); kForm.classList.add("sent"); skatConfetti(140); kStatus.className = "cta__status ok"; kStatus.textContent = "Danke! Wir melden uns schnellstmöglich bei dir. 🙌"; })
      .catch(() => { kStatus.className = "cta__status err"; kStatus.textContent = "Hoppla – bitte erneut versuchen oder schreib an hi@content-werke.de."; if (btn) btn.disabled = false; });
  });

  /* ---- CURSOR + MAGNETIC ---- */
  const cursor = $("#cursor"), cursorLabel = $("#cursorLabel");
  if (cursor && !isTouch) {
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.16, ease: "power3" }), yTo = gsap.quickTo(cursor, "y", { duration: 0.16, ease: "power3" });
    window.addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });
    $$("a, button, [data-cursor], summary").forEach((el) => {
      el.addEventListener("mouseenter", () => { cursor.classList.add("hover"); cursorLabel.textContent = el.dataset.cursor || ""; });
      el.addEventListener("mouseleave", () => { cursor.classList.remove("hover"); cursorLabel.textContent = ""; });
    });
    $$("[data-cursor], .sidenav__cta, .btn").forEach((el) => {
      if (el.matches(".btn, .topbar__cta")) el.classList.add("is-magnetic");
      const qx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" }), qy = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
      el.addEventListener("mousemove", (e) => { const r = el.getBoundingClientRect(); qx((e.clientX - (r.left + r.width / 2)) * 0.2); qy((e.clientY - (r.top + r.height / 2)) * 0.3); });
      el.addEventListener("mouseleave", () => { gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" }); });
    });
  }

  /* ---- PROGRESS ---- */
  const pb = $("#progressBar");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => { if (pb) pb.style.width = s.progress * 100 + "%"; } });

  /* ---- ANCHORS + MOBILE MENU ---- */
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => { const id = a.getAttribute("href"); if (id.length < 2) return; const el = $(id); if (!el) return; e.preventDefault(); closeMobile(); scrollToEl(el); }));
  const mobToggle = $("#mobToggle"), mobilebar = $("#topbar");
  const menu = document.createElement("nav"); menu.className = "mobile-menu";
  menu.innerHTML = navLinks.map((l) => `<a href="#${l.dataset.target}" data-target="${l.dataset.target}">${$(".nav-link__label", l).textContent}</a>`).join("");
  document.body.appendChild(menu);
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", (e) => { const el = $(a.getAttribute("href")); if (!el) return; e.preventDefault(); closeMobile(); scrollToEl(el); }));
  function closeMobile() { menu.classList.remove("open"); if (mobilebar) mobilebar.classList.remove("open"); if (mobToggle) mobToggle.setAttribute("aria-expanded", "false"); }
  if (mobToggle) mobToggle.addEventListener("click", () => { const o = menu.classList.toggle("open"); mobilebar.classList.toggle("open", o); mobToggle.setAttribute("aria-expanded", o ? "true" : "false"); });

  /* ---- MODAL ---- */
  $$("[data-modal]").forEach((b) => b.addEventListener("click", () => { const md = $("#" + b.dataset.modal); if (md) { md.hidden = false; document.body.classList.add("locked"); if (lenis) lenis.stop(); } }));
  $$("[data-close]").forEach((el) => el.addEventListener("click", () => { const md = el.closest(".modal"); if (md) { md.hidden = true; document.body.classList.remove("locked"); if (lenis) lenis.start(); } }));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $$(".modal").forEach((md) => { if (!md.hidden) { md.hidden = true; document.body.classList.remove("locked"); if (lenis) lenis.start(); } }); });

  /* ---- AI ASSISTANT ---- */
  (function initAI() {
    const fab = $("#aiFab"), panel = $("#aiPanel"), closeBtn = $("#aiClose"), log = $("#aiLog"), chipsBox = $("#aiChips"), form = $("#aiForm"), input = $("#aiInput");
    if (!fab || !panel) return;
    const CONTACT = 'Am besten im kostenlosen Erstgespräch: <a href="#kontakt">Termin sichern</a>, per Mail <a href="mailto:hi@content-werke.de">hi@content-werke.de</a> oder Anruf <a href="tel:+4934491208610">+49 34491 208610</a>.';
    const START = ["Was macht ihr?", "Was kostet das?", "Termin sichern", "Wo seid ihr?"];
    const GREET = "Moin! 👋 Ich bin die <strong>Contentwerke·KI</strong>. Frag mich zu Leistungen, Preisen, Ablauf oder Terminen – ich helfe dir sofort weiter.";
    const FALLBACK = "Gute Frage! Das klärt Pascal am besten direkt mit dir. " + CONTACT + " Oder frag mich zu <strong>Leistungen</strong>, <strong>Preisen</strong>, <strong>Team</strong> oder <strong>Standort</strong>.";
    const KB = [
      { k: ["hallo", "moin", "servus", "hey", "guten tag", "guten morgen", "na "], a: GREET, c: START },
      { k: ["was macht", "was bietet", "leistung", "angebot", "services", "womit", "helfen", "hilfe"], a: "Wir sind deine Socialagentur aus einer Hand: <strong>Strategie &amp; Beratung</strong>, <strong>Social Media</strong>, <strong>Digitalisierung</strong>, <strong>Employer Branding</strong> und <strong>Websites</strong>. Worüber willst du mehr wissen?", c: ["Social Media", "Website", "Werbeanzeigen", "Employer Branding"] },
      { k: ["social", "instagram", "tiktok", "reel", "posten", "content", "kanal", "kanäle", "kanaele"], a: "Wir machen <strong>Social Media, das gefunden und geteilt wird</strong>: Reels, Shorts &amp; Foto-Content, Redaktionsplan und Community-Betreuung – kreativ, regelmäßig, mit Wiedererkennung. Auf Wunsch übernehmen wir deine Kanäle komplett.", c: ["Was kostet das?", "Ablauf?", "Termin sichern"] },
      { k: ["website", "webseite", "homepage", "webdesign", "landingpage", "web ", "seite bauen"], a: "Wir bauen <strong>Websites, die verkaufen statt nur nett auszusehen</strong> – schnell, fürs Handy gemacht und auf echte Anfragen optimiert.", c: ["Was kostet das?", "Referenzen", "Termin sichern"] },
      { k: ["werbe", "anzeige", "ads", "kampagne", "werbung", "performance"], a: "Werbeanzeigen bringen dich schnell vor die <strong>richtigen Leute</strong>. Wir planen, gestalten und optimieren Kampagnen mit klarem Ziel – messbar statt Bauchgefühl.", c: ["Was kostet das?", "Termin sichern"] },
      { k: ["mitarbeiter", "bewerber", "recruit", "employer", "personal", "fachkräfte", "fachkraefte", "stellen", "azubi", "neue leute"], a: "<strong>Employer Branding, das Bewerber bringt</strong>: Wir zeigen authentisch und regional, warum man genau bei dir arbeiten will – mit Arbeitgeber-Content und Recruiting-Kampagnen.", c: ["Ablauf?", "Termin sichern"] },
      { k: ["strategie", "beratung", "roter faden", "konzept", "analyse", "plan"], a: "Kein Plan, kein roter Faden? Wir starten mit <strong>ehrlicher Analyse und klarer Strategie</strong> – Marken- &amp; Contentstrategie, Wettbewerbsanalyse und eine Roadmap für dein Wachstum. <em>Zielgerichtet. Wirksam.</em>", c: ["Leistungen", "Termin sichern"] },
      { k: ["digitalisier", "prozess", "abläufe", "ablaeufe", "automatisier", "tools", "workflow"], a: "Wir digitalisieren deine <strong>Abläufe</strong>, damit Anfragen, Termine und Content nicht im Chaos verschwinden, sondern planbar laufen – weniger Handarbeit, mehr Fokus.", c: ["Termin sichern"] },
      { k: ["kosten", "preis", "kostet", "teuer", "budget", "günstig", "guenstig", "paket", "invest", "tarif", "was zahle"], w: 3, a: "Ehrliche Antwort: Das hängt vom Umfang ab – wir schnüren dir ein Paket, das zu deinen Zielen und deinem Budget passt. " + CONTACT, c: ["Termin sichern", "Was macht ihr?"] },
      { k: ["ablauf", "wie läuft", "wie laeuft", "zusammenarbeit", "onboarding", "erste schritt", "wie funktioniert", "wie startet"], a: "So läuft es: <strong>1)</strong> Kennenlernen &amp; Analyse → <strong>2)</strong> klare Strategie → <strong>3)</strong> Umsetzung → <strong>4)</strong> messen &amp; verbessern. Fester Ansprechpartner, transparenter Fahrplan, kurze Wege.", c: ["Termin sichern", "Was kostet das?"] },
      { k: ["termin", "kontakt", "anfrage", "erreichen", "melden", "anrufen", "email", "e-mail", " mail", "telefon", "call", "gespräch", "gespraech", "erstgespräch", "erstgespraech", "buchen"], w: 2, a: "Sehr gern! " + CONTACT, c: ["Wo seid ihr?", "Was macht ihr?"] },
      { k: ["wo ", "standort", "adresse", "altenburg", "schmolln", "thüringen", "thueringen", "sachsen", "region", "umgebung", "vor ort", "nähe", "naehe"], a: "Wir sitzen in <strong>Schmolln im Altenburger Land</strong> (Saaraer Weg 5a, 04626 Schmolln) und sind im gesamten mitteldeutschen Raum – Thüringen &amp; Sachsen – für dich da. <em>Ausm Osten. Für den Osten.</em>", c: ["Termin sichern", "Team"] },
      { k: ["team", "wer seid", "crew", "pascal", "gründer", "gruender", "chef", "köpfe", "koepfe", "leute", "lenny"], a: "Wir sind eine junge Crew aus dem Altenburger Land – IT, Content, Kamera &amp; Schnitt. Geführt von <strong>Pascal Zopora</strong> (Geschäftsführer &amp; „Der Jobfluencer“). Scroll hoch zum <a href=\"#team\">Team</a>.", c: ["Unsere Geschichte", "Termin sichern"] },
      { k: ["geschichte", "seit wann", "gegründet", "gegruendet", "gründung", "gruendung", "jobfluencer", "angefangen", "entstanden", "1 tag als", "youtube"], a: "Angefangen 2021 mit einer Idee, gewachsen über YouTube &amp; das Format „1 Tag als“ (<strong>Der Jobfluencer</strong>). 2025 kam der erste Kunde (VR-Bank Altenburger Land) – heute die <strong>Contentwerke GmbH</strong>. Ganze Story: <a href=\"#story\">hier</a>.", c: ["Team", "Termin sichern"] },
      { k: ["warum", "weshalb", "vorteil", "besonders", "unterschied", "überzeug", "ueberzeug"], a: "Weil wir <strong>hier leben und arbeiten</strong>: kurze Wege, ehrliche Kommunikation und Ergebnisse, die man messen kann – alles aus einer Hand. <em>Weniger reden. Mehr machen.</em>", c: ["Referenzen", "Termin sichern"] },
      { k: ["reichweite", "ergebnis", "erfolg", "messbar", "wachstum", "zahlen", "kennzahl", "roi", "bringt", "follower"], a: "Wir denken in echten Zahlen: <strong>Reichweite, Followerzuwachs, Engagement</strong> – und vor allem echte Anfragen. Bei Kunden wie EDO oder David Jähler waren das dreistellige Zuwächse. <em>Messbar statt Bauchgefühl.</em>", c: ["Referenzen", "Termin sichern"] },
      { k: ["referenz", "kunde", "beispiel", "case", "projekt", "edo", "opitz", "vr-bank", "jähler", "jaehler"], a: "Ein paar Partner: <strong>EDO Elektrogroßhandel</strong>, <strong>Gartengestaltung David Jähler</strong>, <strong>Opitz Ausbaugesellschaft</strong> und die <strong>VR-Bank Altenburger Land</strong>. Stimmen &amp; Zahlen: <a href=\"#cases\">Cases</a>.", c: ["Termin sichern", "Was kostet das?"] },
      { k: ["danke", "dankeschön", "dankeschoen", "thx", "merci", "top", "super", "perfekt", "klasse"], a: "Immer gerne! 🙌 Wenn du loslegen willst: " + CONTACT, c: START },
      { k: ["bist du echt", "bist du ein mensch", "bist du eine ki", "bist du ein bot", "roboter", " bot", "künstliche", "kuenstliche", "chatbot"], a: "Ich bin ein <strong>smarter Assistent</strong> – keine echte Person. Für eine persönliche Beratung schnapp dir am besten ein Erstgespräch mit dem Team. " + CONTACT, c: START },
      { k: ["tschüss", "tschuess", "ciao", "bye", "wiedersehen", "bis dann"], a: "Bis bald – und denk dran: <em>Ausm Osten. Für den Osten.</em> 👋", c: ["Termin sichern"] },
      { k: ["erreichbar", "öffnungszeit", "oeffnungszeit", "wann erreichbar", "wochenende", "zeiten", "uhrzeit"], a: "Kurze Wege, schnelle Antworten. Schreib uns einfach – wir melden uns zügig zurück. " + CONTACT, c: ["Termin sichern"] },
    ];
    const norm = (s) => s.toLowerCase().replace(/[^\wäöüß\s-]/g, " ");
    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    function find(q) {
      const n = " " + norm(q) + " "; let best = null, sc = 0;
      for (const it of KB) { let s = 0; for (const k of it.k) if (n.includes(k)) s += (k.length > 4 ? 2 : 1) * (it.w || 1); if (s > sc) { sc = s; best = it; } }
      return sc > 0 ? best : null;
    }
    function addMsg(html, who) { const d = document.createElement("div"); d.className = "ai-msg ai-msg--" + who; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; }
    function chips(arr) { chipsBox.innerHTML = ""; (arr || []).forEach((t) => { const b = document.createElement("button"); b.type = "button"; b.className = "ai-chip"; b.textContent = t; b.addEventListener("click", () => handle(t)); chipsBox.appendChild(b); }); }
    function typing() { const d = document.createElement("div"); d.className = "ai-typing"; d.innerHTML = "<i></i><i></i><i></i>"; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
    function reply(html, c) { const t = typing(); setTimeout(() => { t.remove(); addMsg(html, "bot"); chips(c); }, Math.min(1500, 500 + html.length * 7)); }
    function handle(text) { addMsg(esc(text), "user"); chips([]); const it = find(text); reply(it ? it.a : FALLBACK, it ? (it.c || START) : START); }
    let greeted = false;
    function open() { panel.hidden = false; fab.classList.add("hide"); setTimeout(() => input.focus(), 100); if (!greeted) { greeted = true; reply(GREET, START); } }
    function close() { panel.hidden = true; fab.classList.remove("hide"); }
    fab.addEventListener("click", open); closeBtn.addEventListener("click", close);
    form.addEventListener("submit", (e) => { e.preventDefault(); const v = input.value.trim(); if (!v) return; input.value = ""; handle(v); });
    log.addEventListener("click", (e) => { const a = e.target.closest('a[href^="#"]'); if (a) { e.preventDefault(); const el = $(a.getAttribute("href")); if (el) { close(); scrollToEl(el); } } });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) close(); });
  })();

  /* ---- COOKIE CONSENT + META PIXEL (nur mit Zustimmung) ---- */
  (function initConsent() {
    const banner = $("#cookieConsent"), KEY = "cw_consent";
    if (!banner) return;
    const store = (v) => { try { localStorage.setItem(KEY, v); } catch (e) {} };
    const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
    function loadPixel() {
      if (window.fbq) return;
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", "876906785220745"); window.fbq("track", "PageView");
    }
    const saved = read();
    if (saved === "accepted") loadPixel();
    else if (saved !== "declined") banner.hidden = false;
    const acc = $("#ccAccept"), dec = $("#ccDecline");
    if (acc) acc.addEventListener("click", () => { store("accepted"); banner.hidden = true; loadPixel(); });
    if (dec) dec.addEventListener("click", () => { store("declined"); banner.hidden = true; });
    $$("[data-cookie-settings]").forEach((el) => el.addEventListener("click", (e) => { e.preventDefault(); banner.hidden = false; }));
  })();

  /* ---- STICKY MOBILE CTA ---- */
  (function initMobileCta() {
    const cta = $("#mobileCta"); if (!cta) return;
    const upd = () => {
      const y = window.scrollY, vh = window.innerHeight, k = $("#kontakt");
      const nearKontakt = k && k.getBoundingClientRect().top < vh * 0.9;
      cta.classList.toggle("hide", y < vh * 0.6 || !!nearKontakt);
    };
    (lenis ? lenis.on("scroll", upd) : window.addEventListener("scroll", upd, { passive: true }));
    window.addEventListener("resize", upd); upd();
  })();

  /* ============================================================
     SPIELEREIEN (Tilt · Scramble-Nav · Live-Uhr · Skat-Konfetti ·
     Cursor-Funken · Easter Egg "Ostmodus")
     ============================================================ */

  /* ---- Skat-Konfetti (Altenburg = Geburtsstadt des Skat) ---- */
  function skatConfetti(count) {
    if (reduce) return;
    count = count || 130;
    var cv = document.createElement("canvas");
    cv.className = "skat-confetti";
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = window.innerWidth, H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    document.body.appendChild(cv);
    var g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var suits = [
      { s: "♠", c: "#e9e7e0" }, // Pik
      { s: "♣", c: "#e9e7e0" }, // Kreuz
      { s: "♥", c: "#ff2a39" }, // Herz
      { s: "♦", c: "#ff2a39" }  // Karo
    ];
    var P = [];
    for (var n = 0; n < count; n++) {
      var su = suits[(Math.random() * 4) | 0];
      P.push({
        x: Math.random() * W, y: -30 - Math.random() * H * 0.6,
        vy: 2.2 + Math.random() * 3.6, vx: (Math.random() - 0.5) * 2.4,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.26,
        size: 13 + Math.random() * 18, suit: su, sway: Math.random() * 6.28
      });
    }
    var start = performance.now(), last = start, raf;
    function loop(now) {
      var dt = Math.min(48, now - last); last = now;
      g.clearRect(0, 0, W, H);
      var alive = 0;
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        p.sway += 0.03; p.x += p.vx + Math.sin(p.sway) * 0.8; p.y += p.vy * (dt / 16.7); p.rot += p.vr;
        if (p.y < H + 50) alive++;
        var fade = p.y > H * 0.82 ? Math.max(0, 1 - (p.y - H * 0.82) / (H * 0.25)) : 1;
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.globalAlpha = fade;
        g.fillStyle = p.suit.c; g.font = "700 " + p.size + "px serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(p.suit.s, 0, 0); g.restore();
      }
      if (alive > 0 && now - start < 6000) { raf = requestAnimationFrame(loop); }
      else { cancelAnimationFrame(raf); cv.remove(); }
    }
    raf = requestAnimationFrame(loop);
  }

  /* ---- Toast ---- */
  function showToast(msg) {
    var t = document.createElement("div"); t.className = "cw-toast"; t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () { t.classList.remove("show"); setTimeout(function () { t.remove(); }, 400); }, 2600);
  }

  /* ---- 3D-Tilt auf Karten ---- */
  if (!isTouch && !reduce) {
    $$(".acard, .case").forEach(function (card) {
      card.classList.add("tiltable");
      var r = null;
      card.addEventListener("mouseenter", function () { r = card.getBoundingClientRect(); });
      card.addEventListener("mousemove", function (e) {
        if (!r) r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (py * -5).toFixed(2) + "deg) rotateY(" + (px * 7).toFixed(2) + "deg)";
      });
      card.addEventListener("mouseleave", function () { r = null; card.style.transform = ""; });
    });
  }

  /* ---- (Nav-Scramble-Hover entfernt – Nav ist jetzt schlicht unterstrichen) ---- */

  /* ---- Live-Uhr Altenburg im HUD ---- */
  (function heroClock() {
    var hud = $("#hudCoord"); if (!hud) return;
    function tick() {
      var t = new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Berlin" });
      hud.textContent = "ALTENBURG · 51.02°N 12.38°O · " + t;
    }
    tick(); setInterval(tick, 1000);
  })();

  /* ---- Cursor-Funken-Trail ---- */
  if (!isTouch && !reduce) {
    var tcv = document.createElement("canvas"); tcv.className = "cursor-trail";
    var tg = tcv.getContext("2d");
    var tdpr = Math.min(window.devicePixelRatio || 1, 2);
    function fitTrail() { tcv.width = window.innerWidth * tdpr; tcv.height = window.innerHeight * tdpr; tg.setTransform(tdpr, 0, 0, tdpr, 0, 0); }
    fitTrail(); window.addEventListener("resize", fitTrail);
    document.body.appendChild(tcv);
    var sparks = [], tRun = false, tlx = 0, tly = 0, tHas = false;
    window.addEventListener("mousemove", function (e) {
      if (tHas) {
        var dx = e.clientX - tlx, dy = e.clientY - tly, d = Math.hypot(dx, dy);
        var cnt = Math.min(3, 1 + (d / 16 | 0));
        for (var k = 0; k < cnt; k++) {
          var tt = cnt > 1 ? k / cnt : 0;
          sparks.push({ x: tlx + dx * tt, y: tly + dy * tt, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8 - 0.25, life: 1, size: 1.4 + Math.random() * 2.4 });
        }
        if (sparks.length > 160) sparks.splice(0, sparks.length - 160);
      }
      tlx = e.clientX; tly = e.clientY; tHas = true;
      if (!tRun) { tRun = true; requestAnimationFrame(trailLoop); }
    }, { passive: true });
    function trailLoop() {
      tg.clearRect(0, 0, window.innerWidth, window.innerHeight);
      tg.globalCompositeOperation = "lighter";
      for (var i = sparks.length - 1; i >= 0; i--) {
        var s = sparks[i]; s.life -= 0.05; s.x += s.vx; s.y += s.vy; s.vy += 0.02;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        tg.globalAlpha = Math.max(0, s.life) * 0.7;
        tg.fillStyle = "#ff2a39";
        tg.beginPath(); tg.arc(s.x, s.y, s.size * s.life + 0.4, 0, 6.2832); tg.fill();
      }
      tg.globalAlpha = 1; tg.globalCompositeOperation = "source-over";
      if (sparks.length) requestAnimationFrame(trailLoop); else tRun = false;
    }
  }

  /* ---- Easter Egg: Konami -> "Ostmodus" ---- */
  (function konami() {
    var seq = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
    var i = 0;
    document.addEventListener("keydown", function (e) {
      var k = (e.key || "").toLowerCase();
      if (k === seq[i]) { i++; } else { i = (k === seq[0]) ? 1 : 0; }
      if (i === seq.length) {
        i = 0;
        document.body.classList.add("ostmodus");
        skatConfetti(170);
        showToast("Ausm Osten. Für den Osten. 🔥");
        setTimeout(function () { document.body.classList.remove("ostmodus"); }, 2200);
      }
    });
  })();


  /* ============================================================
     REDESIGN v2 — Header, Bridge, Springbrunnen, Konfigurator, Team
     ============================================================ */

  /* ---- TOP HEADER scrolled state ---- */
  (function topbarState(){
    const bar = $("#topbar"); if (!bar) return;
    const upd = () => bar.classList.toggle("scrolled", window.scrollY > 40);
    upd(); (lenis ? lenis.on("scroll", upd) : window.addEventListener("scroll", upd, { passive: true }));
  })();

  /* ---- BRIDGE line grow (Problem -> Markt) ---- */
  (function bridge(){
    const line = $("#bridgeLine"); if (!line || reduce) return;
    gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#marktBridge", start: "top 85%", end: "bottom 55%", scrub: true } });
  })();

  /* ---- TEAM cards reveal ---- */
  (function teamReveal(){
    const cards = $$(".cw-card"); if (!cards.length) return;
    if (!("IntersectionObserver" in window) || reduce) { cards.forEach(c => c.classList.add("is-in")); return; }
    const io = new IntersectionObserver((es) => { es.forEach(e => { if (e.isIntersecting) { const i = cards.indexOf(e.target); e.target.style.transitionDelay = Math.min(i, 8) * 55 + "ms"; e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { threshold: 0.12 });
    cards.forEach(c => io.observe(c));
  })();

  /* ---- LOGO-FONTÄNE pro Branche (fallen an den unteren Bildschirmrand, größer & farbig) ---- */
  (function springLogos(){
    const cards = $$("#audienceGrid .acard"); if (!cards.length || reduce) return;
    cards.forEach((card) => {
      const names = (card.dataset.logos || "").split(",").map(s => s.trim()).filter(Boolean);
      if (!names.length) return;
      const chips = names.map((n) => {
        const el = document.createElement("span"); el.className = "acard__chip";
        const img = document.createElement("img"); img.src = "assets/img/logos/" + n + ".png"; img.alt = ""; img.loading = "lazy";
        el.appendChild(img); document.body.appendChild(el); return el;
      });
      let spraying = false, raf = 0; const active = [];
      const size = () => (window.innerWidth < 640 ? 62 : 86);
      const floorY = (s) => window.innerHeight - s - 14;
      function slotX(idx, n, s){
        const band = Math.min(window.innerWidth - 48, 1100);
        const left = (window.innerWidth - band) / 2;
        const t = n <= 1 ? 0.5 : idx / (n - 1);
        return left + band * t - s / 2;
      }
      function launch(){
        const chip = chips.find(c => !c._on); if (!chip) return; chip._on = true;
        const idx = chips.indexOf(chip), s = size(); chip._size = s;
        chip.style.width = s + "px"; chip.style.height = s + "px";
        const r = card.getBoundingClientRect();
        chip._x = r.left + r.width / 2 - s / 2 + (Math.random() - 0.5) * r.width * 0.5;
        chip._y = r.top + r.height / 2 - s / 2;
        chip._slot = slotX(idx, chips.length, s);
        chip._vy = -(6 + Math.random() * 9);
        chip._vx = (chip._slot - chip._x) * 0.012;
        chip._rot = (Math.random() - 0.5) * 16; chip._vr = (Math.random() - 0.5) * 3;
        chip._rest = false; chip.style.opacity = "1"; active.push(chip);
      }
      function tick(){
        const g = 0.6; let moving = false;
        for (let i = 0; i < active.length; i++) {
          const c = active[i]; const fl = floorY(c._size);
          if (c._rest) {
            if (Math.abs(c._slot - c._x) > 0.5 || Math.abs(c._rot) > 0.3) {
              c._x += (c._slot - c._x) * 0.15; c._rot += (0 - c._rot) * 0.15;
              c.style.transform = "translate(" + c._x.toFixed(1) + "px," + fl.toFixed(1) + "px) rotate(" + c._rot.toFixed(1) + "deg)";
              moving = true;
            }
            continue;
          }
          c._vy += g; c._x += c._vx; c._y += c._vy; c._rot += c._vr;
          if (c._y >= fl && c._vy > 0) {
            if (c._vy > 4) { c._y = fl; c._vy *= -0.26; c._vx *= 0.6; c._vr *= 0.5; }
            else { c._y = fl; c._vy = 0; c._vx = 0; c._vr = 0; c._rest = true; }
          }
          c.style.transform = "translate(" + c._x.toFixed(1) + "px," + c._y.toFixed(1) + "px) rotate(" + c._rot.toFixed(1) + "deg)";
          moving = true;
        }
        if (spraying && Math.random() < 0.12) launch();
        if (spraying || moving) raf = requestAnimationFrame(tick); else raf = 0;
      }
      function clearChips(){ active.length = 0; chips.forEach(c => { c._on = false; c._rest = false; c.style.opacity = "0"; c.style.transform = ""; }); }
      const start = () => { if (spraying) return; spraying = true; if (!raf) raf = requestAnimationFrame(tick); };
      const stop = () => { spraying = false; setTimeout(() => { if (!spraying) clearChips(); }, 600); };
      if (!isTouch) { card.addEventListener("mouseenter", start); card.addEventListener("mouseleave", stop); }
      card.addEventListener("click", () => { start(); setTimeout(stop, 3500); });
    });
  })();

  /* ---- BOOKING / KONFIGURATOR (Single-Page) ---- */
  (function booking(){
    const bk = $("#booking"); if (!bk) return;
    const SERV = {
      "Social Media": { desc: "Content, der nicht im Feed untergeht, sondern gefunden und geteilt wird – kreativ, regelmäßig, mit Wiedererkennung.", umfang: ["Starter", "Laufende Betreuung"], incl: ["Reels & Shorts", "Foto-Content", "Redaktionsplan", "Community-Management"], img: "assets/img/konfig/social.jpg" },
      "Mitarbeiter- & Kundenkampagnen": { desc: "Kampagnen, die die richtigen Menschen erreichen: neue Kunden fürs Geschäft und neue Bewerber fürs Team.", umfang: ["Einmalige Kampagne", "Laufend"], incl: ["Recruiting-Kampagnen", "Werbeanzeigen (Meta & Co.)", "Zielgruppen-Targeting", "Reporting"], img: "assets/img/konfig/kampagnen.jpg" },
      "Website": { desc: "Eine Website, die verkauft statt nur nett auszusehen – schnell, klar und auf Anfragen ausgelegt.", umfang: ["Onepager", "Mehrseitig"], incl: ["Design & Umsetzung", "Für Handy gemacht", "SEO-Basics", "Auf Anfragen optimiert"], img: "assets/img/konfig/website.jpg" },
      "Rundum-Betreuung": { desc: "Alles aus einer Hand – du machst dein Business, wir kümmern uns um den Rest.", umfang: ["Nach Bedarf"], incl: ["Social Media", "Kampagnen", "Website", "Fester Ansprechpartner"], img: "assets/img/konfig/rundum.jpg" }
    };
    const state = { serv: "Social Media", umfang: "", groesse: "", start: "" };
    const titleServ = $("#bkTitleServ", bk), servDesc = $("#bkServDesc", bk), umfangBox = $("#bkUmfang", bk), inclBox = $("#bkIncl", bk), sumBox = $("#bkSum", bk);
    const form = $("#bookingForm", bk), sendBtn = $("#bkSend", bk), status = $("#bkStatus"), done = $("#bkDone", bk);
    const previewImg = $("#bkPreviewImg", bk), previewPh = $("#bkPreviewPh", bk);

    function open(){ bk.classList.add("open"); bk.setAttribute("aria-hidden", "false"); document.body.classList.add("locked"); if (lenis) lenis.stop(); }
    function close(){ bk.classList.remove("open"); bk.setAttribute("aria-hidden", "true"); document.body.classList.remove("locked"); if (lenis) lenis.start(); }
    $$("[data-book]").forEach(b => b.addEventListener("click", (e) => { e.preventDefault(); open(); }));
    $("#bkClose", bk).addEventListener("click", close);
    $$("[data-bkclose]", bk).forEach(el => el.addEventListener("click", close));
    const dc = $("#bkDoneClose", bk); if (dc) dc.addEventListener("click", () => { close(); resetDone(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && bk.classList.contains("open")) close(); });

    // Tabs (Haupt-Leistung)
    $$(".bk-tab", bk).forEach(t => t.addEventListener("click", () => {
      $$(".bk-tab", bk).forEach(x => x.classList.remove("active")); t.classList.add("active");
      state.serv = t.dataset.serv; renderServ(); sum();
    }));
    // Segmente (Umfang / Größe / Start) – Delegation
    bk.addEventListener("click", (e) => {
      const b = e.target.closest(".bk-seg2 button"); if (!b) return;
      const seg = b.closest(".bk-seg2"), key = seg.dataset.key;
      const on = b.classList.contains("sel");
      $$("button", seg).forEach(x => x.classList.remove("sel"));
      if (!on) { b.classList.add("sel"); state[key] = b.dataset.val; } else state[key] = "";
      sum();
    });

    function renderServ(){
      const d = SERV[state.serv]; if (!d) return;
      titleServ.textContent = ({ "Mitarbeiter- & Kundenkampagnen": "Kampagnen", "Rundum-Betreuung": "Rundum-Betreuung" })[state.serv] || state.serv;
      servDesc.textContent = d.desc;
      if (previewPh) previewPh.textContent = "Bild folgt · " + titleServ.textContent;
      if (previewImg) { previewImg.hidden = true; if (previewPh) previewPh.hidden = false; previewImg.onload = function(){ previewImg.hidden = false; if (previewPh) previewPh.hidden = true; }; previewImg.onerror = function(){ previewImg.hidden = true; if (previewPh) previewPh.hidden = false; }; previewImg.src = d.img || ""; previewImg.alt = titleServ.textContent; }
      umfangBox.innerHTML = d.umfang.map((u, i) => '<button type="button" data-val="' + u + '"' + (i === 0 ? ' class="sel"' : '') + '>' + u + '</button>').join("");
      state.umfang = d.umfang[0] || "";
      if (inclBox) inclBox.innerHTML = d.incl.map(x => '<li>' + x + '</li>').join("");
    }
    function row(k, v){ return '<div class="bk-sum__row"><span>' + k + '</span><span>' + v + '</span></div>'; }
    function sum(){
      let html = row("Leistung", titleServ.textContent);
      if (state.umfang) html += row("Umfang", state.umfang);
      if (state.groesse) html += row("Größe", state.groesse);
      if (state.start) html += row("Start", state.start);
      sumBox.innerHTML = html;
    }
    function fillHidden(){
      $("#bkH_serv", bk).value = state.serv;
      $("#bkH_umfang", bk).value = state.umfang || "—";
      $("#bkH_groesse", bk).value = state.groesse || "—";
      $("#bkH_start", bk).value = state.start || "—";
    }
    function submit(){
      if (!form.checkValidity()) { form.reportValidity(); return; }
      fillHidden();
      status.textContent = "Wird gesendet …"; status.className = "booking__status"; sendBtn.disabled = true;
      fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(form)).toString() })
        .then(r => { if (!r.ok) throw 0; showDone(); })
        .catch(() => { status.textContent = "Hoppla – bitte erneut versuchen oder schreib an hi@content-werke.de."; status.className = "booking__status err"; sendBtn.disabled = false; });
    }
    sendBtn.addEventListener("click", submit);
    function showDone(){ done.classList.add("active"); if (typeof skatConfetti === "function") skatConfetti(150); }
    function resetDone(){ done.classList.remove("active"); sendBtn.disabled = false; status.textContent = ""; }

    renderServ(); sum();
  })();

  /* ============================================================
     AWWWARDS-PASS v9 — cinematische Bild-Reveals
     (Clip-Path-Wipe, Ken-Burns — GPU-schonend, reduce/touch-sicher)
     Hinweis: Magnetik auf Buttons/CTAs läuft zentral im CURSOR-Block
     (siehe „CURSOR + MAGNETIC"), daher hier kein zweites Magnet-System.
     ============================================================ */

  /* ---- CINEMATIC IMAGE REVEALS (Clip-Path-Wipe nach oben + leichter Ken-Burns) ---- */
  (function imageReveals(){
    if (reduce || !window.gsap) return;
    $$(".svc__media img, .showcase__item img, .reel img").forEach((img) => {
      gsap.set(img, { clipPath: "inset(100% 0% 0% 0%)", scale: 1.08, transformOrigin: "50% 60%" });
      gsap.to(img, {
        clipPath: "inset(0% 0% 0% 0%)", scale: 1,
        duration: 1.25, ease: "power4.out",
        scrollTrigger: { trigger: img, start: "top 88%", once: true }
      });
    });
  })();

  /* ---- PROBLEM ↔ LÖSUNG: 3D-Flip (scroll-gesteuert, Variante „Bühne") ---- */
  (function problemFlip(){
    const card = $("#flipcard"); if (!card || !window.gsap) return;
    if (reduce) { card.classList.add("is-static"); return; }
    let extra = 0;           // manuelle Klick-Drehung (akkumuliert → dreht immer weiter vor)
    const proxy = { r: 0 };  // Scroll-Drehung 0..180 (per Scrub geglättet)
    const paint = () => gsap.set(card, { rotateY: proxy.r + extra });
    gsap.set(card, { rotateY: 0 });
    gsap.to(proxy, {
      r: 180, ease: "none",
      scrollTrigger: { trigger: ".manifest__stage", start: "top 80%", end: "top 34%", scrub: 0.5 },
      onUpdate: paint
    });
    // Klick / Tap / Tastatur: dreht die Karte nochmal eine halbe Umdrehung weiter
    const flip = () => { extra += 180; gsap.to(card, { rotateY: proxy.r + extra, duration: 0.85, ease: "power3.inOut" }); };
    card.addEventListener("click", flip);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
  })();

  /* ---- THEME TOGGLE (hell / dunkel) ---- */
  (function theme(){
    const btn = $("#themeToggle"); if (!btn) return;
    const root = document.documentElement;
    const apply = (t) => {
      if (t === "light") root.setAttribute("data-theme", "light");
      else root.removeAttribute("data-theme");
      btn.setAttribute("aria-pressed", t === "light" ? "true" : "false");
    };
    let cur = (() => { try { return localStorage.getItem("cw_theme") || "dark"; } catch (e) { return "dark"; } })();
    apply(cur);
    btn.addEventListener("click", () => {
      cur = cur === "light" ? "dark" : "light"; apply(cur);
      try { localStorage.setItem("cw_theme", cur); } catch (e) {}
      // Farben der Sektionen neu vermessen (pin/scrub bleiben korrekt)
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  })();

  /* ---- REFERENZEN: horizontal scrollbar (Drag + Mausrad) ---- */
  (function refsScroller(){
    const grid = $(".refs__grid"); if (!grid) return;
    grid.classList.add("is-draggable");
    // vertikales Mausrad -> horizontal (Lenis greift hier nicht rein)
    grid.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // horizontale Wheels in Ruhe lassen
      // Nur hijacken, wenn der horizontale Scroll die Bewegung WIRKLICH verbraucht.
      // Am linken/rechten Ende bleibt scrollLeft unverändert -> Seite scrollt normal weiter (keine Falle).
      const before = grid.scrollLeft;
      grid.scrollLeft += e.deltaY;
      if (grid.scrollLeft !== before) { e.preventDefault(); e.stopPropagation(); }
    }, { passive: false });
    // Drag mit Maus/Pointer
    let down = false, startX = 0, startLeft = 0, moved = 0;
    grid.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      down = true; moved = 0; startX = e.clientX; startLeft = grid.scrollLeft;
      grid.classList.add("is-grabbing");
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
      grid.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", () => { down = false; grid.classList.remove("is-grabbing"); });
    // Klick nach Drag unterdrücken (verhindert versehentliche Links)
    grid.addEventListener("click", (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  })();

  $("#year").textContent = new Date().getFullYear();
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
