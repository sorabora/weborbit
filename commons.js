const storedTheme =
  localStorage.getItem("theme") ??
  (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.documentElement.setAttribute("data-bs-theme", storedTheme);

// loaded here so no page has to add the tag itself
const fontAwesome = document.createElement("link");
fontAwesome.rel = "stylesheet";
fontAwesome.href = "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css";
document.head.appendChild(fontAwesome);

// patches the invite on every page so it only has to change here
const discordInvite = "https://discord.gg/zv34r6aR3";

document.addEventListener("DOMContentLoaded", () => {
  for (const a of document.querySelectorAll('a[href*="discord.gg"]')) {
    a.href = discordInvite;
  }

  const navbar =
    document.querySelector(".navbar .collapse") ??
    document.querySelector(".navbar .container") ??
    document.querySelector(".navbar");
  if (!navbar) return;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "btn btn-sm btn-outline-secondary ms-lg-3";
  toggle.title = "Toggle dark mode";

  const setLabel = () => {
    const dark = document.documentElement.getAttribute("data-bs-theme") === "dark";
    toggle.textContent = dark ? "☀️" : "🌙";
  };
  setLabel();

  toggle.addEventListener("click", () => {
    const next =
      document.documentElement.getAttribute("data-bs-theme") === "dark"
        ? "light"
        : "dark";
    document.documentElement.setAttribute("data-bs-theme", next);
    localStorage.setItem("theme", next);
    setLabel();
  });

  navbar.appendChild(toggle);
});
