// js/config.js
if (typeof BASE_URL === "undefined") {
  var BASE_URL = "";

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    BASE_URL = "http://localhost:8080/Evolve_Ev";
  } else {
    BASE_URL = "https://evolve-motocorp-1.onrender.com";
  }

  // console.log("✅ BASE_URL set to:", BASE_URL);
}
