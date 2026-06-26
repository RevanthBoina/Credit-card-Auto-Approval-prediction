/**
 * main.js – Shared JavaScript loaded on every page via base.html.
 *
 * Kept minimal; no framework is used.
 * Flask handles all routing and data – JS is only for UX enhancement.
 */

// Auto-dismiss flash messages after 4 seconds
document.addEventListener("DOMContentLoaded", () => {
  const flashes = document.querySelectorAll(".flash");
  flashes.forEach((el) => {
    setTimeout(() => {
      el.style.transition = "opacity 0.4s";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 400);
    }, 4000);
  });
});
