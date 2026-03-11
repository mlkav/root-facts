// src/scripts/index.js
// /* global lucide */
import "../styles/styles.css";
import App from "./pages/app.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.bundle.js")
      .then((registration) => {
        console.log("Service Worker registered: ", registration);
      })
      .catch((error) => {
        console.error("Service Worker registration failed: ", error);
      });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector("#main-content");
  if (!container) {
    console.error("Elemen #main-content tidak ditemukan!");
    return;
  }
  const app = new App({
    container,
  });

  await app.renderPage();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});
