$(document).ready(function () {
  // Load header
  $("#header").load("pages/header.html", function () {
    const $hamburger = $("#hamburger");
    const $sideDrawer = $("#side-drawer");
    const $overlay = $("#nav-overlay");

    function closeMenu() {
      $sideDrawer.removeClass("active");
      $overlay.removeClass("active");
    }

    $hamburger.on("click", function () {
      $sideDrawer.toggleClass("active");
      $overlay.toggleClass("active");
    });

    $(document).on("click", "#side-drawer a", function () {
      if (window.innerWidth <= 768) closeMenu();
    });

    $(document).on("click", "#nav-overlay", function () {
      closeMenu();
    });
  });

  // Load footer + feedback logic
  $("#footer").load("pages/footer.html", function () {
    // Open modal
    $("#feedback-btn").on("click", function () {
      $("#feedback-modal").fadeIn();
    });

    // Close modal (X button or outside click)
    $(document).on("click", ".close-btn, #feedback-modal", function (e) {
      if ($(e.target).is("#feedback-modal") || $(e.target).is(".close-btn")) {
        $("#feedback-modal").fadeOut();
      }
    });

    // Handle form submission
    $("#feedbackForm").on("submit", function (e) {
      e.preventDefault();

      let name = $("#name").val().trim();
      let mobile = $("#mobile").val().trim();
      let email = $("#email").val().trim();
      let message = $("#message").val().trim();

      // Validate mobile
      if (!/^[0-9]{10}$/.test(mobile)) {
        $("#feedback-status").text("❌ Enter a valid 10-digit mobile number.");
        return;
      }

      // Collect data
      let formData = { name, mobile, email, message };
      console.log("Feedback submitted:", formData);

      // TODO: send to backend/email API here
      $("#feedback-status").text("✅ Thank you for your feedback!");

      setTimeout(() => {
        $("#feedback-modal").fadeOut();
        $("#feedbackForm")[0].reset();
        $("#feedback-status").text("");
      }, 2000);
    });
  });

  // Sticky header on scroll
  let lastScrollTop = 0;
  const delta = 5;
  const $header = $("header");
  const headerHeight = $header.length ? $header.outerHeight() : 0;

  $(window).on("scroll", function () {
    const st = $(this).scrollTop();
    if (Math.abs(lastScrollTop - st) <= delta) return;

    if (st > lastScrollTop && st > headerHeight) {
      $header.addClass("hide-header");
    } else {
      $header.removeClass("hide-header");
    }
    lastScrollTop = st;
  });
});
