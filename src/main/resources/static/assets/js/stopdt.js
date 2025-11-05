// stopdt_template.js
(function () {
  // --- Detect if DevTools is open ---
  function isDevToolsOpen() {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    return widthDiff || heightDiff;
  }

  // --- Close or redirect tab if DevTools detected ---
  function handleDevToolsDetected() {
    // Try to close the current tab
    window.open('', '_self');
    window.close();

    // If closing is blocked, redirect as fallback
    setTimeout(() => {
window.location.href = "/Evolve_Ev/error.html";
    }, 200);

    // Last fallback (if browser blocks both)
    setTimeout(() => {
window.location.href = "/Evolve_Ev/error.html";
    }, 400);
  }

  // --- Disable right-click and shortcuts ---
  function DisableDevtool() {
    document.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("keydown", e => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    });

    // Start checking if DevTools is opened
    setInterval(() => {
      if (isDevToolsOpen()) {
        handleDevToolsDetected();
      }
    }, 1000);
  }

  // --- Allow DevTools only if backend returns true ---
  fetch("/Evolve_Ev/check_dev")
    .then(res => res.text())
    .then(txt => {
      if (txt.includes("true")) {
        console.log("✅ Dev mode active — inspect tools allowed.");
      } else {
        DisableDevtool();
      }
    })
    .catch(() => {
      // if backend unreachable, disable as precaution
      DisableDevtool();
    });
})();
