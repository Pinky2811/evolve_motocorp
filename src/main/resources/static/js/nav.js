$(document).ready(function () {
    // Toggle side drawer
    $('#hamburger').on('click', function () {
      $('#side-drawer').toggleClass('active');
      $('#nav-overlay').toggleClass('active');
    });

    // Hide drawer when overlay is clicked
    $('#nav-overlay').on('click', function () {
      $('#side-drawer').removeClass('active');
      $('#nav-overlay').removeClass('active');
    });

    // Hide drawer when any mobile nav link is clicked
    $('#side-drawer a').on('click', function () {
      $('#side-drawer').removeClass('active');
      $('#nav-overlay').removeClass('active');
    });
  });