function safeLoadScript(url, onSuccess) {
  $.getScript(url)
    .done(onSuccess || function () {})
    .fail(function (jqxhr, settings, exception) {
      console.error(`❌ Failed to load script: ${url}`, exception);
    });
}

function highlightActiveNav(page) {
  $(".nav-link").removeClass("active");
  $(`.nav-link[href="#${page}"]`).addClass("active");
}
function loadPage(page) {
  // Fade out current content before loading new one
  $("#main-content").fadeOut(300, function () {
    // Load new page content
    $("#main-content").load(`pages/${page}.html`, function (response, status) {
      if (status === "error") {
        $("#main-content").html("<p>Error loading page.</p>");
        return;
      }

      // Highlight current nav
      highlightActiveNav(page);

      // Smooth scroll to top before showing new content
      $("html, body").animate({ scrollTop: 0 }, 500);

      // Fade new content in smoothly
      $("#main-content").fadeIn(400);

      // Load page-specific scripts
      if (page === "home" || page === "prebooking" || $("#voucher-form").length) {
        safeLoadScript("js/prebooking.js");
      }

      if (page === "evmodels" || $("#ev-model-list").length) {
        safeLoadScript("js/evmodels.js", function () {
          if (typeof loadEvModelsPage === "function") {
            loadEvModelsPage();
          }
        });
      }
// if (page === "brochure") {
//   safeLoadScript("js/brochure.js");
// }

      if (page === "admin" || $("#admin-section").length) {
        safeLoadScript("js/admin.js");
      }
    });
  });
}


window.onhashchange = () => {
  const page = location.hash.replace("#", "") || "home";
  loadPage(page);
};

$(document).ready(() => {
  const page = location.hash.replace("#", "") || "home";
  loadPage(page);
});
