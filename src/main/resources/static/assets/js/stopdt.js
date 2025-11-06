(function () {
  // --- Detect if DevTools is open ---
  function isDevToolsOpen() {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    return widthDiff || heightDiff;
  }

  // --- Redirect or close tab if DevTools detected ---
  function handleDevToolsDetected() {
    // Try to close the tab
    window.open("", "_self");
    window.close();

    // If blocked, redirect as fallback
    setTimeout(() => {
      window.location.href = "/Evolve_Ev/error.html";
    }, 200);
  }

  // --- Disable right-click and keyboard shortcuts ---
  function DisableDevtool() {
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    });

    // Continuously check if DevTools are open
    setInterval(() => {
      if (isDevToolsOpen()) handleDevToolsDetected();
    }, 1000);
  }

  // --- Check from backend if DevTools are allowed ---
  fetch(`${BASE_URL}/check_dev`, {
    credentials: "include" // keep same session for /enable_dev
  })
    .then((res) => res.text())
    .then((txt) => {
      if (txt.includes("true")) {
        console.log("✅ Developer mode active — DevTools allowed.");
      } else {
        DisableDevtool();
      }
    })
    .catch(() => {
      DisableDevtool();
    });
})();
