/* The Joyboy Labs: motion layer (GSAP + ScrollTrigger + SplitText + Lenis)
   Respects prefers-reduced-motion. Fails safe: if anything is missing, the page just shows normally. */
(() => {
  const root = document.documentElement;
  const bail = () => root.classList.remove("js-motion");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap || !window.ScrollTrigger || !window.SplitText || !window.Lenis) return bail();

  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Lenis: smooth scroll, driven by GSAP's ticker ---------- */
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, anchors: { offset: -70 } });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  // The nav has its own wheel-to-horizontal scroll and a scrollable mobile menu: let them be.
  $$("#primary-navigation").forEach((el) => el.setAttribute("data-lenis-prevent", ""));

  /* ---------- Split headings into masked lines ---------- */
  const splitLines = (el) =>
    SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" });

  const run = () => {
    const ease = "expo.out";

    /* HERO: one timeline, deliberate order */
    const h1 = $(".home-hero h1");
    if (h1) {
      const split = splitLines(h1);
      gsap.set(h1, { visibility: "visible" });
      const tl = gsap.timeline({ defaults: { ease }, delay: 0.15 });
      tl.from(".home-hero .eyebrow", { y: 14, autoAlpha: 0, duration: 0.8 })
        .from(split.lines, { yPercent: 115, duration: 1.3, stagger: 0.12 }, "-=0.55")
        .from(".hero-lead", { y: 22, autoAlpha: 0, duration: 1 }, "-=0.9")
        .from(".hero-actions > *", { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.09 }, "-=0.8")
        .from(".hero-tags li", { y: 10, autoAlpha: 0, duration: 0.7, stagger: 0.07 }, "-=0.7")
        .from(".console-window", { y: 40, autoAlpha: 0, scale: 0.97, duration: 1.4 }, 0.35)
        .from(".console-body > *", { x: -10, autoAlpha: 0, duration: 0.6, stagger: 0.06 }, "-=0.9")
        .from(".mascot-strip", { y: 20, autoAlpha: 0, duration: 1 }, "-=0.8");
    }

    /* SECTION HEADINGS: masked line reveal on scroll */
    $$(".section-heading h2, .lab-note-copy h2, .closing-cta h2").forEach((h) => {
      const s = splitLines(h);
      gsap.set(h, { visibility: "visible" });
      const parent = h.parentElement;
      const tl = gsap.timeline({
        defaults: { ease },
        scrollTrigger: { trigger: h, start: "top 85%", once: true },
      });
      const eb = $(".eyebrow", parent);
      if (eb) tl.from(eb, { y: 12, autoAlpha: 0, duration: 0.7 });
      tl.from(s.lines, { yPercent: 115, duration: 1.1, stagger: 0.1 }, eb ? "-=0.45" : 0);
    });
    $$(".section-intro, .lab-note-copy > p:not(.eyebrow), .lab-note-copy .text-link").forEach((el) =>
      gsap.from(el, {
        y: 20, autoAlpha: 0, duration: 1, ease,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      })
    );

    /* FOCUS CARDS: staggered batch, with a little rotation so they don't feel stamped out */
    gsap.set(".focus-card", { transformPerspective: 900 });
    ScrollTrigger.batch(".focus-card", {
      start: "top 88%", once: true,
      onEnter: (els) =>
        gsap.from(els, { y: 60, rotationX: -8, autoAlpha: 0, duration: 1.1, stagger: 0.12, ease }),
    });

    /* PRINCIPLES: rows slide in, the "+" marks spin in after */
    $$(".principle-row").forEach((row, i) => {
      gsap.from(row, {
        x: 36, autoAlpha: 0, duration: 1, ease, delay: i * 0.04,
        scrollTrigger: { trigger: row, start: "top 90%", once: true },
      });
      const mark = $(".principle-mark", row);
      if (mark) gsap.from(mark, {
        rotation: -180, scale: 0, duration: 0.9, ease: "back.out(2)", delay: 0.3,
        scrollTrigger: { trigger: row, start: "top 90%", once: true },
      });
    });

    /* CLOSING CTA: buttons pop in as a group */
    const cta = $(".closing-actions");
    if (cta) gsap.from(cta.children, {
      y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease,
      scrollTrigger: { trigger: cta, start: "top 88%", once: true },
    });

    /* Subtle parallax: the starfield drifts slower than the page */
    gsap.to(".site-starfield", {
      yPercent: -8, ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.6 },
    });

    ScrollTrigger.refresh();
  };

  /* ---------- Pointer effects (mouse only) ---------- */
  if (fine) {
    // Card spotlight
    $$(".focus-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
    // Magnetic buttons
    $$(".button, .github-star-button").forEach((btn) => {
      const x = gsap.quickTo(btn, "x", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
      const y = gsap.quickTo(btn, "y", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * 0.22);
        y((e.clientY - (r.top + r.height / 2)) * 0.32);
      });
      btn.addEventListener("pointerleave", () => { x(0); y(0); });
    });
  }

  /* ---------- Extras: progress bar, scramble, tilt, page transitions, legal pages ---------- */
  const bar = document.createElement("div");
  bar.className = "scroll-progress"; bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  // Terminal-style text scramble (mono labels only, so layout never jumps)
  const GLYPHS = "01<>/{}[]_#$%";
  const scramble = (el, dur = 0.9) => {
    const final = el.dataset.text || (el.dataset.text = el.textContent);
    const o = { p: 0 };
    gsap.to(o, { p: 1, duration: dur, ease: "none", overwrite: true, onUpdate() {
      const n = Math.floor(o.p * final.length);
      el.textContent = final.slice(0, n) + [...final.slice(n)].map((c) => (c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
    }, onComplete() { el.textContent = final; } });
  };
  $$(".focus-index, .hero-tags li").forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => scramble(el, 0.8) });
  });
  if (fine) $$(".focus-card").forEach((card) => {
    const idx = $(".focus-index", card);
    if (idx) card.addEventListener("pointerenter", () => scramble(idx, 0.5));
    // 3D tilt toward the cursor
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 7);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
    });
    card.addEventListener("pointerleave", () => { rx(0); ry(0); });
  });

  // Legal pages: sections fade up, table of contents tracks your position
  $$(".legal-section").forEach((sec) => {
    gsap.from(sec.children, { y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: "expo.out",
      scrollTrigger: { trigger: sec, start: "top 88%", once: true } });
    const link = $(`.legal-toc a[href="#${sec.id}"]`);
    if (link) ScrollTrigger.create({ trigger: sec, start: "top 40%", end: "bottom 40%",
      onToggle: (st) => { if (st.isActive) { $$(".legal-toc a").forEach((a) => a.classList.remove("is-current")); link.classList.add("is-current"); } } });
  });
  $$(".legal-hero > *").length && gsap.from(".legal-hero > *", { y: 28, autoAlpha: 0, duration: 1.1, stagger: 0.1, ease: "expo.out", delay: 0.1 });

  // Smooth page transitions between internal pages
  const curtain = document.createElement("div");
  curtain.className = "page-curtain"; curtain.setAttribute("aria-hidden", "true");
  document.body.appendChild(curtain);
  gsap.fromTo(curtain, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.6, ease: "power2.out" });
  window.addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(curtain, { autoAlpha: 0 }); });
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target || a.hasAttribute("download") || a.origin !== location.origin) return;
    if (a.pathname === location.pathname) return; // same-page anchors are handled by Lenis
    e.preventDefault();
    gsap.to(curtain, { autoAlpha: 1, duration: 0.4, ease: "power2.in", onComplete: () => { location.href = a.href; } });
  });

  // Wait for fonts so line splitting measures the real text
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(run);

  // Re-split on resize so lines stay correct (debounced)
  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 250); });
})();
