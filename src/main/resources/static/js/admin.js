
// ==============================
// 👁️ Toggle Password Visibility
// ==============================
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eye-icon');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.classList.remove('fa-eye');
    eyeIcon.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    eyeIcon.classList.remove('fa-eye-slash');
    eyeIcon.classList.add('fa-eye');
  }
}

// ==============================
// 🔐 Admin Login Session Handling
// ==============================
$(document).ready(function () {
  if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
    showAdminPanel();
    loadPrebookings();
  } else {
    $("#login-section").removeClass("d-none");
  }

  // 🧭 Manage EV Models → redirect
  $("#manage-evmodels-btn").click(function () {
    window.location.href = 'admin_evmodels.html';
  });
});

function showAdminPanel() {
  $("#login-section").addClass("d-none");
  $("#admin-data").removeClass("d-none");
  $("#bulk-voucher-section").removeClass("d-none");
  $("#unused-voucher-section").removeClass("d-none");
}

function hideAdminPanel() {
  $("#admin-data").addClass("d-none");
  $("#login-section").removeClass("d-none");
  $("#bulk-voucher-section").addClass("d-none");
  $("#unused-voucher-section").addClass("d-none");
}

// ==============================
// 🔑 Login
// ==============================
$("#admin-login-form").on("submit", function (e) {
  e.preventDefault();

  const username = $("#username").val().trim();
  const password = $("#password").val().trim();

  if (!username || !password) {
    alert("⚠️ Please enter both username and password.");
    return;
  }

  $.ajax({
    url: `${BASE_URL}/login`,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ username, password }),
    success: function () {
      alert("✅ Login successful!");
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      showAdminPanel();
      loadPrebookings();
    },
    error: function (err) {
      alert("❌ Login failed: " + (err.responseText || "Invalid credentials"));
    }
  });
});

// ==============================
// 🚪 Logout
// ==============================
$("#logout-btn").click(function () {
  if (confirm("Logout and return to login?")) {
    sessionStorage.removeItem("isAdminLoggedIn");
    $.post(`${BASE_URL}/logout`, function () {
      location.reload();
    });
  }
});

// ==============================
// 📄 Load Prebookings
// ==============================
function loadPrebookings() {
  $.get(`${BASE_URL}/all_prebookings`, function (data) {
    const tbody = $("#admin-table-body");
    tbody.empty();

    data.forEach(pb => {
      tbody.append(`
        <tr>
          <td>${pb.id}</td>
          <td>${pb.name}</td>
          <td>${pb.address}</td>
          <td>${pb.contact}</td>
          <td>${pb.receipt_no}</td>
          <td>${pb.coupon_no}</td>
          <td>${pb.booked_on || "N/A"}</td>
        </tr>
      `);
    });

    if ($.fn.DataTable.isDataTable("#adminTable")) {
      $('#adminTable').DataTable().destroy();
    }

    $('#adminTable').DataTable({
      responsive: true,
      pageLength: 5,
      lengthChange: false,
      searching: true,
      ordering: true,
      dom: 'Bfrtip',
      buttons: [
        { extend: 'copyHtml5', className: 'btn btn-secondary' },
        { extend: 'excelHtml5', className: 'btn btn-success' },
        { extend: 'csvHtml5', className: 'btn btn-info' },
        { extend: 'pdfHtml5', className: 'btn btn-danger' },
        { extend: 'print', className: 'btn btn-primary' }
      ]
    });
  });
}

// ==============================
// 🔢 Voucher Range Calculator
// ==============================
function calculateEnd(startValue, range) {
  if (!startValue || !range) return "";
  const prefix = startValue.match(/^\D+/)[0];
  const number = parseInt(startValue.replace(/\D/g, ""));
  const endNumber = number + parseInt(range);
  const length = startValue.replace(/\D/g, "").length;
  return prefix + String(endNumber).padStart(length, "0");
}

$("#rangeCount, #receiptStart, #couponStart").on("input", function () {
  const range = $("#rangeCount").val();
  const receiptStart = $("#receiptStart").val().trim();
  if (receiptStart && range) {
    $("#receiptEnd").val(calculateEnd(receiptStart, range));
  }
  const couponStart = $("#couponStart").val().trim();
  if (couponStart && range) {
    $("#couponEnd").val(calculateEnd(couponStart, range));
  }
});

// ==============================
// 🎫 Voucher Generation
// ==============================
// Ensure only one binding even if the page is reloaded dynamically
// ==============================
// 🎫 Voucher Generation
// ==============================
// Ensure only one binding even if the page is reloaded dynamically
$(document).off("submit", "#voucherForm").on("submit", "#voucherForm", function (e) {
  e.preventDefault();

  const receiptStart = $("#receiptStart").val().trim();
  const receiptEnd = $("#receiptEnd").val().trim();
  const couponStart = $("#couponStart").val().trim();
  const couponEnd = $("#couponEnd").val().trim();

  if (!receiptStart || !receiptEnd || !couponStart || !couponEnd) {
    alert("⚠️ Please fill in all fields before generating vouchers.");
    return;
  }

  // Disable submit button to prevent double click
  const $submitBtn = $("#voucherForm button[type='submit']");
  $submitBtn.prop("disabled", true).text("Generating...");

  $.ajax({
    url: `${BASE_URL}/vouchers_generate`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      receiptStart,
      receiptEnd,
      couponStart,
      couponEnd
    }),
    success: function (response) {
      if (response && response.message) {
        alert("✅ " + response.message);
      } else {
        alert("✅ Vouchers generated successfully!");
      }

      // 🌀 Auto reload after 1.5 seconds (for updated voucher list)
      setTimeout(() => {
        location.reload();
      }, 1500);
    },
    error: function (xhr) {
      // Custom friendly message for duplicates
      if (
        xhr.responseText &&
        xhr.responseText.includes("duplicate key value violates unique constraint")
      ) {
        alert("⚠️ Some vouchers were already generated earlier. Skipped duplicates.");
      } else {
        alert("❌ generating vouchers: " + (xhr.responseText || "Please try again."));
      }
    },
    complete: function () {
      // Re-enable button after request completes
      $submitBtn.prop("disabled", false).text("Generate");
    }
  });
});



// ==============================
// 🧾 Load Unused Vouchers
// ==============================
$("#load-unused-btn").on("click", function () {
  $.get(`${BASE_URL}/unused_vouchers`, function (data) {
    const tbody = $("#unusedVoucherBody");
    tbody.empty();

    data.forEach(v => {
      tbody.append(`
        <tr>
          <td><input type="checkbox" class="voucher-check" value="${v.receiptNo}"></td>
          <td>${v.receiptNo}</td>
          <td>${v.couponNo}</td>
          <td>${v.dateAssigned || "-"}</td>
        </tr>
      `);
    });

    $("#deleteVoucherForm").removeClass("d-none");

    if ($.fn.DataTable.isDataTable("#unusedVoucherTable")) {
      $('#unusedVoucherTable').DataTable().destroy();
    }

    $('#unusedVoucherTable').DataTable({
      responsive: true,
      pageLength: 10,
      lengthChange: false,
      searching: true
    });
  });
});

// ==============================
// 🗑️ Delete Selected Vouchers
// ==============================
$("#deleteVoucherForm").on("submit", function (e) {
  e.preventDefault();

  const selected = [];
  $(".voucher-check:checked").each(function () {
    selected.push($(this).val());
  });

  if (selected.length === 0) {
    alert("⚠️ Please select at least one voucher to delete.");
    return;
  }

  $.ajax({
    url: `${BASE_URL}/delete_vouchers`,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(selected),
    success: function (msg) {
      alert(msg);
      location.reload();
    },
    error: function (xhr) {
      alert("Error: " + xhr.responseText);
    }
  });
});

// ==============================
// ☑️ Select-All (Max 10 Limit)
// ==============================
$(document).on("change", "#select-all", function () {
  const isChecked = $(this).prop("checked");
  const checkboxes = $(".voucher-check");

  if (isChecked) {
    checkboxes.slice(0, 10).prop("checked", true);
    checkboxes.slice(10).prop("checked", false);
  } else {
    checkboxes.prop("checked", false);
  }
});

// ✅ Individual checkbox limit
$(document).on("change", ".voucher-check", function () {
  const checked = $(".voucher-check:checked").length;

  if (checked > 10) {
    alert("⚠️ You can only select up to 10 vouchers at a time.");
    $(this).prop("checked", false);
    return;
  }

  const total = $(".voucher-check").length;
  $("#select-all").prop("checked", checked === total || checked === 10);
});
