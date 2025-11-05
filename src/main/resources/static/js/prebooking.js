$(document).ready(function () {
  // Fetch voucher from backend
$.get(`${BASE_URL}/vouchers`, function (voucher) {
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
    $('#voucher-form').html(`<p class="text-danger text-center">⚠ vouchers available After Some Time.</p>`);
  });

  // Razorpay Payment Button
  $(document).on("click", "#payBtn", function () {
    const form = document.getElementById("prebook-form");
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    // Disable button to prevent double click
    $("#payBtn").prop("disabled", true).text("Processing...");

    // Call backend to create Razorpay order
$.post(`${BASE_URL}/create_order`, { amount: 360 }, function (order) {
      let orderData = (typeof order === "string") ? JSON.parse(order) : order;

      var options = {
        "key": "rzp_live_RbzgMYaL9gfRdw", // ✅ Your LIVE key
        "amount": orderData.amount,
        "currency": "INR",
        "name": "EVOLVE MOTOCORP",
        "description": "EV Pre-Booking Voucher",
        "order_id": orderData.id,
        "handler": function (response) {
          // console.log("✅ Payment Success:", response);

          const formData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            name: form.name.value.trim(),
            address: form.address.value.trim(),
            mobile: form.contact.value.trim(),
            receiptNo: form.receiptNo.value,
            couponNo: form.couponNo.value
          };

$.post(`${BASE_URL}/confirm`, formData, function (response) {
            if (res.status === "success") {
              new bootstrap.Toast(document.getElementById('successToast')).show();
              setTimeout(() => location.reload(), 3000);
            } else {
              alert("⚠ Payment verification failed!");
              $("#payBtn").prop("disabled", false).text("Pay ₹360 & Pre-Book");
            }
          }).fail(() => {
            alert("⚠ Server error during confirmation.");
            $("#payBtn").prop("disabled", false).text("Pay ₹360 & Pre-Book");
          });
        },
        "theme": { "color": "#3399cc" }
      };

      const rzp1 = new Razorpay(options);
      rzp1.on('payment.failed', function () {
        $("#payBtn").prop("disabled", false).text("Pay ₹360 & Pre-Book");
      });
      rzp1.open();
    }).fail(function () {
      alert("Something Went Wrong. Please try again.");
      $("#payBtn").prop("disabled", false).text("Pay ₹360 & Pre-Book");
    });
  });
});
