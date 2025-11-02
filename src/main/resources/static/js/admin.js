
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

// ✅ Check admin session on load
$(document).ready(function () {
  if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
    showAdminPanel();
    loadPrebookings();
  } else {
    $("#login-section").removeClass("d-none");
  }

  // 🧭 "Manage EV Models" button click → go to new page
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

// ✅ Login
$("#admin-login-form").on("submit", function (e) {
  e.preventDefault();

  const username = $("#username").val().trim();
  const password = $("#password").val().trim();

  if (!username || !password) {
    alert("⚠️ Please enter both username and password.");
    return;
  }

  $.ajax({
    url: "login",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ username, password }),
    success: function () {
      alert("✅ Login successful!");

      // 🔐 Save session locally
      sessionStorage.setItem('isAdminLoggedIn', 'true');

      // Show admin panel
      showAdminPanel();
      loadPrebookings();
    },
    error: function (err) {
      alert("❌ Login failed: " + (err.responseText || "Invalid credentials"));
    }
  });
});

// ✅ Logout
$("#logout-btn").click(function () {
  if (confirm("Logout and return to login?")) {
          sessionStorage.removeItem("isAdminLoggedIn");
          $.post("logout", function () {
            window.location.href = loginRedirect;
          });
        }
});

// Load Prebookings
function loadPrebookings() {
  $.get("all_prebookings", function (data) {
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

// Voucher Range Calculator
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

// Voucher Generate
$("#voucherForm").on("submit", function (e) {
  e.preventDefault();

  const receiptStart = $("#receiptStart").val().trim();
  const receiptEnd = $("#receiptEnd").val().trim();
  const couponStart = $("#couponStart").val().trim();
  const couponEnd = $("#couponEnd").val().trim();

  $.ajax({
    url: "vouchers_generate",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ receiptStart, receiptEnd, couponStart, couponEnd }),
    success: function (response) {
      $("#voucherStatus").html(`<div class="alert alert-success">${response}</div>`);
    },
    error: function (xhr) {
      $("#voucherStatus").html(`<div class="alert alert-danger">Error: ${xhr.responseText}</div>`);
    }
  });
});

// Load Unused Vouchers
$("#load-unused-btn").on("click", function () {
  $.get("unused_vouchers", function (data) {
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

// 🔑 Delete Vouchers
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
    url: "delete_vouchers",
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

// ✅ Select All checkbox functionality with max 10 limit
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

// ✅ Individual checkbox logic
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
