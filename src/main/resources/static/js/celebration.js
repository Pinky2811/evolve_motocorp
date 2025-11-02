$(document).ready(function () {
  // Auto-fill today's date
  $("#date").val(new Date().toLocaleDateString('en-IN'));

  // Fetch dynamic voucher from backend
  $.get("/api/voucher/next", function (data) {
    $("#receiptNo").val(data.receiptNo);
    $("#distributorCode").val(data.distributorCode);
    $("#couponNo").val(data.couponNo);
  });

  // Handle form submission
  $("#prebookingForm").on("submit", function (e) {
    e.preventDefault();

    const formData = {
      receiptNo: $("#receiptNo").val(),
      distributorCode: $("#distributorCode").val(),
      couponNo: $("#couponNo").val(),
      customerName: $("#customerName").val(),
      address: $("#address").val(),
      contactNo: $("#contactNo").val(),
    };

    // Hit backend API to save + initiate payment
    $.post("/api/voucher/book", formData, function (res) {
      alert("🎉 Successfully booked your voucher! You'll receive a confirmation shortly on WhatsApp.");
      window.location.href = "/";
    }).fail(function () {
      alert("Error: Please try again later.");
    });
  });
});
