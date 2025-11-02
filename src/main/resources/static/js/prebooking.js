$(document).ready(function () {
  // Fetch voucher from backend
  $.get("vouchers", function (voucher) {
    if (voucher) {
      $('#voucher-form').html(`
        <div class="col-md-6">
          <div class="card shadow-lg p-4 rounded-4">
            <form id="prebook-form" novalidate>
              <div class="mb-3">
                <label class="form-label">Receipt No</label>
<input type="text" class="form-control" name="receiptNo" value="${voucher.receiptNo || ''}" readonly>
              </div>
              <div class="mb-3">
                <label class="form-label">Coupon No</label>
<input type="text" class="form-control" name="couponNo" value="${voucher.couponNo || ''}" readonly>
              </div>
              <div class="mb-3">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-control" name="name" required>
                <div class="invalid-feedback">Please enter your name.</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Address</label>
                <input type="text" class="form-control" name="address" required>
                <div class="invalid-feedback">Please enter your address.</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Contact</label>
                <input type="text" class="form-control" name="contact" pattern="^[0-9]{10}$" required>
                <div class="invalid-feedback">Enter a valid 10-digit contact number.</div>
              </div>
              <div class="d-grid">
                <button type="button" id="payBtn" class="btn btn-primary">Pay ₹360 & Pre-Book</button>
              </div>
            </form>
          </div>
        </div>
      `);
    } else {
      $('#voucher-form').html(`<p class="text-danger text-center">No vouchers available right now.</p>`);
    }
  }).fail(function () {
    $('#voucher-form').html(`<p class="text-danger text-center">⚠ Error loading voucher. Please try again later.</p>`);
  });

  // Razorpay Payment Button
  $(document).on("click", "#payBtn", function () {
    const form = document.getElementById("prebook-form");
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    // Call backend to create Razorpay order
    $.post("create_order", { amount: 360 }, function (order) {
      let orderData = (typeof order === "string") ? JSON.parse(order) : order;

      var options = {
        "key": "rzp_test_XXXXX", // ✅ Replace with your Razorpay Key ID
        "amount": orderData.amount,
        "currency": "INR",
        "name": "EVOLVE MOTOCORP",
        "description": "EV Pre-Booking Voucher",
        "order_id": orderData.id,
        "handler": function (response) {
          // Payment success → submit form to save booking
          console.log("Payment Success:", response);
          $("#prebook-form").trigger("submit");
        },
        "theme": { "color": "#3399cc" }
      };
      var rzp1 = new Razorpay(options);
      rzp1.open();
    });
  });

  // Form submit handler (after successful payment)
  $(document).on("submit", "#prebook-form", function (e) {
    e.preventDefault();
    const form = this;

    const bookingData = {
  name: form.name.value.trim(),
  address: form.address.value.trim(),
  contact: form.contact.value.trim(),
  voucher: {
    receiptNo: form.receiptNo.value,
    couponNo: form.couponNo.value
  }
};


    $.ajax({
      url: "prebooking",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(bookingData),
      success: function () {
        form.reset();
        form.classList.remove('was-validated');
        new bootstrap.Toast(document.getElementById('successToast')).show();
        setTimeout(() => location.reload(), 3000);
      },
      error: function () {
        alert("⚠ This voucher is already booked or invalid.");
      }
    });
  });
});
