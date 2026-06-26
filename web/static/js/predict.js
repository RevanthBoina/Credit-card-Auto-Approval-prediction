/**
 * predict.js – Client-side validation for the prediction form.
 *
 * Only loaded on the predict page via {% block extra_js %} in predict.html.
 * Server-side validation in app.py remains the authoritative check.
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".predict__form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    let valid = true;

    // Remove any previous inline errors added by this script
    form.querySelectorAll(".js-error").forEach((el) => el.remove());

    const amount = form.querySelector("#amount");
    if (!amount.value || parseFloat(amount.value) < 0) {
      showError(amount, "Please enter a valid non-negative amount.");
      valid = false;
    }

    const time = form.querySelector("#time");
    if (!time.value || parseInt(time.value, 10) < 0) {
      showError(time, "Please enter a valid non-negative time value.");
      valid = false;
    }

    if (!valid) e.preventDefault();
  });

  function showError(input, message) {
    const span = document.createElement("span");
    span.className = "form-error js-error";
    span.textContent = message;
    input.insertAdjacentElement("afterend", span);
    input.focus();
  }
});
