(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-navigation");

  if (menuButton && navigation) {
    const closeMenu = (returnFocus = false) => {
      navigation.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation menu");
      if (returnFocus) menuButton.focus();
    };

    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
        return;
      }
      navigation.classList.add("is-open");
      menuButton.setAttribute("aria-expanded", "true");
      menuButton.setAttribute("aria-label", "Close navigation menu");
    });

    navigation.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("click", (event) => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      const clickedInside = navigation.contains(event.target) || menuButton.contains(event.target);
      if (isOpen && !clickedInside) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        closeMenu(true);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960) closeMenu();
    });
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Continue to the compatibility fallback below.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    textarea.remove();
    return copied;
  }

  document.addEventListener("click", async (event) => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest(".copy-button");
    if (!button) return;

    const code = button.closest(".code-card")?.querySelector("pre code");
    const label = button.querySelector(".copy-label");
    if (!code || !label || button.disabled) return;

    const originalLabel = button.dataset.defaultLabel || label.textContent.trim();
    const originalAriaLabel = button.dataset.defaultAriaLabel || button.getAttribute("aria-label") || originalLabel;
    button.dataset.defaultLabel = originalLabel;
    button.dataset.defaultAriaLabel = originalAriaLabel;
    const codeText = code.textContent.replace(/\n$/, "");
    button.disabled = true;
    button.classList.remove("is-copied", "is-error");

    try {
      const copied = await copyText(codeText);
      if (!copied) throw new Error("Clipboard copy failed");

      label.textContent = "Copied!";
      button.setAttribute("aria-label", "Code copied to clipboard");
      button.classList.add("is-copied");
    } catch {
      label.textContent = "Try again";
      button.setAttribute("aria-label", "Copy failed. Try again");
      button.classList.add("is-error");
    } finally {
      button.disabled = false;
      window.clearTimeout(button.feedbackTimer);
      button.feedbackTimer = window.setTimeout(() => {
        label.textContent = originalLabel;
        button.setAttribute("aria-label", originalAriaLabel);
        button.classList.remove("is-copied", "is-error");
      }, 1800);
    }
  });

  const starCount = document.querySelector("[data-github-stars]");
  if (starCount) {
    fetch("https://api.github.com/repos/ujjal-saha/Flappy_Friend-v0001", {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("GitHub star count unavailable");
        return response.json();
      })
      .then((repository) => {
        if (Number.isInteger(repository.stargazers_count)) {
          starCount.textContent = new Intl.NumberFormat().format(repository.stargazers_count);
        }
      })
      .catch(() => {
        // Keep the built-in zero as a graceful offline fallback.
      });
  }

  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = year;
  });
})();
