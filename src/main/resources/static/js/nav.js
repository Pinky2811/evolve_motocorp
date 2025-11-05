$(document).ready(function () {
  $("#header").load("pages/header.html", function () {

    // ✅ Now elements exist, so binding works
    $('#hamburger').on('click', function () {
      $('#side-drawer').toggleClass('active');
      $('#nav-overlay').toggleClass('active');
    });

    $('#nav-overlay').on('click', function () {
      $('#side-drawer').removeClass('active');
      $('#nav-overlay').removeClass('active');
    });

    $('#side-drawer a').on('click', function () {
      $('#side-drawer').removeClass('active');
      $('#nav-overlay').removeClass('active');
    });

  });
});
