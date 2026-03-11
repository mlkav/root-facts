// src/scripts/index.js
import "../styles/styles.css";
import App from "./pages/app.js";

// document.addEventListener("DOMContentLoaded", async () => {
//   const app = new App({
//     container: document.querySelector("#main-content"),
//   });

//   await app.renderPage();

//   if (typeof lucide !== "undefined") {
//     lucide.createIcons();
//   }

//   // Registrasi Service Worker
//   if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//       navigator.serviceWorker.register('/sw.bundle.js')
//         .then(reg => console.log('SW registered:', reg))
//         .catch(err => console.error('SW registration failed:', err));
//     });
//   }

// });


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.bundle.js')
      .then((registration) => {
        console.log('Service Worker registered: ', registration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed: ', error);
      });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('#main-content');
  if (!container) {
    console.error('Elemen #main-content tidak ditemukan!');
    return;
  }
  const app = new App({
    container: container,
  });

  await app.renderPage();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

});




// import "../styles/styles.css";
// import App from "./pages/app.js";

// document.addEventListener("DOMContentLoaded", async () => {
//   const container = document.querySelector("#main-content");

//   if (!container) {
//     console.error("Elemen #main-content tidak ditemukan!");
//     return;
//   }

//   // render icon lucide
//   if (typeof lucide !== "undefined") {
//     lucide.createIcons();
//   }

//   const app = new App({ container });
//   await app.renderPage();

// });

// // registrasi service worker
// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("/sw.bundle.js")
//     .then((reg) => console.log("Service Worker registered:", reg))
//     .catch((err) => console.error("Service Worker registration failed:", err));
// }