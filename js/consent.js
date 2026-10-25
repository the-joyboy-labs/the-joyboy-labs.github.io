/* Privacy choices. The site sets no cookies; this gates the one optional third-party request
   (GitHub star count) and remembers the choice in localStorage for up to 12 months. */
(() => {
  const KEY = "joyboy-consent", MAX_AGE = 365 * 864e5;
  const read = () => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || "null");
      return v && Date.now() - v.t < MAX_AGE ? v.v : null;
    } catch { return null; }
  };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify({ v, t: Date.now() })); } catch {} };
  const grant = () => document.dispatchEvent(new CustomEvent("joyboy:consent-granted"));

  let banner, lastFocus;
  const close = () => {
    if (!banner) return;
    banner.classList.remove("is-visible");
    banner.setAttribute("aria-hidden", "true");
    const b = banner; banner = null;
    setTimeout(() => b.remove(), 450);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  };
  const choose = (v) => { write(v); if (v === "granted") grant(); close(); };

  const open = () => {
    if (banner) return;
    lastFocus = document.activeElement;
    banner = document.createElement("div");
    banner.className = "consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-labelledby", "consent-title");
    banner.setAttribute("aria-describedby", "consent-desc");
    banner.innerHTML = `
      <p class="consent-eyebrow"><span class="status-dot"></span> PRIVACY CHOICES</p>
      <h2 id="consent-title">No tracking. One optional request.</h2>
      <p id="consent-desc">This site sets <strong>no cookies</strong> and has no analytics or ads. The homepage can load a live GitHub star count, which lets GitHub see your IP address. Allow it?
        <a href="cookies.html">Cookie policy</a> · <a href="privacy.html">Privacy</a></p>
      <div class="consent-actions">
        <button type="button" class="consent-btn" data-choice="denied">Decline</button>
        <button type="button" class="consent-btn" data-choice="granted">Accept</button>
      </div>`;
    banner.addEventListener("click", (e) => {
      const b = e.target.closest("[data-choice]");
      if (b) choose(b.dataset.choice);
    });
    banner.addEventListener("keydown", (e) => { if (e.key === "Escape") choose("denied"); });
    document.body.appendChild(banner);
    requestAnimationFrame(() => requestAnimationFrame(() => banner && banner.classList.add("is-visible")));
    banner.querySelector('[data-choice="denied"]').focus({ preventScroll: true });
  };

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-consent]")) open();
  });

  // Footer "Cookie settings" button on pages using the standard footer
  const fl = document.querySelector(".footer-links");
  if (fl && !fl.querySelector("[data-open-consent]")) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "footer-consent-link"; b.dataset.openConsent = "";
    b.textContent = "Cookie settings";
    fl.appendChild(b);
  }

  const saved = read();
  if (saved === "granted") grant();
  else if (saved === null) setTimeout(open, 900);
})();
